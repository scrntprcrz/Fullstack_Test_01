import {
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { http } from "../api/http";
import { ListFilterBar } from "../components/ListFilterBar";

import {
	buildTareasListParams,
	type ColaboradorOption,
	normalizeFecha,
	ordenarKanbanPorEstado,
	type ProyectoColaboradorListResponse,
	type ProyectoOption,
	type ProyectosListResponse,
	type TareaEstado,
	type TareaListItem,
	type TareaPrioridad,
	TAREAS_PAGE_LIMIT,
	type TareasListResponse,
	toInputDate,
	toOptionalNumber,
	toTimestampOrNull,
} from "../domain/tareas";
import { initKanbanDnD } from "../lib/kanbanDnd";
import { TareasKanbanBoard } from "../components/tareas/TareasKanbanBoard";
import {
	TareaFormModal,
	type TareaFormValues,
} from "../components/tareas/TareaFormModal";
import { DeleteTareaDialog } from "../components/tareas/DeleteTareaDialog";

const tareaFormSchema = z.object({
	titulo: z.string().min(1, "Requerido"),
	descripcion: z.string().optional(),
	estado: z.enum(["pendiente", "en_progreso", "completada"]),
	prioridad: z.enum(["baja", "media", "alta"]),
	asignadoId: z.string().optional(),
	fechaInicio: z.string().optional(),
	fechaVencimiento: z.string().optional(),
});

type TareaFormSchemaValues = z.infer<typeof tareaFormSchema>;

const buildTareaCreatePayload = (
	values: TareaFormValues,
	proyectoId: number
) => ({
	proyectoId,
	titulo: values.titulo.trim(),
	descripcion: values.descripcion?.trim() || undefined,
	estado: values.estado,
	prioridad: values.prioridad,
	asignadoId: toOptionalNumber(values.asignadoId),
	ordenKanban: 0,
	fechaInicio: normalizeFecha(values.fechaInicio),
	fechaVencimiento: normalizeFecha(values.fechaVencimiento),
});

const buildTareaUpdatePayload = (
	values: TareaFormValues,
	proyectoId: number,
	tarea: TareaListItem
) => ({
	id: tarea.id,
	proyectoId,
	titulo: values.titulo.trim(),
	descripcion: values.descripcion?.trim() || undefined,
	estado: values.estado,
	prioridad: values.prioridad,
	asignadoId: toOptionalNumber(values.asignadoId),
	ordenKanban: tarea.ordenKanban,
	fechaInicio: normalizeFecha(values.fechaInicio),
	fechaVencimiento: normalizeFecha(values.fechaVencimiento),
});

export const TareasPage = () => {
	const { auth } = useAuth();
	const empresaId = auth.user?.empresaId ?? null;
	const usuarioId = auth.user?.id ?? null;

	const [proyectos, setProyectos] = useState<ProyectoOption[]>([]);
	const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState<
		number | null
	>(null);

	const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);
	const [tareas, setTareas] = useState<TareaListItem[]>([]);
	const [isLoadingTareas, setIsLoadingTareas] = useState(false);

	const [textoBusqueda, setTextoBusqueda] = useState("");
	const [filtroTexto, setFiltroTexto] = useState("");

	const [estadoUI, setEstadoUI] = useState<"" | TareaEstado>("");
	const [estadoFiltro, setEstadoFiltro] = useState<"" | TareaEstado>("");

	const [prioridadUI, setPrioridadUI] = useState<"" | TareaPrioridad>("");
	const [prioridadFiltro, setPrioridadFiltro] = useState<"" | TareaPrioridad>(
		""
	);

	const [soloAsignadasUI, setSoloAsignadasUI] = useState(false);
	const [soloAsignadasFiltro, setSoloAsignadasFiltro] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [tareaEditando, setTareaEditando] = useState<TareaListItem | null>(
		null
	);
	const [tareaAEliminar, setTareaAEliminar] = useState<TareaListItem | null>(
		null
	);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TareaFormValues>({
		resolver: zodResolver(tareaFormSchema),
		defaultValues: {
			titulo: "",
			descripcion: "",
			estado: "pendiente",
			prioridad: "media",
			asignadoId: "",
			fechaInicio: "",
			fechaVencimiento: "",
		},
	});

	const tituloModal = useMemo(
		() => (tareaEditando ? "Editar tarea" : "Nueva tarea"),
		[tareaEditando]
	);

	const cargarProyectos = useCallback(async () => {
		if (!empresaId) return;
		try {
			const response = await http.get<ProyectosListResponse>(
				"/listProyectos",
				{
					params: {
						empresaId,
						limit: 100,
						offset: 0,
						soloActivos: true,
					},
				}
			);
			const items = response.data.data.map((p) => ({
				id: p.id,
				nombre: p.nombre,
				codigo: p.codigo,
				fechaInicio: p.fechaInicio,
				fechaFin: p.fechaFin,
			}));
			setProyectos(items);
			if (!proyectoSeleccionadoId && items.length > 0) {
				setProyectoSeleccionadoId(items[0].id);
			}
		} catch {
			toast.error("No se pudieron cargar los proyectos");
		}
	}, [empresaId, proyectoSeleccionadoId]);

	const cargarColaboradores = useCallback(async (proyectoId: number) => {
		try {
			const response = await http.get<ProyectoColaboradorListResponse>(
				`/listProyectoColaboradores/${proyectoId}`
			);
			const items: ColaboradorOption[] = response.data.data.map((c) => ({
				usuarioId: c.usuarioId,
				nombreCompleto: c.nombreCompleto,
				usuario: c.usuario,
			}));
			setColaboradores(items);
		} catch {
			setColaboradores([]);
		}
	}, []);

	const cargarTareas = useCallback(async () => {
		if (!proyectoSeleccionadoId || !empresaId) {
			setTareas([]);
			return;
		}
		setIsLoadingTareas(true);
		try {
			const params = buildTareasListParams(
				empresaId,
				proyectoSeleccionadoId,
				TAREAS_PAGE_LIMIT,
				filtroTexto,
				estadoFiltro,
				prioridadFiltro,
				soloAsignadasFiltro,
				usuarioId
			);

			const response = await http.get<TareasListResponse>("/listTareas", {
				params,
			});
			setTareas(response.data.data);
		} catch {
			toast.error("No se pudieron cargar las tareas");
		} finally {
			setIsLoadingTareas(false);
		}
	}, [
		empresaId,
		proyectoSeleccionadoId,
		filtroTexto,
		estadoFiltro,
		prioridadFiltro,
		soloAsignadasFiltro,
		usuarioId,
	]);

	useEffect(() => {
		if (!empresaId) return;
		cargarProyectos();
	}, [empresaId, cargarProyectos]);

	useEffect(() => {
		if (!proyectoSeleccionadoId || !empresaId) return;
		cargarColaboradores(proyectoSeleccionadoId);
		cargarTareas();
	}, [empresaId, proyectoSeleccionadoId, cargarColaboradores, cargarTareas]);

	const handleDropOnKanban = useCallback(
		async (tareaId: number, nuevoEstado: TareaEstado) => {
			if (!proyectoSeleccionadoId) return;

			const tareasProyecto = tareas.filter(
				(t) => t.proyectoId === proyectoSeleccionadoId
			);
			const otrasTareas = tareas.filter(
				(t) => t.proyectoId !== proyectoSeleccionadoId
			);
			const tarea = tareasProyecto.find((t) => t.id === tareaId);
			if (!tarea) return;

			const sinTarea = tareasProyecto.filter((t) => t.id !== tareaId);
			const conNuevoEstado = [
				...sinTarea,
				{
					...tarea,
					estado: nuevoEstado,
				},
			];

			const normalizado = ordenarKanbanPorEstado(conNuevoEstado);
			const nextAll = [...otrasTareas, ...normalizado];

			setTareas(nextAll);

			const items = normalizado.map((t) => ({
				id: t.id,
				estado: t.estado,
				ordenKanban: t.ordenKanban,
			}));

			try {
				await http.put("/reordenarTareasKanban", {
					proyectoId: proyectoSeleccionadoId,
					items,
				});
			} catch {
				toast.error("No se pudo actualizar el orden del tablero");
				await cargarTareas();
			}
		},
		[tareas, proyectoSeleccionadoId, cargarTareas]
	);

	useEffect(() => {
		if (!proyectoSeleccionadoId) return;
		const cleanup = initKanbanDnD(handleDropOnKanban);
		return cleanup;
	}, [proyectoSeleccionadoId, handleDropOnKanban, tareas.length]);

	const aplicarFiltros = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFiltroTexto(textoBusqueda.trim());
		setEstadoFiltro(estadoUI);
		setPrioridadFiltro(prioridadUI);
		setSoloAsignadasFiltro(soloAsignadasUI && !!usuarioId);
	};

	const limpiarFiltros = () => {
		setTextoBusqueda("");
		setEstadoUI("");
		setPrioridadUI("");
		setSoloAsignadasUI(false);

		setFiltroTexto("");
		setEstadoFiltro("");
		setPrioridadFiltro("");
		setSoloAsignadasFiltro(false);
	};

	const abrirModalNuevaTarea = () => {
		if (!proyectoSeleccionadoId) {
			toast.error("Selecciona un proyecto primero");
			return;
		}
		setTareaEditando(null);
		reset({
			titulo: "",
			descripcion: "",
			estado: "pendiente",
			prioridad: "media",
			asignadoId: "",
			fechaInicio: "",
			fechaVencimiento: "",
		});
		setIsModalOpen(true);
	};

	const abrirModalEdicion = async (tarea: TareaListItem) => {
		if (!proyectoSeleccionadoId) return;
		setTareaEditando(tarea);
		setIsModalOpen(true);
		setIsFormLoading(true);
		try {
			const response = await http.get<TareaListItem>(
				`/getTarea/${tarea.id}`
			);
			const detalle = response.data;
			reset({
				titulo: detalle.titulo,
				descripcion: detalle.descripcion ?? "",
				estado: detalle.estado,
				prioridad: detalle.prioridad,
				asignadoId: detalle.asignadoId
					? String(detalle.asignadoId)
					: "",
				fechaInicio: toInputDate(detalle.fechaInicio),
				fechaVencimiento: toInputDate(detalle.fechaVencimiento),
			});
		} catch {
			toast.error("No se pudo cargar la tarea");
			setIsModalOpen(false);
			setTareaEditando(null);
		} finally {
			setIsFormLoading(false);
		}
	};

	const cerrarModal = () => {
		if (isSaving) return;
		setIsModalOpen(false);
		setTareaEditando(null);
	};

	const abrirConfirmacionEliminar = (tarea: TareaListItem) => {
		setTareaAEliminar(tarea);
	};

	const cerrarConfirmacionEliminar = () => {
		if (isDeleting) return;
		setTareaAEliminar(null);
	};

	const handleSubmitForm = handleSubmit(
		async (values: TareaFormSchemaValues) => {
			if (!proyectoSeleccionadoId) {
				toast.error("Selecciona un proyecto primero");
				return;
			}
			const proyecto = proyectos.find(
				(p) => p.id === proyectoSeleccionadoId
			);

			const proyectoInicioTs = proyecto
				? toTimestampOrNull(proyecto.fechaInicio)
				: null;
			const proyectoFinTs = proyecto
				? toTimestampOrNull(proyecto.fechaFin)
				: null;

			const tareaInicioTs = toTimestampOrNull(values.fechaInicio || null);
			const tareaFinTs = toTimestampOrNull(
				values.fechaVencimiento || null
			);

			if (
				proyectoInicioTs &&
				tareaInicioTs &&
				tareaInicioTs < proyectoInicioTs
			) {
				toast.error(
					"La fecha de inicio de la tarea no puede ser anterior al inicio del proyecto"
				);
				setIsSaving(false);
				return;
			}

			if (proyectoFinTs && tareaFinTs && tareaFinTs > proyectoFinTs) {
				toast.error(
					"La fecha de vencimiento de la tarea no puede ser posterior al fin del proyecto"
				);
				setIsSaving(false);
				return;
			}

			setIsSaving(true);
			try {
				if (tareaEditando) {
					const payloadUpdate = buildTareaUpdatePayload(
						values,
						proyectoSeleccionadoId,
						tareaEditando
					);
					await http.put(
						`/updateTarea/${tareaEditando.id}`,
						payloadUpdate
					);
					toast.success("Tarea actualizada");
				} else {
					const payloadCreate = buildTareaCreatePayload(
						values,
						proyectoSeleccionadoId
					);
					await http.post<{ id: number }>(
						"/createTarea",
						payloadCreate
					);
					toast.success("Tarea creada");
				}
				setIsModalOpen(false);
				setTareaEditando(null);
				await cargarTareas();
			} catch {
				toast.error("No se pudo guardar la tarea");
			} finally {
				setIsSaving(false);
			}
		}
	);

	const confirmarEliminar = async () => {
		if (!tareaAEliminar) return;
		setIsDeleting(true);
		try {
			await http.delete(`/deleteTarea/${tareaAEliminar.id}`, {
				params: {
					hard: 1,
				},
			});
			toast.success("Tarea eliminada");
			setTareaAEliminar(null);
			await cargarTareas();
		} catch {
			toast.error("No se pudo eliminar la tarea");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-0.5">
					<h1 className="text-xl font-semibold text-slate-800">
						Tareas
					</h1>
					<p className="text-xs text-slate-500">
						Gestión de tareas por proyecto.
					</p>
				</div>
				<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
					<div className="flex items-center gap-2">
						<span className="text-[11px] text-slate-600">
							Proyecto
						</span>
						<select
							value={proyectoSeleccionadoId ?? ""}
							onChange={(event) =>
								setProyectoSeleccionadoId(
									event.target.value
										? Number(event.target.value)
										: null
								)
							}
							className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
						>
							<option value="">Seleccione...</option>
							{proyectos.map((p) => (
								<option key={p.id} value={p.id}>
									{p.codigo} · {p.nombre}
								</option>
							))}
						</select>
					</div>
					<button
						type="button"
						onClick={abrirModalNuevaTarea}
						disabled={!proyectoSeleccionadoId}
						className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Nueva tarea
					</button>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				<ListFilterBar
					searchLabel="Búsqueda"
					searchPlaceholder="Buscar por título o descripción"
					searchValue={textoBusqueda}
					onSearchChange={setTextoBusqueda}
					onSubmit={aplicarFiltros}
					onReset={limpiarFiltros}
					filters={
						<>
							<div className="flex items-center gap-1.5 text-[11px] text-slate-700">
								<span>Estado</span>
								<select
									value={estadoUI}
									onChange={(event) =>
										setEstadoUI(
											event.target.value as
												| ""
												| TareaEstado
										)
									}
									className="h-7 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
								>
									<option value="">Todos</option>
									<option value="pendiente">Pendiente</option>
									<option value="en_progreso">
										En progreso
									</option>
									<option value="completada">
										Completada
									</option>
								</select>
							</div>

							<div className="flex items-center gap-1.5 text-[11px] text-slate-700">
								<span>Prioridad</span>
								<select
									value={prioridadUI}
									onChange={(event) =>
										setPrioridadUI(
											event.target.value as
												| ""
												| TareaPrioridad
										)
									}
									className="h-7 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-800 outline-none focus:border-slate-800 focus:ring-0"
								>
									<option value="">Todas</option>
									<option value="alta">Alta</option>
									<option value="media">Media</option>
									<option value="baja">Baja</option>
								</select>
							</div>

							<label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700">
								<input
									type="checkbox"
									checked={soloAsignadasUI}
									onChange={(event) =>
										setSoloAsignadasUI(event.target.checked)
									}
									disabled={!usuarioId}
									className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
								/>
								<span>Solo asignadas a mí</span>
							</label>
						</>
					}
				/>

				{!proyectoSeleccionadoId && (
					<div className="px-4 py-3 text-sm text-slate-500">
						Selecciona un proyecto para ver el tablero de tareas.
					</div>
				)}

				{proyectoSeleccionadoId && isLoadingTareas && (
					<div className="px-4 py-3 text-sm text-slate-500">
						Cargando tareas...
					</div>
				)}

				{proyectoSeleccionadoId &&
					!isLoadingTareas &&
					tareas.length === 0 && (
						<div className="px-4 py-3 text-sm text-slate-500">
							No hay tareas para mostrar.
						</div>
					)}

				{proyectoSeleccionadoId &&
					!isLoadingTareas &&
					tareas.length > 0 && (
						<TareasKanbanBoard
							tareas={tareas}
							onEdit={abrirModalEdicion}
							onDelete={abrirConfirmacionEliminar}
						/>
					)}
			</div>

			<TareaFormModal
				isOpen={isModalOpen}
				titulo={tituloModal}
				isFormLoading={isFormLoading}
				isSaving={isSaving}
				colaboradores={colaboradores}
				register={register}
				errors={errors}
				onClose={cerrarModal}
				onSubmit={handleSubmitForm}
			/>

			<DeleteTareaDialog
				tarea={tareaAEliminar}
				isDeleting={isDeleting}
				onClose={cerrarConfirmacionEliminar}
				onConfirm={confirmarEliminar}
			/>
		</div>
	);
};
