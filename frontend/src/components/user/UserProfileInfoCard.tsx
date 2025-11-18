type Props = {
	nombreCompleto?: string | null;
	usuario?: string | null;
	correo?: string | null;
	empresaId?: number | string | null;
};

export const UserProfileInfoCard = ({
	nombreCompleto,
	usuario,
	correo,
	empresaId,
}: Props) => {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
			<dl className="grid gap-6 text-sm text-slate-900 sm:grid-cols-2">
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
						Nombre completo
					</dt>
					<dd className="mt-1">{nombreCompleto || "—"}</dd>
				</div>
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
						Usuario
					</dt>
					<dd className="mt-1">{usuario || "—"}</dd>
				</div>
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
						Correo
					</dt>
					<dd className="mt-1">{correo || "—"}</dd>
				</div>
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
						Empresa ID
					</dt>
					<dd className="mt-1">
						{empresaId !== null &&
						empresaId !== undefined &&
						empresaId !== ""
							? empresaId
							: "—"}
					</dd>
				</div>
			</dl>
		</div>
	);
};
