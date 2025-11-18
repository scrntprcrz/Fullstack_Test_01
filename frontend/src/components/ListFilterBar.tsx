import { type FormEvent, type ReactNode } from "react";

type ListFilterBarProps = {
	searchLabel?: string;
	searchPlaceholder?: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
	filters?: ReactNode;
};

export const ListFilterBar = ({
	searchLabel = "Búsqueda",
	searchPlaceholder = "",
	searchValue,
	onSearchChange,
	onSubmit,
	onReset,
	filters,
}: ListFilterBarProps) => {
	return (
		<div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
			<form onSubmit={onSubmit} className="flex flex-col gap-3">
				<div className="flex flex-col gap-1">
					<label className="text-[11px] font-medium text-slate-700">
						{searchLabel}
					</label>
					<input
						type="text"
						value={searchValue}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder={searchPlaceholder}
						className="block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
					/>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					{filters && (
						<div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700">
							{filters}
						</div>
					)}

					<div className="flex items-center gap-2 self-end sm:self-auto">
						<button
							type="submit"
							className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
						>
							Aplicar filtros
						</button>
						<button
							type="button"
							onClick={onReset}
							className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
						>
							Limpiar
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};
