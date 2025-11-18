import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { http } from "../api/http";

import {
	buildDashboardParams,
	buildResumenActividad,
	buildTareasAsignadasPieData,
	buildTareasPorEstadoBarData,
} from "../domain/dashboard";
import type { DashboardApiResponse, DashboardStats } from "../domain/dashboard";

import { DashboardSummaryCards } from "../components/dashboard/DashboardSummaryCards";
import { TareasPorEstadoChart } from "../components/dashboard/TareasPorEstadoChart";
import { TareasAsignadasPieChart } from "../components/dashboard/TareasAsignadasPieChart";
import { DashboardResumenSection } from "../components/dashboard/DashboardResumenSection";

export const DashboardPage = () => {
	const { auth } = useAuth();
	const empresaId = auth.user?.empresaId ?? null;
	const usuarioId = auth.user?.id ?? null;

	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!usuarioId) return;

		const fetchStats = async () => {
			setIsLoading(true);
			try {
				const params = buildDashboardParams(usuarioId, empresaId);
				const response = await http.get<DashboardApiResponse>(
					"/dashboardEstadisticasUsuario",
					{ params }
				);
				setStats(response.data);
			} catch {
				toast.error("No se pudieron cargar las estadísticas");
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, [usuarioId, empresaId]);

	const resumen = useMemo(() => buildResumenActividad(stats), [stats]);

	const tareasPorEstadoData = useMemo(
		() =>
			stats
				? buildTareasPorEstadoBarData(stats.tareasPorEstado)
				: [
						{ estado: "Pendiente", cantidad: 0 },
						{ estado: "En progreso", cantidad: 0 },
						{ estado: "Completada", cantidad: 0 },
				  ],
		[stats]
	);

	const tareasAsignadasData = useMemo(
		() =>
			stats
				? buildTareasAsignadasPieData(
						stats.totalTareas,
						stats.totalTareasAsignadas
				  )
				: [
						{ name: "Asignadas a mí", value: 0 },
						{ name: "Otras tareas", value: 0 },
				  ],
		[stats]
	);

	const totalProyectos = stats?.totalProyectos ?? 0;
	const totalTareas = stats?.totalTareas ?? 0;

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4">
			<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold text-slate-800">
						Dashboard
					</h1>
					<p className="text-xs text-slate-500">
						Resumen de tu actividad en proyectos y tareas.
					</p>
				</div>

				{auth.user && (
					<div className="text-right text-[11px] text-slate-500">
						<p>
							Usuario:{" "}
							<span className="font-medium text-slate-700">
								{auth.user.nombreCompleto}
							</span>
						</p>
						<p>
							Empresa ID:{" "}
							<span className="font-medium text-slate-700">
								{auth.user.empresaId ?? "-"}
							</span>
						</p>
					</div>
				)}
			</div>

			{!usuarioId && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
					No se encontró el usuario en la sesión.
				</div>
			)}

			{usuarioId && (
				<>
					{isLoading && (
						<div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
							Cargando estadísticas...
						</div>
					)}

					{!isLoading && (
						<>
							<DashboardSummaryCards
								totalProyectos={totalProyectos}
								totalTareas={totalTareas}
								tareasAbiertas={resumen.tareasAbiertas}
								totalTareasAsignadas={
									stats?.totalTareasAsignadas ?? 0
								}
								porcentajeAsignadas={
									resumen.porcentajeAsignadas
								}
							/>

							<div className="grid gap-3 lg:grid-cols-2">
								<TareasPorEstadoChart
									data={tareasPorEstadoData}
									porcentajeCompletadas={
										resumen.porcentajeCompletadas
									}
								/>
								<TareasAsignadasPieChart
									data={tareasAsignadasData}
								/>
							</div>

							<DashboardResumenSection
								totalProyectos={totalProyectos}
								tareasAbiertas={resumen.tareasAbiertas}
								porcentajeCompletadas={
									resumen.porcentajeCompletadas
								}
								tareasSinAsignarAOtro={
									resumen.tareasSinAsignarAOtro
								}
							/>
						</>
					)}
				</>
			)}
		</div>
	);
};
