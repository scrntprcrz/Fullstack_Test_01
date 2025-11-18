import { Fragment } from "react";
import type { FormEvent } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { BASE_MENU_CONFIG } from "../../domain/perfiles";
import type { MenuSelectionMap } from "../../domain/perfiles";

export type PerfilFormValues = {
	codigo: string;
	nombre: string;
	descripcion?: string;
	isActive: boolean;
	esSistema: boolean;
};

type Props = {
	isOpen: boolean;
	titulo: string;
	isFormLoading: boolean;
	isSaving: boolean;
	isEditMode: boolean;
	isActiveValue: boolean;
	esSistemaValue: boolean;
	menuSelection: MenuSelectionMap;
	register: UseFormRegister<PerfilFormValues>;
	errors: FieldErrors<PerfilFormValues>;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onToggleOpcionMenu: (codigo: string) => void;
	onSelectAllMenu: () => void;
	onClearMenu: () => void;
};

export const PerfilFormModal = ({
	isOpen,
	titulo,
	isFormLoading,
	isSaving,
	isEditMode,
	isActiveValue,
	esSistemaValue,
	menuSelection,
	register,
	errors,
	onClose,
	onSubmit,
	onToggleOpcionMenu,
	onSelectAllMenu,
	onClearMenu,
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
							<Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
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
											Cargando datos del perfil...
										</div>
									)}

									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										<div className="space-y-1">
											<label className="block font-medium text-slate-700">
												Código
											</label>
											<input
												type="text"
												autoComplete="off"
												{...register("codigo")}
												className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
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
												disabled={
													isFormLoading || isSaving
												}
											/>
											{errors.nombre && (
												<p className="text-[11px] text-red-600">
													{errors.nombre.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-1">
										<label className="block font-medium text-slate-700">
											Descripción
										</label>
										<textarea
											rows={2}
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

									<div className="flex flex-wrap items-center justify-between gap-4 pt-1">
										<div className="flex items-center gap-2">
											<input
												id="perfilIsActive"
												type="checkbox"
												{...register("isActive")}
												className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
												disabled={
													isFormLoading || isSaving
												}
											/>
											<label
												htmlFor="perfilIsActive"
												className="text-xs text-slate-700"
											>
												Perfil activo
											</label>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<div className="flex items-center gap-2">
												<input
													id="perfilEsSistema"
													type="checkbox"
													{...register("esSistema")}
													className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
													disabled={
														isFormLoading ||
														isSaving ||
														isEditMode
													}
												/>
												<label
													htmlFor="perfilEsSistema"
													className="text-xs text-slate-700"
												>
													Perfil de sistema
												</label>
											</div>
											<span className="text-[11px] text-slate-500">
												Estado:{" "}
												{isActiveValue
													? "Activo"
													: "Inactivo"}{" "}
												·{" "}
												{esSistemaValue
													? "Sistema"
													: "Normal"}
											</span>
										</div>
									</div>

									<div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
										<div className="flex items-center justify-between gap-2">
											<div>
												<p className="text-xs font-semibold text-slate-800">
													Opciones de menú
												</p>
												<p className="text-[10px] text-slate-500">
													Selecciona las opciones del
													menú que este perfil podrá
													ver.
												</p>
											</div>
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={onSelectAllMenu}
													className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
													disabled={
														isFormLoading ||
														isSaving
													}
												>
													Todos
												</button>
												<button
													type="button"
													onClick={onClearMenu}
													className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
													disabled={
														isFormLoading ||
														isSaving
													}
												>
													Ninguno
												</button>
											</div>
										</div>

										<div className="max-h-72 overflow-y-auto rounded-md border border-slate-200">
											{BASE_MENU_CONFIG.map((modulo) => (
												<div
													key={modulo.codigo}
													className="border-b border-slate-200 last:border-b-0"
												>
													<div className="bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
														{modulo.nombre}
													</div>
													<div className="divide-y divide-slate-100">
														{modulo.menu.map(
															(opcion) => {
																const seleccionado =
																	!!menuSelection[
																		opcion
																			.codigo
																	];
																return (
																	<label
																		key={
																			opcion.codigo
																		}
																		className="flex items-center justify-between px-3 py-1.5 text-[11px]"
																	>
																		<div className="flex flex-col">
																			<span className="font-medium text-slate-800">
																				{
																					opcion.etiqueta
																				}
																			</span>
																			<span className="text-[10px] text-slate-500">
																				{
																					opcion.codigo
																				}
																			</span>
																		</div>
																		<input
																			type="checkbox"
																			checked={
																				seleccionado
																			}
																			onChange={() =>
																				onToggleOpcionMenu(
																					opcion.codigo
																				)
																			}
																			disabled={
																				isFormLoading ||
																				isSaving
																			}
																			className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
																		/>
																	</label>
																);
															}
														)}
													</div>
												</div>
											))}
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
