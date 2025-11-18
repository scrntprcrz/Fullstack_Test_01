import type { Router, Request } from "express";
import { wrapActionAsRouteHandler } from "../../helpers/routeHelper";
import {
	listUsuarios,
	getUsuario,
	createUsuario,
	updateUsuario,
	updateUsuarioEstado,
	updateUsuarioPerfiles,
	deleteUsuario,
} from "./usuarios.service";
import type {
	ListInput,
	CreateInput,
	UpdateInput,
	ProfilesAssignInput,
} from "./usuarios.schemas";

export const createUsersRouter = (app: Router): void => {
	app.get(
		"/listUsuarios",
		wrapActionAsRouteHandler(
			listUsuarios,
			(req: Request) => req.query as unknown as ListInput
		)
	);

	app.get(
		"/getUsuario/:id",
		wrapActionAsRouteHandler(getUsuario, (req: Request) => ({
			id: req.params.id,
		}))
	);

	app.post(
		"/createUsuario",
		wrapActionAsRouteHandler(
			createUsuario,
			(req: Request) => req.body as CreateInput,
			{ okStatus: 201 }
		)
	);

	app.put(
		"/updateUsuario/:id",
		wrapActionAsRouteHandler(
			updateUsuario,
			(req: Request) => ({
				...(req.body as UpdateInput),
				id: req.params.id,
			}),
			{ okStatus: 204 }
		)
	);

	app.patch(
		"/updateUsuarioEstado/:id",
		wrapActionAsRouteHandler(
			updateUsuarioEstado,
			(req: Request) => ({
				id: req.params.id,
				isActive: Boolean((req.body as any).isActive),
			}),
			{ okStatus: 204 }
		)
	);

	app.delete(
		"/deleteUsuario/:id",
		wrapActionAsRouteHandler(
			deleteUsuario,
			(req: Request) => ({
				id: req.params.id,
				hard: req.query.hard === "1",
			}),
			{ okStatus: 204 }
		)
	);

	app.put(
		"/updateUsuarioPerfiles",
		wrapActionAsRouteHandler(
			updateUsuarioPerfiles,
			(req: Request) => req.body as ProfilesAssignInput,
			{ okStatus: 204 }
		)
	);
};
