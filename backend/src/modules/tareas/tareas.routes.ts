import type { Router, Request } from "express";
import { wrapActionAsRouteHandler } from "../../helpers/routeHelper";
import {
	listTareas,
	getTarea,
	createTarea,
	updateTarea,
	updateTareaEstado,
	deleteTarea,
	reordenarTareasKanban,
} from "./tareas.service";
import type {
	TareaCreateInput,
	TareaUpdateInput,
	TareaListInput,
	TareaEstadoUpdateInput,
	TareaReordenKanbanInput,
} from "./tareas.schemas";

export const createTareasRouter = (app: Router): void => {
	app.get(
		"/listTareas",
		wrapActionAsRouteHandler(
			listTareas,
			(req: Request) => req.query as unknown as TareaListInput
		)
	);

	app.get(
		"/getTarea/:id",
		wrapActionAsRouteHandler(getTarea, (req: Request) => ({
			id: req.params.id,
		}))
	);

	app.post(
		"/createTarea",
		wrapActionAsRouteHandler(
			createTarea,
			(req: Request) => req.body as TareaCreateInput,
			{ okStatus: 201 }
		)
	);

	app.put(
		"/updateTarea/:id",
		wrapActionAsRouteHandler(
			updateTarea,
			(req: Request) =>
				({
					id: Number(req.params.id),
					...(req.body as object),
				} as TareaUpdateInput),
			{ okStatus: 204 }
		)
	);

	app.patch(
		"/updateTareaEstado/:id",
		wrapActionAsRouteHandler(
			updateTareaEstado,
			(req: Request) =>
				({
					id: Number(req.params.id),
					estado: (req.body as any).estado,
				} as TareaEstadoUpdateInput),
			{ okStatus: 204 }
		)
	);

	app.delete(
		"/deleteTarea/:id",
		wrapActionAsRouteHandler(
			deleteTarea,
			(req: Request) => ({
				id: req.params.id,
				hard: (req.query as any).hard !== "0",
			}),
			{ okStatus: 204 }
		)
	);

	app.put(
		"/reordenarTareasKanban",
		wrapActionAsRouteHandler(
			reordenarTareasKanban,
			(req: Request) => req.body as TareaReordenKanbanInput,
			{ okStatus: 204 }
		)
	);
};
