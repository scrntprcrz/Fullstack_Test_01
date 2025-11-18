import cors from "cors";
import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import { createAuthRouter } from "./auth/authRoutes";
import { createDevRouter } from "./devRoutes";
import { createDb, useDb } from "./helpers/db";
import { createHttpLogger } from "./helpers/httpLogger";
import {
	buildCorsOptions,
	createApiRateLimiter,
	errorHandler,
	notFoundHandler,
} from "./helpers/routeHelper";
import { createApiRouter } from "./modules/apiRouter";
import swaggerUi from "swagger-ui-express";
import { createOpenApiDocument } from "./core/openapi";

const createApp = (): Application => {
	const app = express() as Application;

	createDb(app);

	app.use(express.json({ limit: "20mb" }));

	const corsOptions = buildCorsOptions();
	app.use(cors(corsOptions));

	const apiRateLimiter = createApiRateLimiter();

	const httpLogger = createHttpLogger();

	app.use(httpLogger);
	app.use(useDb(app));

	app.get("/hello", apiRateLimiter, (req: Request, res: Response) => {
		res.json({ message: "hello" });
	});

	app.get(
		"/health",
		apiRateLimiter,
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const rows = (await req.queryDb("SELECT 1 AS ok")) as any[];
				const okValue =
					(rows[0] as { ok?: number } | undefined)?.ok === 1;
				res.json({ ok: true, db: okValue });
			} catch (e) {
				next(e);
			}
		}
	);

	createAuthRouter(app);
	createDevRouter(app);
	app.use("/api", apiRateLimiter, createApiRouter());

	const openApiDocument = createOpenApiDocument();
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

	app.use(notFoundHandler);

	app.use(errorHandler);

	return app;
};

const start = async (): Promise<void> => {
	const port = process.env.PORT ? Number(process.env.PORT) : 3000;
	const app = createApp();
	await app.locals.queryDb("SELECT 1");
	app.listen(port, () => {
		console.log(`listening on :${port}`);
	});
};

void start();
