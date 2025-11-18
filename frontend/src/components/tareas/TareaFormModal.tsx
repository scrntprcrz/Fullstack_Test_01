import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { type ColaboradorOption } from "../../domain/tareas";

export type TareaFormValues = {
	titulo: string;
	descripcion?: string;
	estado: "pendiente" | "en_progreso" | "completada";
	prioridad: "baja" | "media" | "alta";
	asignadoId?: string;
	fechaInicio?: string;
	fechaVencimiento?: string;
};

type Props = {
	isOpen: boolean;
	titulo: string;
	isFormLoading: boolean;
	isSaving: boolean;
	colaboradores: ColaboradorOption[];
	register: UseFormRegister<TareaFormValues>;
	errors: FieldErrors<TareaFormValues>;
	onClose: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const TareaFormModal = ({
	isOpen,
	titulo,
	isFormLoading,
	isSaving,
	colaboradores,
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
										La tarea se creará dentro del proyecto
										seleccionado.
									</p>
								</div>

								<form
									onSubmit={onSubmit}
									className="space-y-3 px-4 py-3 text-xs"
								>
									{isFormLoading && (
										<div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
											Cargando datos de la tarea...
										</div>
									)}

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Título
										</label>
										<input
											type="text"
											autoComplete="off"
											{...register("titulo")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.titulo && (
											<p className="text-[11px] text-red-600">
												{errors.titulo.message}
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
												Estado
											</label>
											<select
												{...register("estado")}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											>
												<option value="pendiente">
													Pendiente
												</option>
												<option value="en_progreso">
													En progreso
												</option>
												<option value="completada">
													Completada
												</option>
											</select>
											{errors.estado && (
												<p className="text-[11px] text-red-600">
													{errors.estado.message}
												</p>
											)}
										</div>
										<div className="space-y-1">
											<label className="block font-medium text-slate-700">
												Prioridad
											</label>
											<select
												{...register("prioridad")}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											>
												<option value="alta">
													Alta
												</option>
												<option value="media">
													Media
												</option>
												<option value="baja">
													Baja
												</option>
											</select>
											{errors.prioridad && (
												<p className="text-[11px] text-red-600">
													{errors.prioridad.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Asignado a
										</label>
										<select
											{...register("asignadoId")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={
												isFormLoading ||
												isSaving ||
												colaboradores.length === 0
											}
										>
											<option value="">
												Sin asignar
											</option>
											{colaboradores.map((c) => (
												<option
													key={c.usuarioId}
													value={c.usuarioId}
												>
													{c.nombreCompleto} (
													{c.usuario})
												</option>
											))}
										</select>
										{errors.asignadoId && (
											<p className="text-[11px] text-red-600">
												{errors.asignadoId.message}
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
												Fecha vencimiento
											</label>
											<input
												type="date"
												{...register(
													"fechaVencimiento"
												)}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											/>
											{errors.fechaVencimiento && (
												<p className="text-[11px] text-red-600">
													{
														errors.fechaVencimiento
															.message
													}
												</p>
											)}
										</div>
									</div>

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
