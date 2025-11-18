import type { Router, Request } from "express";
import { wrapActionAsRouteHandler } from "../../helpers/routeHelper";
import {
	listPerfiles,
	getPerfil,
	createPerfil,
	updatePerfil,
	updatePerfilEstado,
	deletePerfil,
} from "./perfiles.service";
import type { CreateInput, UpdateInput, ListInput } from "./perfiles.schemas";

export const createProfilesRouter = (app: Router): void => {
	app.get(
		"/listPerfiles",
		wrapActionAsRouteHandler(
			listPerfiles,
			(req: Request) => req.query as unknown as ListInput
		)
	);

	app.get(
		"/getPerfil/:id",
		wrapActionAsRouteHandler(getPerfil, (req: Request) => ({
			id: req.params.id,
		}))
	);

	app.post(
		"/createPerfil",
		wrapActionAsRouteHandler(
			createPerfil,
			(req: Request) => req.body as CreateInput,
			{ okStatus: 201 }
		)
	);

	app.put(
		"/updatePerfil/:id",
		wrapActionAsRouteHandler(
			updatePerfil,
			(req: Request) =>
				({ id: req.params.id, ...(req.body as object) } as UpdateInput),
			{ okStatus: 204 }
		)
	);

	app.patch(
		"/updatePerfilEstado/:id",
		wrapActionAsRouteHandler(
			updatePerfilEstado,
			(req: Request) => ({
				id: req.params.id,
				isActive: Boolean((req.body as any).isActive),
			}),
			{ okStatus: 204 }
		)
	);

	app.delete(
		"/deletePerfil/:id",
		wrapActionAsRouteHandler(
			deletePerfil,
			(req: Request) => ({
				id: req.params.id,
				hard: req.query.hard === "1",
			}),
			{ okStatus: 204 }
		)
	);
};
