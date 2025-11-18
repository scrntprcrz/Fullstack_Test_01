type Props = {
	totalProyectos: number;
	tareasAbiertas: number;
	porcentajeCompletadas: number;
	tareasSinAsignarAOtro: number;
};

export const DashboardResumenSection = ({
	totalProyectos,
	tareasAbiertas,
	porcentajeCompletadas,
	tareasSinAsignarAOtro,
}: Props) => {
	return (
		<div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
			<h2 className="text-sm font-semibold text-slate-800">
				Resumen de actividad
			</h2>
			<p className="mt-1 text-xs text-slate-600">
				Este es un resumen rápido de cómo estás trabajando en tus
				proyectos.
			</p>
			<ul className="mt-2 grid gap-2 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
				<li>
					<span className="font-medium text-slate-800">
						{totalProyectos}
					</span>{" "}
					proyectos donde participas.
				</li>
				<li>
					<span className="font-medium text-slate-800">
						{tareasAbiertas}
					</span>{" "}
					tareas abiertas que aún requieren atención.
				</li>
				<li>
					<span className="font-medium text-slate-800">
						{porcentajeCompletadas}%
					</span>{" "}
					de tus tareas ya están completadas.
				</li>
				<li>
					<span className="font-medium text-slate-800">
						{tareasSinAsignarAOtro}
					</span>{" "}
					tareas no están asignadas directamente a ti.
				</li>
			</ul>
		</div>
	);
};
