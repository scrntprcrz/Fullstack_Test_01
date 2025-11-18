import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

export type ProyectoFormValues = {
	codigo: string;
	nombre: string;
	descripcion?: string;
	fechaInicio?: string;
	fechaFin?: string;
	isArchivado: boolean;
};

type Props = {
	isOpen: boolean;
	titulo: string;
	isFormLoading: boolean;
	isSaving: boolean;
	isEditMode: boolean;
	isArchivadoValue: boolean;
	register: UseFormRegister<ProyectoFormValues>;
	errors: FieldErrors<ProyectoFormValues>;
	onClose: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const ProyectoFormModal = ({
	isOpen,
	titulo,
	isFormLoading,
	isSaving,
	isEditMode,
	isArchivadoValue,
	register,
	errors,
	onClose,
	onSubmit,
}: Props) => {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
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
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-100"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
								<div className="border-b border-slate-200 px-4 py-3">
									<Dialog.Title className="text-sm font-semibold text-slate-800">
										{titulo}
									</Dialog.Title>
									<p className="mt-0.5 text-[11px] text-slate-500">
										La empresa y el creador se toman
										automáticamente desde tu sesión.
									</p>
								</div>

								<form
									onSubmit={onSubmit}
									className="space-y-3 px-4 py-3 text-xs"
								>
									{isFormLoading && (
										<div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
											Cargando datos del proyecto...
										</div>
									)}

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Código
										</label>
										<input
											type="text"
											autoComplete="off"
											{...register("codigo")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.codigo && (
											<p className="text-[11px] text-red-600">
												{errors.codigo.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Nombre
										</label>
										<input
											type="text"
											autoComplete="off"
											{...register("nombre")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.nombre && (
											<p className="text-[11px] text-red-600">
												{errors.nombre.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Descripción
										</label>
										<textarea
											rows={3}
											{...register("descripcion")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.descripcion && (
											<p className="text-[11px] text-red-600">
												{errors.descripcion.message}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<div className="space-y-1">
											<label className="block font-medium text-slate-700">
												Fecha inicio
											</label>
											<input
												type="date"
												{...register("fechaInicio")}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											/>
											{errors.fechaInicio && (
												<p className="text-[11px] text-red-600">
													{errors.fechaInicio.message}
												</p>
											)}
										</div>
										<div className="space-y-1">
											<label className="block font-medium text-slate-700">
												Fecha fin
											</label>
											<input
												type="date"
												{...register("fechaFin")}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											/>
											{errors.fechaFin && (
												<p className="text-[11px] text-red-600">
													{errors.fechaFin.message}
												</p>
											)}
										</div>
									</div>

									{isEditMode && (
										<div className="space-y-1">
											<label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
												<input
													type="checkbox"
													{...register("isArchivado")}
													className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
													disabled={
														isFormLoading ||
														isSaving
													}
												/>
												<span>
													Marcar como archivado
													{isArchivadoValue
														? " (archivado)"
														: ""}
												</span>
											</label>
										</div>
									)}

									<div className="mt-4 flex items-center justify-end gap-2">
										<button
											type="button"
											onClick={onClose}
											disabled={isSaving}
											className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Cancelar
										</button>
										<button
											type="submit"
											disabled={isSaving || isFormLoading}
											className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isSaving
												? "Guardando..."
												: "Guardar"}
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
