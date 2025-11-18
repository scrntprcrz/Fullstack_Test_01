import { formatDateTime } from "../../domain/usuarios";
import type { UsuarioListItem } from "../../domain/usuarios";

type Props = {
	usuarios: UsuarioListItem[];
	onEditar: (usuario: UsuarioListItem) => void;
	onToggleEstado: (usuario: UsuarioListItem) => void;
	onEliminar: (usuario: UsuarioListItem) => void;
};

export const UsuariosTable = ({
	usuarios,
	onEditar,
	onToggleEstado,
	onEliminar,
}: Props) => {
	const hayUsuarios = usuarios.length > 0;

	if (!hayUsuarios) {
		return (
			<div className="px-4 py-3 text-sm text-slate-500">
				No hay usuarios registrados para esta empresa.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-slate-200 text-xs">
				<thead className="bg-slate-50">
					<tr>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Usuario
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Nombre
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Correo
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Superadmin
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Estado
						</th>
						<th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Último acceso
						</th>
						<th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
							Acciones
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-100 bg-white">
					{usuarios.map((u) => (
						<tr key={u.id}>
							<td className="px-3 py-2 font-medium text-slate-800">
								{u.usuario}
							</td>
							<td className="px-3 py-2 text-slate-700">
								{u.nombreCompleto}
							</td>
							<td className="px-3 py-2 text-slate-600">
								{u.correo}
							</td>
							<td className="px-3 py-2">
								<span
									className={
										u.esSuperadmin
											? "inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700"
											: "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
									}
								>
									{u.esSuperadmin ? "Sí" : "No"}
								</span>
							</td>
							<td className="px-3 py-2">
								<span
									className={
										u.isActive
											? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
											: "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
									}
								>
									{u.isActive ? "Activo" : "Inactivo"}
								</span>
							</td>
							<td className="px-3 py-2 text-slate-500">
								{formatDateTime(u.lastLoginAt)}
							</td>
							<td className="px-3 py-2 text-right">
								<div className="inline-flex items-center gap-2">
									<button
										type="button"
										onClick={() => onEditar(u)}
										className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
									>
										Editar
									</button>
									<button
										type="button"
										onClick={() => onToggleEstado(u)}
										className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
									>
										{u.isActive ? "Desactivar" : "Activar"}
									</button>
									<button
										type="button"
										onClick={() => onEliminar(u)}
										className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
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
