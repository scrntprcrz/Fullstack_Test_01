import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { PerfilItem } from "../../domain/usuarios";

export type UsuarioFormValues = {
	usuario: string;
	nombreCompleto: string;
	correo: string;
	perfilId: string;
	esSuperadmin: boolean;
	isActive: boolean;
	password?: string;
};

type Props = {
	isOpen: boolean;
	titulo: string;
	isFormLoading: boolean;
	isSaving: boolean;
	isLoadingPerfiles: boolean;
	perfiles: PerfilItem[];
	isActiveValue: boolean;
	esSuperadminValue: boolean;
	isEditMode: boolean;
	register: UseFormRegister<UsuarioFormValues>;
	errors: FieldErrors<UsuarioFormValues>;
	onClose: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const UsuarioFormModal = ({
	isOpen,
	titulo,
	isFormLoading,
	isSaving,
	isLoadingPerfiles,
	perfiles,
	isActiveValue,
	esSuperadminValue,
	isEditMode,
	register,
	errors,
	onClose,
	onSubmit,
}: Props) => {
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
										{titulo}
									</Dialog.Title>
									<p className="mt-0.5 text-[11px] text-slate-500">
										La empresa se toma automáticamente desde
										tu sesión.
									</p>
								</div>

								<form
									onSubmit={onSubmit}
									className="space-y-3 px-4 py-3 text-xs"
								>
									{isFormLoading && (
										<div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
											Cargando datos del usuario...
										</div>
									)}

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Usuario
										</label>
										<input
											type="text"
											autoComplete="off"
											{...register("usuario")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.usuario && (
											<p className="text-[11px] text-red-600">
												{errors.usuario.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Nombre completo
										</label>
										<input
											type="text"
											autoComplete="off"
											{...register("nombreCompleto")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.nombreCompleto && (
											<p className="text-[11px] text-red-600">
												{errors.nombreCompleto.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Correo
										</label>
										<input
											type="email"
											autoComplete="off"
											{...register("correo")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={isFormLoading || isSaving}
										/>
										{errors.correo && (
											<p className="text-[11px] text-red-600">
												{errors.correo.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Perfil principal
										</label>
										<select
											{...register("perfilId")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											disabled={
												isFormLoading ||
												isSaving ||
												isLoadingPerfiles
											}
										>
											<option value="">
												{isLoadingPerfiles
													? "Cargando perfiles..."
													: "Selecciona un perfil"}
											</option>
											{perfiles.map((p) => (
												<option key={p.id} value={p.id}>
													{p.codigo} - {p.nombre}
												</option>
											))}
										</select>
										{errors.perfilId && (
											<p className="text-[11px] text-red-600">
												{errors.perfilId.message}
											</p>
										)}
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Contraseña
										</label>
										<input
											type="password"
											autoComplete="new-password"
											{...register("password")}
											className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
											placeholder={
												isEditMode
													? "Déjalo vacío para no cambiarla"
													: "Contraseña temporal del usuario"
											}
											disabled={isFormLoading || isSaving}
										/>
										{errors.password && (
											<p className="text-[11px] text-red-600">
												{errors.password.message}
											</p>
										)}
										{isEditMode && (
											<p className="text-[10px] text-slate-500">
												Si no ingresas nada, se mantiene
												la contraseña actual.
											</p>
										)}
									</div>

									<div className="flex items-center justify-between gap-4 pt-1">
										<div className="flex items-center gap-2">
											<input
												id="isActive"
												type="checkbox"
												{...register("isActive")}
												className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											/>
											<label
												htmlFor="isActive"
												className="text-xs text-slate-700"
											>
												Usuario activo
											</label>
										</div>
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-2">
												<input
													id="esSuperadmin"
													type="checkbox"
													{...register(
														"esSuperadmin"
													)}
													className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
													disabled={
														isFormLoading ||
														isSaving
													}
												/>
												<label
													htmlFor="esSuperadmin"
													className="text-xs text-slate-700"
												>
													Superadmin
												</label>
											</div>
											<span className="text-[11px] text-slate-500">
												Estado:{" "}
												{isActiveValue
													? "Activo"
													: "Inactivo"}{" "}
												·{" "}
												{esSuperadminValue
													? "Superadmin"
													: "Usuario normal"}
											</span>
										</div>
									</div>

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
