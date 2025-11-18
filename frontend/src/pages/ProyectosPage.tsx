import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { http } from "../api/http";
import { ListFilterBar } from "../components/ListFilterBar";

import {
	buildProyectosListParams,
	buildProyectoCreatePayload,
	buildProyectoUpdatePayload,
	PROYECTOS_PAGE_SIZE,
	toInputDate,
} from "../domain/proyectos";
import type {
	ProyectoDetalle,
	ProyectoListItem,
	ProyectosListResponse,
} from "../domain/proyectos";
import type { UsuarioListItem, UsuariosListResponse } from "../domain/usuarios";

import {
	ProyectoFormModal,
	type ProyectoFormValues,
} from "../components/proyectos/ProyectoFormModal";
import { DeleteProyectoDialog } from "../components/proyectos/DeleteProyectoDialog";
import { ProyectosTable } from "../components/proyectos/ProyectosTable";
import { ProyectoColaboradoresModal } from "../components/proyectos/ProyectoColaboradoresModal";

const proyectoFormSchema = z.object({
	codigo: z.string().min(1, "Requerido"),
	nombre: z.string().min(1, "Requerido"),
	descripcion: z.string().optional(),
	fechaInicio: z.string().optional(),
	fechaFin: z.string().optional(),
	isArchivado: z.boolean(),
});

type ProyectoFormSchemaValues = z.infer<typeof proyectoFormSchema>;

export const ProyectosPage = () => {
	const { auth } = useAuth();
	const empresaId = auth.user?.empresaId ?? null;
	const usuarioId = auth.user?.id ?? null;

	const [proyectos, setProyectos] = useState<ProyectoListItem[]>([]);
	const [totalProyectos, setTotalProyectos] = useState(0);
	const [isLoadingProyectos, setIsLoadingProyectos] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [proyectoEditando, setProyectoEditando] =
		useState<ProyectoListItem | null>(null);
	const [proyectoAEliminar, setProyectoAEliminar] =
		useState<ProyectoListItem | null>(null);

	const [textoBusqueda, setTextoBusqueda] = useState("");
	const [filtroTexto, setFiltroTexto] = useState("");

	const [soloActivosUI, setSoloActivosUI] = useState(true);
	const [filtroSoloActivos, setFiltroSoloActivos] = useState(true);

	const [soloCreadosPorMiUI, setSoloCreadosPorMiUI] = useState(false);
	const [filtroSoloCreadosPorMi, setFiltroSoloCreadosPorMi] = useState(false);

	const [soloDondeSoyColaboradorUI, setSoloDondeSoyColaboradorUI] =
		useState(false);
	const [filtroSoloDondeSoyColaborador, setFiltroSoloDondeSoyColaborador] =
		useState(false);

	const [offset, setOffset] = useState(0);
	const limit = PROYECTOS_PAGE_SIZE;

	const [proyectoGestionColaboradores, setProyectoGestionColaboradores] =
		useState<ProyectoListItem | null>(null);
	const [isColaboradoresModalOpen, setIsColaboradoresModalOpen] =
		useState(false);
	const [usuariosEmpresa, setUsuariosEmpresa] = useState<UsuarioListItem[]>(
		[]
	);
	const [isLoadingUsuariosEmpresa, setIsLoadingUsuariosEmpresa] =
		useState(false);
	const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState("");
	const [isSavingColaborador, setIsSavingColaborador] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<ProyectoFormValues>({
		resolver: zodResolver(proyectoFormSchema),
		defaultValues: {
			codigo: "",
			nombre: "",
			descripcion: "",
			fechaInicio: "",
			fechaFin: "",
			isArchivado: false,
		},
	});

	const isArchivadoValue = watch("isArchivado");

	const tituloModal = useMemo(
		() => (proyectoEditando ? "Editar proyecto" : "Nuevo proyecto"),
		[proyectoEditando]
	);

	const hayProyectos = proyectos.length > 0;
	const paginaActual = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
	const totalPaginas =
		limit > 0 ? Math.max(1, Math.ceil(totalProyectos / limit)) : 1;

	const cargarProyectos = useCallback(async () => {
		if (!empresaId) return;
		setIsLoadingProyectos(true);
		try {
			const creadorId =
				filtroSoloCreadosPorMi && usuarioId ? usuarioId : undefined;
			const colaboradorId =
				filtroSoloDondeSoyColaborador && usuarioId
					? usuarioId
					: undefined;

			const params = buildProyectosListParams(
				empresaId,
				limit,
				offset,
				filtroTexto,
				filtroSoloActivos,
				creadorId,
				colaboradorId
			);

			const response = await http.get<ProyectosListResponse>(
				"/listProyectos",
				{
					params,
				}
			);
			setProyectos(response.data.data);
			setTotalProyectos(response.data.total);
		} catch {
			toast.error("No se pudo cargar la lista de proyectos");
		} finally {
			setIsLoadingProyectos(false);
		}
	}, [
		empresaId,
		usuarioId,
		limit,
		offset,
		filtroTexto,
		filtroSoloActivos,
		filtroSoloCreadosPorMi,
		filtroSoloDondeSoyColaborador,
	]);

	const cargarUsuariosEmpresa = useCallback(async () => {
		if (!empresaId) return;
		setIsLoadingUsuariosEmpresa(true);
		try {
			const response = await http.get<UsuariosListResponse>(
				"/listUsuarios",
				{
					params: {
						empresaId,
						limit: 200,
						offset: 0,
					},
				}
			);
			setUsuariosEmpresa(response.data.data);
		} catch {
			toast.error("No se pudo cargar la lista de usuarios");
		} finally {
			setIsLoadingUsuariosEmpresa(false);
		}
	}, [empresaId]);

	useEffect(() => {
		if (!empresaId) return;
		cargarProyectos();
	}, [empresaId, cargarProyectos]);

	const abrirModalNuevo = () => {
		if (!empresaId || !usuarioId) {
			toast.error("No se encontró la empresa o usuario en la sesión");
			return;
		}
		setProyectoEditando(null);
		reset({
			codigo: "",
			nombre: "",
			descripcion: "",
			fechaInicio: "",
			fechaFin: "",
			isArchivado: false,
		});
		setIsModalOpen(true);
	};

	const abrirModalEdicion = async (proyecto: ProyectoListItem) => {
		setProyectoEditando(proyecto);
		setIsModalOpen(true);
		setIsFormLoading(true);
		try {
			const response = await http.get<ProyectoDetalle>(
				`/getProyecto/${proyecto.id}`
			);
			const detalle = response.data;
			reset({
				codigo: detalle.codigo,
				nombre: detalle.nombre,
				descripcion: detalle.descripcion ?? "",
				fechaInicio: toInputDate(detalle.fechaInicio),
				fechaFin: toInputDate(detalle.fechaFin),
				isArchivado: detalle.isArchivado,
			});
		} catch {
			toast.error("No se pudo cargar el proyecto");
			setIsModalOpen(false);
			setProyectoEditando(null);
		} finally {
			setIsFormLoading(false);
		}
	};

	const cerrarModal = () => {
		if (isSaving) return;
		setIsModalOpen(false);
		setProyectoEditando(null);
	};

	const abrirConfirmacionEliminar = (proyecto: ProyectoListItem) => {
		setProyectoAEliminar(proyecto);
	};

	const cerrarConfirmacionEliminar = () => {
		if (isDeleting) return;
		setProyectoAEliminar(null);
	};

	const handleSubmitForm = handleSubmit(
		async (values: ProyectoFormSchemaValues) => {
			if (!empresaId || !usuarioId) {
				toast.error("No se encontró la empresa o usuario en la sesión");
				return;
			}

			setIsSaving(true);
			try {
				if (proyectoEditando) {
					const payloadUpdate = buildProyectoUpdatePayload(
						values,
						empresaId,
						proyectoEditando.id,
						usuarioId
					);
					await http.put(
						`/updateProyecto/${proyectoEditando.id}`,
						payloadUpdate
					);
					toast.success("Proyecto actualizado");
				} else {
					const payloadCreate = buildProyectoCreatePayload(
						values,
						empresaId,
						usuarioId
					);
					await http.post<{ id: number }>(
						"/createProyecto",
						payloadCreate
					);
					toast.success("Proyecto creado");
				}

				setIsModalOpen(false);
				setProyectoEditando(null);
				await cargarProyectos();
			} catch {
				toast.error("No se pudo guardar el proyecto");
			} finally {
				setIsSaving(false);
			}
		}
	);

	const confirmarEliminar = async () => {
		if (!proyectoAEliminar || !usuarioId) return;
		setIsDeleting(true);
		try {
			await http.delete(`/deleteProyecto/${proyectoAEliminar.id}`, {
				params: {
					usuarioId,
					hard: 1,
				},
			});
			toast.success("Proyecto eliminado");
			setProyectoAEliminar(null);
			await cargarProyectos();
		} catch {
			toast.error("No se pudo eliminar el proyecto");
		} finally {
			setIsDeleting(false);
		}
	};

	const aplicarFiltros = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFiltroTexto(textoBusqueda.trim());
		setFiltroSoloActivos(soloActivosUI);
		setFiltroSoloCreadosPorMi(soloCreadosPorMiUI && !!usuarioId);
		setFiltroSoloDondeSoyColaborador(
			soloDondeSoyColaboradorUI && !!usuarioId
		);
		setOffset(0);
	};

	const limpiarFiltros = () => {
		setTextoBusqueda("");
		setSoloActivosUI(true);
		setSoloCreadosPorMiUI(false);
		setSoloDondeSoyColaboradorUI(false);

		setFiltroTexto("");
		setFiltroSoloActivos(true);
		setFiltroSoloCreadosPorMi(false);
		setFiltroSoloDondeSoyColaborador(false);
		setOffset(0);
	};

	const irPaginaAnterior = () => {
		if (paginaActual <= 1) return;
		setOffset((paginaActual - 2) * limit);
	};

	const irPaginaSiguiente = () => {
		if (paginaActual >= totalPaginas) return;
		setOffset(paginaActual * limit);
	};

	const puedeGestionarProyecto = (proyecto: ProyectoListItem) => {
		if (!usuarioId) return false;
		return usuarioId === proyecto.creador.id;
	};

	const abrirModalColaboradores = async (proyecto: ProyectoListItem) => {
		if (!empresaId) {
			toast.error("No se encontró la empresa en la sesión");
			return;
		}
		setProyectoGestionColaboradores(proyecto);
		setUsuarioSeleccionadoId("");
		setIsColaboradoresModalOpen(true);
		await cargarUsuariosEmpresa();
	};

	const cerrarModalColaboradores = () => {
		if (isSavingColaborador) return;
		setIsColaboradoresModalOpen(false);
		setProyectoGestionColaboradores(null);
		setUsuarioSeleccionadoId("");
	};

	const handleAgregarColaborador = async (
		event: FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();
		if (!proyectoGestionColaboradores || !usuarioSeleccionadoId) {
			toast.error("Selecciona un usuario");
			return;
		}

		setIsSavingColaborador(true);
		try {
			await http.post("/addProyectoColaborador", {
				proyectoId: proyectoGestionColaboradores.id,
				usuarioId: Number(usuarioSeleccionadoId),
			});

			toast.success("Colaborador agregado al proyecto");
			setIsColaboradoresModalOpen(false);
			setProyectoGestionColaboradores(null);
			setUsuarioSeleccionadoId("");
			await cargarProyectos();
		} catch {
			toast.error("No se pudo agregar el colaborador");
		} finally {
			setIsSavingColaborador(false);
		}
	};

	const usuarioOptions = useMemo(
		() =>
			usuariosEmpresa.map((u) => ({
				id: u.id,
				label: `${u.nombreCompleto} (${u.usuario})`,
			})),
		[usuariosEmpresa]
	);

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-0.5">
					<h1 className="text-xl font-semibold text-slate-800">
						Proyectos
					</h1>
					<p className="text-xs text-slate-500">
						Gestión de proyectos.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={cargarProyectos}
						disabled={isLoadingProyectos || !empresaId}
						className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoadingProyectos ? "Actualizando..." : "Refrescar"}
					</button>
					<button
						type="button"
						onClick={abrirModalNuevo}
						disabled={!empresaId || !usuarioId}
						className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Nuevo proyecto
					</button>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				<ListFilterBar
					searchLabel="Búsqueda"
					searchPlaceholder="Buscar por código o nombre"
					searchValue={textoBusqueda}
					onSearchChange={setTextoBusqueda}
					onSubmit={aplicarFiltros}
					onReset={limpiarFiltros}
					filters={
						<>
							<label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700">
								<input
									type="checkbox"
									checked={soloActivosUI}
									onChange={(event) =>
										setSoloActivosUI(event.target.checked)
									}
									className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
								/>
								<span>Solo activos</span>
							</label>

							<label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700">
								<input
									type="checkbox"
									checked={soloCreadosPorMiUI}
									onChange={(event) =>
										setSoloCreadosPorMiUI(
											event.target.checked
										)
									}
									disabled={!usuarioId}
									className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
								/>
								<span>Solo creados por mí</span>
							</label>

							<label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700">
								<input
									type="checkbox"
									checked={soloDondeSoyColaboradorUI}
									onChange={(event) =>
										setSoloDondeSoyColaboradorUI(
											event.target.checked
										)
									}
									disabled={!usuarioId}
									className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
								/>
								<span>Donde soy colaborador</span>
							</label>
						</>
					}
				/>

				{empresaId && (
					<>
						{isLoadingProyectos && (
							<div className="px-4 py-3 text-sm text-slate-500">
								Cargando proyectos...
							</div>
						)}

						{!isLoadingProyectos && !hayProyectos && (
							<div className="px-4 py-3 text-sm text-slate-500">
								No hay proyectos para mostrar.
							</div>
						)}

						{!isLoadingProyectos && hayProyectos && (
							<ProyectosTable
								proyectos={proyectos}
								totalProyectos={totalProyectos}
								paginaActual={paginaActual}
								totalPaginas={totalPaginas}
								onEditar={abrirModalEdicion}
								onEliminar={abrirConfirmacionEliminar}
								onPaginaAnterior={irPaginaAnterior}
								onPaginaSiguiente={irPaginaSiguiente}
								puedeGestionarProyecto={puedeGestionarProyecto}
								onGestionarColaboradores={
									abrirModalColaboradores
								}
							/>
						)}
					</>
				)}
			</div>

			<ProyectoFormModal
				isOpen={isModalOpen}
				titulo={tituloModal}
				isFormLoading={isFormLoading}
				isSaving={isSaving}
				isEditMode={!!proyectoEditando}
				isArchivadoValue={!!isArchivadoValue}
				register={register}
				errors={errors}
				onClose={cerrarModal}
				onSubmit={handleSubmitForm}
			/>

			<DeleteProyectoDialog
				proyecto={proyectoAEliminar}
				isDeleting={isDeleting}
				onClose={cerrarConfirmacionEliminar}
				onConfirm={confirmarEliminar}
			/>

			<ProyectoColaboradoresModal
				isOpen={isColaboradoresModalOpen}
				proyectoNombre={proyectoGestionColaboradores?.nombre ?? ""}
				usuarios={usuarioOptions}
				selectedUsuarioId={usuarioSeleccionadoId}
				isLoadingUsuarios={isLoadingUsuariosEmpresa}
				isSaving={isSavingColaborador}
				onClose={cerrarModalColaboradores}
				onUsuarioChange={setUsuarioSeleccionadoId}
				onSubmit={handleAgregarColaborador}
			/>
		</div>
	);
};
