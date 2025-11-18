import express, { type RequestHandler, type Router } from "express";
import { requireAuth } from "../auth/middleware";
import { createDashboardRouter } from "./dashboard/dashboard.routes";
import { createProfilesRouter } from "./perfiles/perfiles.routes";
import { createProyectosRouter } from "./proyectos/proyectos.routes";
import { createTareasRouter } from "./tareas/tareas.routes";
import { createUsersRouter } from "./usuarios/usuarios.routes";

export const createApiRouter = (): Router => {
	const api = express.Router();
	api.use(requireAuth as RequestHandler);

	createUsersRouter(api);
	createProfilesRouter(api);
	createDashboardRouter(api);
	createProyectosRouter(api);
	createTareasRouter(api);
	return api;
};
