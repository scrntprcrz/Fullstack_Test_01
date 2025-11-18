import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { http } from "../api/http";

import {
	BASE_MENU_CONFIG,
	buildEmptyMenuSelection,
	buildFullMenuSelection,
	buildMenuSelectionFromConfig,
	buildMenuConfigFromSelection,
	buildPerfilesListParams,
	buildPerfilCreatePayload,
	buildPerfilUpdatePayload,
} from "../domain/perfiles";
import type {
	MenuSelectionMap,
	PerfilDetalle,
	PerfilItem,
	PerfilesListResponse,
} from "../domain/perfiles";

import {
	PerfilFormModal,
	type PerfilFormValues,
} from "../components/perfiles/PerfilFormModal";
import { DeletePerfilDialog } from "../components/perfiles/DeletePerfilDialog";
import { PerfilesTable } from "../components/perfiles/PerfilesTable";

const perfilFormSchema = z.object({
	codigo: z.string().min(1, "Requerido"),
	nombre: z.string().min(1, "Requerido"),
	descripcion: z.string().optional(),
	isActive: z.boolean(),
	esSistema: z.boolean(),
});

type PerfilFormSchemaValues = z.infer<typeof perfilFormSchema>;

export const PerfilesPage = () => {
	const { auth } = useAuth();
	const empresaId = auth.user?.empresaId ?? null;

	const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
	const [, setTotalPerfiles] = useState(0);
	const [isLoadingPerfiles, setIsLoadingPerfiles] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [perfilEditando, setPerfilEditando] = useState<PerfilItem | null>(
		null
	);
	const [perfilAEliminar, setPerfilAEliminar] = useState<PerfilItem | null>(
		null
	);
	const [menuSelection, setMenuSelection] = useState<MenuSelectionMap>(() =>
		buildEmptyMenuSelection(BASE_MENU_CONFIG)
	);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
	} = useForm<PerfilFormValues>({
		resolver: zodResolver(perfilFormSchema),
		defaultValues: {
			codigo: "",
			nombre: "",
			descripcion: "",
			isActive: true,
			esSistema: false,
		},
	});

	const isActiveValue = watch("isActive");
	const esSistemaValue = watch("esSistema");

	const tituloModal = useMemo(
		() =>
			perfilEditando
				? `Editar perfil: ${perfilEditando.codigo}`
				: "Nuevo perfil",
		[perfilEditando]
	);

	const cargarPerfiles = useCallback(async () => {
		if (!empresaId) return;
		setIsLoadingPerfiles(true);
		try {
			const params = buildPerfilesListParams(empresaId, 200, 0);
			const response = await http.get<PerfilesListResponse>(
				"/listPerfiles",
				{
					params,
				}
			);
			setPerfiles(response.data.data);
			setTotalPerfiles(response.data.total);
		} catch {
			toast.error("No se pudo cargar la lista de perfiles");
		} finally {
			setIsLoadingPerfiles(false);
		}
	}, [empresaId]);

	useEffect(() => {
		if (!empresaId) return;
		cargarPerfiles();
	}, [empresaId, cargarPerfiles]);

	const abrirModalNuevo = () => {
		setPerfilEditando(null);
		reset({
			codigo: "",
			nombre: "",
			descripcion: "",
			isActive: true,
			esSistema: false,
		});
		setMenuSelection(buildEmptyMenuSelection(BASE_MENU_CONFIG));
		setIsModalOpen(true);
	};

	const abrirModalEdicion = async (perfil: PerfilItem) => {
		setPerfilEditando(perfil);
		setIsModalOpen(true);
		setIsFormLoading(true);
		try {
			const response = await http.get<PerfilDetalle>(
				`/getPerfil/${perfil.id}`
			);
			const detalle = response.data;
			reset({
				codigo: detalle.codigo,
				nombre: detalle.nombre,
				descripcion: detalle.descripcion,
				isActive: detalle.isActive,
				esSistema: detalle.esSistema,
			});
			setMenuSelection(
				buildMenuSelectionFromConfig(detalle.menuConfigJson)
			);
		} catch {
			toast.error("No se pudo cargar el perfil");
			setIsModalOpen(false);
			setPerfilEditando(null);
		} finally {
			setIsFormLoading(false);
		}
	};

	const cerrarModal = () => {
		if (isSaving) return;
		setIsModalOpen(false);
		setPerfilEditando(null);
	};

	const abrirConfirmacionEliminar = (perfil: PerfilItem) => {
		setPerfilAEliminar(perfil);
	};

	const cerrarConfirmacionEliminar = () => {
		if (isDeleting) return;
		setPerfilAEliminar(null);
	};

	const toggleOpcionMenu = (codigo: string) => {
		setMenuSelection((prev) => ({
			...prev,
			[codigo]: !prev[codigo],
		}));
	};

	const seleccionarTodasOpciones = () => {
		setMenuSelection(buildFullMenuSelection(BASE_MENU_CONFIG));
	};

	const limpiarOpciones = () => {
		setMenuSelection(buildEmptyMenuSelection(BASE_MENU_CONFIG));
	};

	const onSubmit: SubmitHandler<PerfilFormSchemaValues> = async (values) => {
		if (!empresaId) {
			toast.error("No se encontró la empresa en la sesión");
			return;
		}

		const menuConfigJson = buildMenuConfigFromSelection(menuSelection);

		setIsSaving(true);
		try {
			if (perfilEditando) {
				const payloadUpdate = buildPerfilUpdatePayload(
					values,
					empresaId,
					perfilEditando.id,
					menuConfigJson
				);
				await http.put(
					`/updatePerfil/${perfilEditando.id}`,
					payloadUpdate
				);
				toast.success("Perfil actualizado");
			} else {
				const payloadCreate = buildPerfilCreatePayload(
					values,
					empresaId,
					menuConfigJson
				);
				const response = await http.post<{ id: number }>(
					"/createPerfil",
					payloadCreate
				);
				const perfilId = response.data.id;
				if (!perfilId) {
					toast.error("No se pudo obtener el ID del perfil");
				} else {
					toast.success("Perfil creado");
				}
			}

			setIsModalOpen(false);
			setPerfilEditando(null);
			await cargarPerfiles();
		} catch {
			toast.error("No se pudo guardar el perfil");
		} finally {
			setIsSaving(false);
		}
	};

	const confirmarEliminar = async () => {
		if (!perfilAEliminar) return;
		if (perfilAEliminar.esSistema) {
			toast.error("No se puede eliminar un perfil de sistema");
			return;
		}
		setIsDeleting(true);
		try {
			await http.delete(`/deletePerfil/${perfilAEliminar.id}`);
			toast.success("Perfil eliminado");
			setPerfilAEliminar(null);
			await cargarPerfiles();
		} catch {
			toast.error("No se pudo eliminar el perfil");
		} finally {
			setIsDeleting(false);
		}
	};

	const cambiarEstado = async (perfil: PerfilItem) => {
		if (perfil.esSistema) {
			toast.error(
				"No se puede cambiar el estado de un perfil de sistema"
			);
			return;
		}
		try {
			await http.patch(`/updatePerfilEstado/${perfil.id}`, {
				id: String(perfil.id),
				isActive: !perfil.isActive,
			});
			toast.success(
				perfil.isActive ? "Perfil desactivado" : "Perfil activado"
			);
			await cargarPerfiles();
		} catch {
			toast.error("No se pudo actualizar el estado");
		}
	};

	const hayPerfiles = perfiles.length > 0;

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h1 className="text-xl font-semibold text-slate-800">
						Perfiles
					</h1>
					<p className="text-xs text-slate-500">
						Mantenimiento de perfiles y sus opciones de menú.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={cargarPerfiles}
						disabled={isLoadingPerfiles}
						className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoadingPerfiles ? "Actualizando..." : "Refrescar"}
					</button>
					<button
						type="button"
						onClick={abrirModalNuevo}
						disabled={!empresaId}
						className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Nuevo perfil
					</button>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				{!empresaId && (
					<div className="px-4 py-3 text-sm text-red-600">
						No se encontró empresa en la sesión. No se pueden listar
						perfiles.
					</div>
				)}

				{empresaId && (
					<>
						{isLoadingPerfiles && (
							<div className="px-4 py-3 text-sm text-slate-500">
								Cargando perfiles...
							</div>
						)}

						{!isLoadingPerfiles && hayPerfiles && (
							<PerfilesTable
								perfiles={perfiles}
								onEditar={abrirModalEdicion}
								onToggleEstado={cambiarEstado}
								onEliminar={abrirConfirmacionEliminar}
							/>
						)}

						{!isLoadingPerfiles && !hayPerfiles && (
							<div className="px-4 py-3 text-sm text-slate-500">
								No hay perfiles registrados para esta empresa.
							</div>
						)}
					</>
				)}
			</div>

			<PerfilFormModal
				isOpen={isModalOpen}
				titulo={tituloModal}
				isFormLoading={isFormLoading}
				isSaving={isSaving}
				isEditMode={!!perfilEditando}
				isActiveValue={isActiveValue}
				esSistemaValue={esSistemaValue}
				menuSelection={menuSelection}
				register={register}
				errors={errors}
				onClose={cerrarModal}
				onSubmit={handleSubmit(onSubmit)}
				onToggleOpcionMenu={toggleOpcionMenu}
				onSelectAllMenu={seleccionarTodasOpciones}
				onClearMenu={limpiarOpciones}
			/>

			<DeletePerfilDialog
				perfil={perfilAEliminar}
				isDeleting={isDeleting}
				onClose={cerrarConfirmacionEliminar}
				onConfirm={confirmarEliminar}
			/>
		</div>
	);
};
