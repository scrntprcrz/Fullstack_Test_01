import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { UsuarioListItem } from "../../domain/usuarios";

type Props = {
	usuario: UsuarioListItem | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export const DeleteUsuarioDialog = ({
	usuario,
	isDeleting,
	onClose,
	onConfirm,
}: Props) => {
	const isOpen = !!usuario;

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
							<Dialog.Panel className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl">
								<div className="px-4 py-3">
									<Dialog.Title className="text-sm font-semibold text-slate-800">
										Eliminar usuario
									</Dialog.Title>
									<p className="mt-1 text-xs text-slate-600">
										¿Seguro que deseas eliminar al usuario{" "}
										<span className="font-semibold">
											{usuario?.usuario}
										</span>
										?
									</p>
								</div>
								<div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
									<button
										type="button"
										onClick={onClose}
										disabled={isDeleting}
										className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Cancelar
									</button>
									<button
										type="button"
										onClick={onConfirm}
										disabled={isDeleting}
										className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{isDeleting
											? "Eliminando..."
											: "Eliminar"}
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};
