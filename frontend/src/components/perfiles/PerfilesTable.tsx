import { formatDateTime } from "../../domain/perfiles";
import type { PerfilItem } from "../../domain/perfiles";

type Props = {
	perfiles: PerfilItem[];
	onEditar: (perfil: PerfilItem) => void;
	onToggleEstado: (perfil: PerfilItem) => void;
	onEliminar: (perfil: PerfilItem) => void;
};

export const PerfilesTable = ({
	perfiles,
	onEditar,
	onToggleEstado,
	onEliminar,
}: Props) => {
	const hayPerfiles = perfiles.length > 0;

	if (!hayPerfiles) {
		return (
			<div className="px-4 py-3 text-sm text-slate-500">
				No hay perfiles registrados para esta empresa.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
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
							Descripción
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Sistema
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Estado
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Actualizado
						</th>
						<th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Acciones
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-100 bg-white">
					{perfiles.map((p) => (
						<tr key={p.id}>
							<td className="px-3 py-2 font-medium text-slate-800">
								{p.codigo}
							</td>
							<td className="px-3 py-2 text-slate-700">
								{p.nombre}
							</td>
							<td className="px-3 py-2 text-slate-600">
								{p.descripcion}
							</td>
							<td className="px-3 py-2">
								<span
									className={
										p.esSistema
											? "inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700"
											: "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
									}
								>
									{p.esSistema ? "Sistema" : "Normal"}
								</span>
							</td>
							<td className="px-3 py-2">
								<span
									className={
										p.isActive
											? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
											: "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
									}
								>
									{p.isActive ? "Activo" : "Inactivo"}
								</span>
							</td>
							<td className="px-3 py-2 text-slate-500">
								{formatDateTime(p.updatedAt)}
							</td>
							<td className="px-3 py-2 text-right">
								<div className="inline-flex items-center gap-2">
									<button
										type="button"
										onClick={() => onEditar(p)}
										className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
									>
										Editar
									</button>
									<button
										type="button"
										onClick={() => onToggleEstado(p)}
										className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
									>
										{p.isActive ? "Desactivar" : "Activar"}
									</button>
									<button
										type="button"
										onClick={() => onEliminar(p)}
										disabled={p.esSistema}
										className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Eliminar
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
