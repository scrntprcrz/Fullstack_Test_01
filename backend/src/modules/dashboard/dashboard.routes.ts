import type { Router, Request } from "express";
import { wrapActionAsRouteHandler } from "../../helpers/routeHelper";
import { getDashboardEstadisticasUsuario } from "./dashboard.service";
import type { DashboardStatsInput } from "./dashboard.schemas";

export const createDashboardRouter = (app: Router): void => {
	app.get(
		"/dashboardEstadisticasUsuario",
		wrapActionAsRouteHandler(
			getDashboardEstadisticasUsuario,
			(req: Request) => req.query as unknown as DashboardStatsInput
		)
	);
};
