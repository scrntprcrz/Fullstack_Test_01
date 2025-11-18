import { formatDate } from "../../domain/proyectos";
import type { ProyectoListItem } from "../../domain/proyectos";

type Props = {
	proyectos: ProyectoListItem[];
	totalProyectos: number;
	paginaActual: number;
	totalPaginas: number;
	onEditar: (proyecto: ProyectoListItem) => void;
	onEliminar: (proyecto: ProyectoListItem) => void;
	onPaginaAnterior: () => void;
	onPaginaSiguiente: () => void;
	puedeGestionarProyecto: (proyecto: ProyectoListItem) => boolean;
	onGestionarColaboradores: (proyecto: ProyectoListItem) => void;
};

export const ProyectosTable = ({
	proyectos,
	totalProyectos,
	paginaActual,
	totalPaginas,
	onEditar,
	onEliminar,
	onPaginaAnterior,
	onPaginaSiguiente,
	puedeGestionarProyecto,
	onGestionarColaboradores,
}: Props) => {
	return (
		<div className="px-4 py-3">
			<div className="overflow-x-auto rounded-md border border-slate-200">
				<table className="min-w-full divide-y divide-slate-200 text-xs">
					<thead className="bg-slate-50">
						<tr>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Código
							</th>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Nombre
							</th>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Creador
							</th>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Estado
							</th>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Fechas
							</th>
							<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Creado
							</th>
							<th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 bg-white">
						{proyectos.map((p) => {
							const puedeGestionar = puedeGestionarProyecto(p);
							return (
								<tr key={p.id}>
									<td className="px-3 py-2 font-mono text-[11px] text-slate-700">
										{p.codigo}
									</td>
									<td className="px-3 py-2 text-slate-800">
										<div className="flex flex-col">
											<span className="text-xs font-medium">
												{p.nombre}
											</span>
											{p.descripcion && (
												<span className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
													{p.descripcion}
												</span>
											)}
										</div>
									</td>
									<td className="px-3 py-2 text-slate-700">
										<div className="flex flex-col">
											<span className="text-xs">
												{p.creador.nombreCompleto}
											</span>
											<span className="text-[11px] text-slate-500">
												{p.creador.usuario}
											</span>
										</div>
									</td>
									<td className="px-3 py-2">
										<span
											className={
												p.isArchivado
													? "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
													: "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
											}
										>
											{p.isArchivado
												? "Archivado"
												: "Activo"}
										</span>
									</td>
									<td className="px-3 py-2 text-slate-700">
										<div className="flex flex-col">
											<span className="text-[11px]">
												Inicio:{" "}
												{formatDate(p.fechaInicio)}
											</span>
											<span className="text-[11px]">
												Fin: {formatDate(p.fechaFin)}
											</span>
										</div>
									</td>
									<td className="px-3 py-2 text-[11px] text-slate-600">
										{formatDate(p.createdAt)}
									</td>
									<td className="px-3 py-2 text-right">
										<div className="inline-flex flex-wrap items-center justify-end gap-2">
											<button
												type="button"
												onClick={() =>
													onGestionarColaboradores(p)
												}
												disabled={!puedeGestionar}
												className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
											>
												Colaboradores
											</button>
											<button
												type="button"
												onClick={() => onEditar(p)}
												disabled={!puedeGestionar}
												className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
											>
												Editar
											</button>
											<button
												type="button"
												onClick={() => onEliminar(p)}
												disabled={!puedeGestionar}
												className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
											>
												Eliminar
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
				<div>
					Mostrando {proyectos.length} de {totalProyectos} proyectos
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onPaginaAnterior}
						disabled={paginaActual <= 1}
						className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Anterior
					</button>
					<span>
						Página {paginaActual} de {totalPaginas}
					</span>
					<button
						type="button"
						onClick={onPaginaSiguiente}
						disabled={paginaActual >= totalPaginas}
						className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Siguiente
					</button>
				</div>
			</div>
		</div>
	);
};
