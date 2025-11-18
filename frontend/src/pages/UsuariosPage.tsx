import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import bcrypt from "bcryptjs";

import { useAuth } from "../hooks/useAuth";
import { http } from "../api/http";

import {
	buildUsuariosListParams,
	buildPerfilesListParams,
	buildUsuarioCreatePayload,
	buildUsuarioUpdatePayload,
	buildUsuarioPerfilesPayload,
} from "../domain/usuarios";
import type {
	UsuarioDetalle,
	UsuarioListItem,
	UsuariosListResponse,
	PerfilItem,
	PerfilesListResponse,
} from "../domain/usuarios";

import {
	UsuarioFormModal,
	type UsuarioFormValues,
} from "../components/usuarios/UsuarioFormModal";
import { DeleteUsuarioDialog } from "../components/usuarios/DeleteUsuarioDialog";
import { UsuariosTable } from "../components/usuarios/UsuariosTable";

const usuarioFormSchema = z.object({
	usuario: z.string().min(1, "Requerido"),
	nombreCompleto: z.string().min(1, "Requerido"),
	correo: z.string().email("Correo inválido"),
	perfilId: z.string().min(1, "Selecciona un perfil"),
	esSuperadmin: z.boolean(),
	isActive: z.boolean(),
	password: z.string().optional(),
});

type UsuarioFormSchemaValues = z.infer<typeof usuarioFormSchema>;

export const UsuariosPage = () => {
	const { auth } = useAuth();
	const empresaId = auth.user?.empresaId ?? null;

	const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
	const [, setTotalUsuarios] = useState(0);
	const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
	const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
	const [isLoadingPerfiles, setIsLoadingPerfiles] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [usuarioEditando, setUsuarioEditando] =
		useState<UsuarioListItem | null>(null);
	const [usuarioAEliminar, setUsuarioAEliminar] =
		useState<UsuarioListItem | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setError,
		watch,
		formState: { errors },
	} = useForm<UsuarioFormValues>({
		resolver: zodResolver(usuarioFormSchema),
		defaultValues: {
			usuario: "",
			nombreCompleto: "",
			correo: "",
			perfilId: "",
			esSuperadmin: false,
			isActive: true,
			password: "",
		},
	});

	const isActiveValue = watch("isActive");
	const esSuperadminValue = watch("esSuperadmin");

	const tituloModal = useMemo(
		() =>
			usuarioEditando
				? `Editar usuario: ${usuarioEditando.usuario}`
				: "Nuevo usuario",
		[usuarioEditando]
	);

	const cargarUsuarios = useCallback(async () => {
		if (!empresaId) return;
		setIsLoadingUsuarios(true);
		try {
			const params = buildUsuariosListParams(empresaId, 50, 0);
			const response = await http.get<UsuariosListResponse>(
				"/listUsuarios",
				{
					params,
				}
			);
			setUsuarios(response.data.data);
			setTotalUsuarios(response.data.total);
		} catch {
			toast.error("No se pudo cargar la lista de usuarios");
		} finally {
			setIsLoadingUsuarios(false);
		}
	}, [empresaId]);

	const cargarPerfiles = useCallback(async () => {
		if (!empresaId) return;
		setIsLoadingPerfiles(true);
		try {
			const params = buildPerfilesListParams(empresaId);
			const response = await http.get<PerfilesListResponse>(
				"/listPerfiles",
				{
					params,
				}
			);
			setPerfiles(response.data.data);
		} catch {
			toast.error("No se pudo cargar la lista de perfiles");
		} finally {
			setIsLoadingPerfiles(false);
		}
	}, [empresaId]);

	useEffect(() => {
		if (!empresaId) return;
		cargarUsuarios();
		cargarPerfiles();
	}, [empresaId, cargarUsuarios, cargarPerfiles]);

	const abrirModalNuevo = () => {
		setUsuarioEditando(null);
		reset({
			usuario: "",
			nombreCompleto: "",
			correo: "",
			perfilId: "",
			esSuperadmin: false,
			isActive: true,
			password: "",
		});
		setIsModalOpen(true);
	};

	const abrirModalEdicion = async (usuario: UsuarioListItem) => {
		setUsuarioEditando(usuario);
		setIsModalOpen(true);
		setIsFormLoading(true);
		try {
			const response = await http.get<UsuarioDetalle>(
				`/getUsuario/${usuario.id}`
			);
			const detalle = response.data;
			reset({
				usuario: detalle.usuario,
				nombreCompleto: detalle.nombreCompleto,
				correo: detalle.correo,
				perfilId:
					detalle.perfiles
						.find((p) => p.esPrincipal)
						?.perfilesId.toString() ?? "",
				esSuperadmin: detalle.esSuperadmin,
				isActive: detalle.isActive,
				password: "",
			});
		} catch {
			toast.error("No se pudo cargar el usuario");
			setIsModalOpen(false);
			setUsuarioEditando(null);
		} finally {
			setIsFormLoading(false);
		}
	};

	const cerrarModal = () => {
		if (isSaving) return;
		setIsModalOpen(false);
		setUsuarioEditando(null);
	};

	const abrirConfirmacionEliminar = (usuario: UsuarioListItem) => {
		setUsuarioAEliminar(usuario);
	};

	const cerrarConfirmacionEliminar = () => {
		if (isDeleting) return;
		setUsuarioAEliminar(null);
	};

	const handleSubmitForm = handleSubmit(
		async (values: UsuarioFormSchemaValues) => {
			if (!empresaId) {
				toast.error("No se encontró la empresa en la sesión");
				return;
			}

			const trimmedPassword = values.password?.trim() ?? "";
			const tienePassword = trimmedPassword.length > 0;

			if (!usuarioEditando && !tienePassword) {
				setError("password", {
					type: "manual",
					message: "Ingresa una contraseña temporal",
				});
				return;
			}

			setIsSaving(true);
			try {
				let hashContrasena: string | undefined;

				if (tienePassword) {
					hashContrasena = await bcrypt.hash(trimmedPassword, 10);
				}

				if (usuarioEditando) {
					const payloadUpdate = buildUsuarioUpdatePayload(
						values,
						empresaId,
						usuarioEditando.id,
						hashContrasena
					);
					await http.put(
						`/updateUsuario/${usuarioEditando.id}`,
						payloadUpdate
					);

					const payloadPerfiles = buildUsuarioPerfilesPayload(
						usuarioEditando.id,
						values.perfilId
					);
					await http.put("/updateUsuarioPerfiles", payloadPerfiles);

					toast.success("Usuario actualizado");
				} else {
					const payloadCreate = buildUsuarioCreatePayload(
						values,
						empresaId,
						hashContrasena as string
					);
					const response = await http.post<{ id: number }>(
						"/createUsuario",
						payloadCreate
					);
					const usuarioId = response.data.id;

					const payloadPerfiles = buildUsuarioPerfilesPayload(
						usuarioId,
						values.perfilId
					);
					await http.put("/updateUsuarioPerfiles", payloadPerfiles);

					toast.success("Usuario creado");
				}

				setIsModalOpen(false);
				setUsuarioEditando(null);
				await cargarUsuarios();
			} catch {
				toast.error("No se pudo guardar el usuario");
			} finally {
				setIsSaving(false);
			}
		}
	);

	const confirmarEliminar = async () => {
		if (!usuarioAEliminar) return;
		setIsDeleting(true);
		try {
			await http.delete(`/deleteUsuario/${usuarioAEliminar.id}`);
			toast.success("Usuario eliminado");
			setUsuarioAEliminar(null);
			await cargarUsuarios();
		} catch {
			toast.error("No se pudo eliminar el usuario");
		} finally {
			setIsDeleting(false);
		}
	};

	const cambiarEstado = async (usuario: UsuarioListItem) => {
		try {
			await http.patch(`/updateUsuarioEstado/${usuario.id}`, {
				id: String(usuario.id),
				isActive: !usuario.isActive,
			});
			toast.success(
				usuario.isActive ? "Usuario desactivado" : "Usuario activado"
			);
			await cargarUsuarios();
		} catch {
			toast.error("No se pudo actualizar el estado");
		}
	};

	const hayUsuarios = usuarios.length > 0;

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h1 className="text-xl font-semibold text-slate-800">
						Usuarios
					</h1>
					<p className="text-xs text-slate-500">
						Mantenimiento de usuarios.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={cargarUsuarios}
						disabled={isLoadingUsuarios}
						className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoadingUsuarios ? "Actualizando..." : "Refrescar"}
					</button>
					<button
						type="button"
						onClick={abrirModalNuevo}
						disabled={!empresaId}
						className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Nuevo usuario
					</button>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				{!empresaId && (
					<div className="px-4 py-3 text-sm text-red-600">
						No se encontró empresa en la sesión. No se pueden listar
						usuarios.
					</div>
				)}

				{empresaId && (
					<>
						{isLoadingUsuarios && (
							<div className="px-4 py-3 text-sm text-slate-500">
								Cargando usuarios...
							</div>
						)}

						{!isLoadingUsuarios && (
							<>
								{hayUsuarios && (
									<UsuariosTable
										usuarios={usuarios}
										onEditar={abrirModalEdicion}
										onToggleEstado={cambiarEstado}
										onEliminar={abrirConfirmacionEliminar}
									/>
								)}
								{!hayUsuarios && (
									<div className="px-4 py-3 text-sm text-slate-500">
										No hay usuarios registrados para esta
										empresa.
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>

			<UsuarioFormModal
				isOpen={isModalOpen}
				titulo={tituloModal}
				isFormLoading={isFormLoading}
				isSaving={isSaving}
				isLoadingPerfiles={isLoadingPerfiles}
				perfiles={perfiles}
				isActiveValue={isActiveValue}
				esSuperadminValue={esSuperadminValue}
				isEditMode={!!usuarioEditando}
				register={register}
				errors={errors}
				onClose={cerrarModal}
				onSubmit={handleSubmitForm}
			/>

			<DeleteUsuarioDialog
				usuario={usuarioAEliminar}
				isDeleting={isDeleting}
				onClose={cerrarConfirmacionEliminar}
				onConfirm={confirmarEliminar}
			/>
		</div>
	);
};
