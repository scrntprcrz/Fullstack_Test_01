import {
	calcularProgresoTarea,
	estados,
	formatDate,
	type TareaEstado,
	type TareaListItem,
	type TareaPrioridad,
} from "../../domain/tareas";

type Props = {
	tareas: TareaListItem[];
	onEdit: (tarea: TareaListItem) => void;
	onDelete: (tarea: TareaListItem) => void;
};

const getEstadoLabel = (estado: TareaEstado) => {
	if (estado === "pendiente") return "Pendiente";
	if (estado === "en_progreso") return "En progreso";
	return "Completada";
};

const tareaBadgePrioridad = (prioridad: TareaPrioridad) => {
	if (prioridad === "alta") {
		return (
			<span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
				Alta
			</span>
		);
	}
	if (prioridad === "baja") {
		return (
			<span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
				Baja
			</span>
		);
	}
	return (
		<span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
			Media
		</span>
	);
};

export const TareasKanbanBoard = ({ tareas, onEdit, onDelete }: Props) => {
	const sortFn = (a: TareaListItem, b: TareaListItem) => {
		if (a.ordenKanban !== b.ordenKanban) {
			return a.ordenKanban - b.ordenKanban;
		}
		return a.id - b.id;
	};

	const columnasKanban = {
		pendiente: tareas
			.filter((t) => t.estado === "pendiente")
			.slice()
			.sort(sortFn),
		en_progreso: tareas
			.filter((t) => t.estado === "en_progreso")
			.slice()
			.sort(sortFn),
		completada: tareas
			.filter((t) => t.estado === "completada")
			.slice()
			.sort(sortFn),
	};

	return (
		<div className="px-4 py-3">
			<div className="grid gap-3 md:grid-cols-3">
				{estados.map((estado) => {
					const items =
						columnasKanban[estado as keyof typeof columnasKanban];
					return (
						<div
							key={estado}
							className="kanban-column select-none flex min-h-[220px] flex-col rounded-md bg-slate-50 p-2"
							data-estado={estado}
						>
							<div className="mb-2 flex items-center justify-between px-1">
								<div className="flex items-center gap-1.5">
									<span className="text-xs font-semibold text-slate-700">
										{getEstadoLabel(estado as TareaEstado)}
									</span>
									<span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
										{items.length}
									</span>
								</div>
							</div>
							<div className="flex flex-1 flex-col gap-2">
								{items.map((tarea) => {
									const progreso = calcularProgresoTarea(
										tarea.fechaInicio,
										tarea.fechaVencimiento
									);

									return (
										<div
											key={tarea.id}
											className="kanban-card select-none cursor-move rounded-md border border-slate-200 bg-white p-2 text-xs shadow-sm transition hover:border-slate-400"
											data-id={tarea.id}
											onDoubleClick={() => onEdit(tarea)}
										>
											<div className="mb-1 flex items-start justify-between gap-2">
												<div className="flex-1">
													<p className="text-xs font-semibold text-slate-800">
														{tarea.titulo}
													</p>
													{tarea.descripcion && (
														<p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
															{tarea.descripcion}
														</p>
													)}
												</div>
												{tareaBadgePrioridad(
													tarea.prioridad
												)}
											</div>

											{progreso && (
												<div className="mt-2">
													<div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500">
														<span>Progreso</span>
														<span>
															{
																progreso.porcentaje
															}
															%
														</span>
													</div>
													<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
														<div
															className={`h-full rounded-full ${
																progreso.retrasada
																	? "bg-red-500"
																	: "bg-sky-500"
															}`}
															style={{
																width: `${progreso.porcentaje}%`,
															}}
														/>
													</div>
												</div>
											)}

											<div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
												{tarea.asignado && (
													<span>
														{
															tarea.asignado
																.nombreCompleto
														}
													</span>
												)}
												{tarea.fechaVencimiento && (
													<span>
														Vence:{" "}
														{formatDate(
															tarea.fechaVencimiento
														)}
													</span>
												)}
											</div>
											<div className="mt-2 flex items-center justify-end gap-1">
												<button
													type="button"
													onClick={() =>
														onEdit(tarea)
													}
													className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
												>
													Editar
												</button>
												<button
													type="button"
													onClick={() =>
														onDelete(tarea)
													}
													className="rounded border border-red-200 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-50"
												>
													Eliminar
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
