import { Fragment } from "react";
import type { FormEvent } from "react";
import { Dialog, Transition } from "@headlessui/react";

type UsuarioOption = {
	id: number;
	label: string;
};

type Props = {
	isOpen: boolean;
	proyectoNombre: string;
	usuarios: UsuarioOption[];
	selectedUsuarioId: string;
	isLoadingUsuarios: boolean;
	isSaving: boolean;
	onClose: () => void;
	onUsuarioChange: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const ProyectoColaboradoresModal = ({
	isOpen,
	proyectoNombre,
	usuarios,
	selectedUsuarioId,
	isLoadingUsuarios,
	isSaving,
	onClose,
	onUsuarioChange,
	onSubmit,
}: Props) => {
	const isDisabled = isLoadingUsuarios || isSaving;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-150"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-slate-900/40" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-150"
							enterFrom="opacity-0 translate-y-1 scale-95"
							enterTo="opacity-100 translate-y-0 scale-100"
							leave="ease-in duration-100"
							leaveFrom="opacity-100 translate-y-0 scale-100"
							leaveTo="opacity-0 translate-y-1 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
								<div className="border-b border-slate-200 px-4 py-3">
									<Dialog.Title className="text-sm font-semibold text-slate-800">
										Agregar colaborador
									</Dialog.Title>
									<p className="mt-0.5 text-[11px] text-slate-500">
										Proyecto:{" "}
										<span className="font-semibold">
											{proyectoNombre || "-"}
										</span>
									</p>
								</div>

								<form
									onSubmit={onSubmit}
									className="space-y-3 px-4 py-3 text-xs"
								>
									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Usuario
										</label>
										<select
											value={selectedUsuarioId}
											onChange={(event) =>
												onUsuarioChange(
													event.target.value
												)
											}
											disabled={isDisabled}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
										>
											<option value="">
												{isLoadingUsuarios
													? "Cargando usuarios..."
													: "Selecciona un usuario"}
											</option>
											{usuarios.map((u) => (
												<option key={u.id} value={u.id}>
													{u.label}
												</option>
											))}
										</select>
									</div>

									<p className="text-[11px] text-slate-500">
										Al agregarlo como colaborador, el
										usuario aparecerá en las asignaciones de
										tareas de este proyecto.
									</p>

									<div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
										<button
											type="button"
											onClick={onClose}
											disabled={isSaving}
											className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Cancelar
										</button>
										<button
											type="submit"
											disabled={
												isDisabled || !selectedUsuarioId
											}
											className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isSaving
												? "Agregando..."
												: "Agregar"}
										</button>
									</div>
								</form>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};
