type Props = {
	totalProyectos: number;
	totalTareas: number;
	tareasAbiertas: number;
	totalTareasAsignadas: number;
	porcentajeAsignadas: number;
};

export const DashboardSummaryCards = ({
	totalProyectos,
	totalTareas,
	tareasAbiertas,
	totalTareasAsignadas,
	porcentajeAsignadas,
}: Props) => {
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
				<p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
					Total de proyectos
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-900">
					{totalProyectos}
				</p>
				<p className="mt-1 text-[11px] text-slate-500">
					Donde eres creador o colaborador.
				</p>
			</div>

			<div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
				<p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
					Total de tareas
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-900">
					{totalTareas}
				</p>
				<p className="mt-1 text-[11px] text-slate-500">
					En todos tus proyectos.
				</p>
			</div>

			<div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
				<p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
					Tareas abiertas
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-900">
					{tareasAbiertas}
				</p>
				<p className="mt-1 text-[11px] text-slate-500">
					Pendientes o en progreso.
				</p>
			</div>

			<div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
				<p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
					Tareas asignadas a ti
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-900">
					{totalTareasAsignadas}
				</p>
				<p className="mt-1 text-[11px] text-slate-500">
					{porcentajeAsignadas}% del total de tareas.
				</p>
			</div>
		</div>
	);
};
