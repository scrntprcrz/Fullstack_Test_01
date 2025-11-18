export type TareasPorEstado = {
	pendiente: number;
	enProgreso: number;
	completada: number;
};

export type DashboardStats = {
	totalProyectos: number;
	totalTareas: number;
	tareasPorEstado: TareasPorEstado;
	totalTareasAsignadas: number;
};

export type DashboardApiResponse = DashboardStats;

export type DashboardResumen = {
	tareasAbiertas: number;
	porcentajeCompletadas: number;
	porcentajeAsignadas: number;
	tareasSinAsignarAOtro: number;
};

export type DashboardRequestParams = {
	usuarioId: number;
	empresaId?: number;
};

export type TareasPorEstadoChartItem = {
	estado: string;
	cantidad: number;
};

export type TareasAsignadasPieItem = {
	name: string;
	value: number;
};

export const buildDashboardParams = (
	usuarioId: number,
	empresaId: number | null
): DashboardRequestParams => {
	const params: DashboardRequestParams = {
		usuarioId,
	};
	if (empresaId) {
		params.empresaId = empresaId;
	}
	return params;
};

export const buildTareasPorEstadoBarData = (
	t: TareasPorEstado
): TareasPorEstadoChartItem[] => [
	{ estado: "Pendiente", cantidad: t.pendiente },
	{ estado: "En progreso", cantidad: t.enProgreso },
	{ estado: "Completada", cantidad: t.completada },
];

export const buildTareasAsignadasPieData = (
	totalTareas: number,
	totalTareasAsignadas: number
): TareasAsignadasPieItem[] => {
	const otras = Math.max(totalTareas - totalTareasAsignadas, 0);
	return [
		{ name: "Asignadas a mí", value: totalTareasAsignadas },
		{ name: "Otras tareas", value: otras },
	];
};

export const buildResumenActividad = (
	stats: DashboardStats | null
): DashboardResumen => {
	if (!stats) {
		return {
			tareasAbiertas: 0,
			porcentajeCompletadas: 0,
			porcentajeAsignadas: 0,
			tareasSinAsignarAOtro: 0,
		};
	}

	const tareasAbiertas =
		stats.tareasPorEstado.pendiente + stats.tareasPorEstado.enProgreso;
	const total = stats.totalTareas;
	const completadas = stats.tareasPorEstado.completada;
	const asignadas = stats.totalTareasAsignadas;

	const porcentajeCompletadas =
		total > 0 ? Math.round((completadas / total) * 100) : 0;
	const porcentajeAsignadas =
		total > 0 ? Math.round((asignadas / total) * 100) : 0;
	const tareasSinAsignarAOtro = Math.max(total - asignadas, 0);

	return {
		tareasAbiertas,
		porcentajeCompletadas,
		porcentajeAsignadas,
		tareasSinAsignarAOtro,
	};
};
