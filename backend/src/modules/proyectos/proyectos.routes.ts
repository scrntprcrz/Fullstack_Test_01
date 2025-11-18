import type { Router, Request } from "express";
import { wrapActionAsRouteHandler } from "../../helpers/routeHelper";
import {
	listProyectos,
	getProyecto,
	createProyecto,
	updateProyecto,
	deleteProyecto,
	listProyectoColaboradores,
	addProyectoColaborador,
	removeProyectoColaborador,
} from "./proyectos.service";
import {
	type ProyectoCreateInput,
	type ProyectoUpdateInput,
	type ProyectoListInput,
	type ProyectoColaboradoresListInput,
	type ProyectoColaboradorAssignInput,
} from "./proyectos.schemas";
import { registerProyectosOpenApi } from "./proyectos.docs";

export const createProyectosRouter = (app: Router): void => {
	registerProyectosOpenApi();

	app.get(
		"/listProyectos",
		wrapActionAsRouteHandler(
			listProyectos,
			(req: Request) => req.query as unknown as ProyectoListInput
		)
	);

	app.get(
		"/getProyecto/:id",
		wrapActionAsRouteHandler(getProyecto, (req: Request) => ({
			id: req.params.id,
		}))
	);

	app.post(
		"/createProyecto",
		wrapActionAsRouteHandler(
			createProyecto,
			(req: Request) => req.body as ProyectoCreateInput,
			{ okStatus: 201 }
		)
	);

	app.put(
		"/updateProyecto/:id",
		wrapActionAsRouteHandler(
			updateProyecto,
			(req: Request) =>
				({
					id: Number(req.params.id),
					...(req.body as object),
				} as ProyectoUpdateInput),
			{ okStatus: 204 }
		)
	);

	app.delete(
		"/deleteProyecto/:id",
		wrapActionAsRouteHandler(
			deleteProyecto,
			(req: Request) => ({
				id: req.params.id,
				usuarioId: Number((req.query as any).usuarioId),
				hard: (req.query as any).hard === "1",
			}),
			{ okStatus: 204 }
		)
	);

	app.get(
		"/listProyectoColaboradores/:id",
		wrapActionAsRouteHandler(
			listProyectoColaboradores,
			(req: Request) =>
				({
					proyectoId: Number(req.params.id),
				} as ProyectoColaboradoresListInput)
		)
	);

	app.post(
		"/addProyectoColaborador",
		wrapActionAsRouteHandler(
			addProyectoColaborador,
			(req: Request) => req.body as ProyectoColaboradorAssignInput,
			{ okStatus: 204 }
		)
	);

	app.delete(
		"/removeProyectoColaborador",
		wrapActionAsRouteHandler(
			removeProyectoColaborador,
			(req: Request) => ({
				proyectoId: Number((req.query as any).proyectoId),
				usuarioId: Number((req.query as any).usuarioId),
			}),
			{ okStatus: 204 }
		)
	);
};
