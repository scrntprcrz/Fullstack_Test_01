export const estados = ["pendiente", "en_progreso", "completada"] as const;
export type TareaEstado = (typeof estados)[number];

export const prioridades = ["baja", "media", "alta"] as const;
export type TareaPrioridad = (typeof prioridades)[number];

export const TAREAS_PAGE_LIMIT = 200;

export type ProyectoOption = {
	id: number;
	nombre: string;
	codigo: string;
	fechaInicio: string | null;
	fechaFin: string | null;
};

export type ColaboradorOption = {
	usuarioId: number;
	nombreCompleto: string;
	usuario: string;
};

export type TareaListItem = {
	id: number;
	proyectoId: number;
	titulo: string;
	descripcion: string | null;
	estado: TareaEstado;
	prioridad: TareaPrioridad;
	asignadoId: number | null;
	ordenKanban: number;
	fechaInicio: string | null;
	fechaVencimiento: string | null;
	isArchivada: boolean;
	createdAt: string;
	updatedAt: string;
	proyecto: {
		id: number;
		empresaId: number;
		nombre: string;
	};
	asignado: {
		id: number;
		nombreCompleto: string;
	} | null;
};

export type TareasListResponse = {
	data: TareaListItem[];
	total: number;
	limit: number;
	offset: number;
};

export type ProyectoColaboradorListResponse = {
	data: {
		usuarioId: number;
		usuario: string;
		nombreCompleto: string;
		correo: string;
		esPropietario: boolean;
		puedeEditar: boolean;
	}[];
};

export type ProyectosListResponse = {
	data: {
		id: number;
		empresaId: number;
		codigo: string;
		nombre: string;
		descripcion: string | null;
		creadorId: number;
		fechaInicio: string | null;
		fechaFin: string | null;
		isArchivado: boolean;
		createdAt: string;
		updatedAt: string;
		empresa: {
			id: number;
			codigo: string;
			nombre: string;
		};
		creador: {
			id: number;
			usuario: string;
			nombreCompleto: string;
		};
	}[];
	total: number;
	limit: number;
	offset: number;
};

export const normalizeFecha = (value?: string) => {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return null;
	return trimmed;
};

export const toOptionalNumber = (value?: string) => {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return undefined;
	const n = Number(trimmed);
	if (Number.isNaN(n)) return undefined;
	return n;
};

export const toInputDate = (value?: string | null) => {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
};

export const formatDate = (value?: string | null) => {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleDateString();
};

export const buildTareasListParams = (
	empresaId: number | null,
	proyectoId: number | null,
	limit: number,
	q: string,
	estadoFiltro: "" | TareaEstado,
	prioridadFiltro: "" | TareaPrioridad,
	soloAsignadas: boolean,
	usuarioId: number | null
) => {
	const params: Record<string, unknown> = {
		limit,
		offset: 0,
	};

	if (empresaId) {
		params.empresaId = empresaId;
	}
	if (proyectoId) {
		params.proyectoId = proyectoId;
	}
	if (q.trim().length > 0) {
		params.q = q.trim();
	}
	if (estadoFiltro) {
		params.estado = estadoFiltro;
	}
	if (prioridadFiltro) {
		params.prioridad = prioridadFiltro;
	}
	if (soloAsignadas && usuarioId) {
		params.asignadoId = usuarioId;
	}

	return params;
};

export const ordenarKanbanPorEstado = (
	tareasProyecto: TareaListItem[]
): TareaListItem[] => {
	const result: TareaListItem[] = [];

	for (const estado of estados) {
		const subset = tareasProyecto
			.filter((t) => t.estado === estado)
			.slice()
			.sort((a, b) => {
				if (a.ordenKanban !== b.ordenKanban) {
					return a.ordenKanban - b.ordenKanban;
				}
				return a.id - b.id;
			})
			.map((t, index) => ({
				...t,
				ordenKanban: index,
			}));

		result.push(...subset);
	}

	return result;
};

export type TareaProgreso = {
	porcentaje: number;
	retrasada: boolean;
};

export const toTimestampOrNull = (value?: string | null) => {
	if (!value) return null;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.getTime();
};

export const calcularProgresoTarea = (
	fechaInicio?: string | null,
	fechaVencimiento?: string | null
): TareaProgreso | null => {
	if (!fechaInicio || !fechaVencimiento) return null;

	const inicioTs = toTimestampOrNull(fechaInicio);
	const finTs = toTimestampOrNull(fechaVencimiento);
	if (!inicioTs || !finTs || finTs <= inicioTs) return null;

	const ahoraTs = Date.now();

	if (ahoraTs <= inicioTs) {
		return { porcentaje: 0, retrasada: false };
	}

	if (ahoraTs >= finTs) {
		return { porcentaje: 100, retrasada: true };
	}

	const raw = ((ahoraTs - inicioTs) / (finTs - inicioTs)) * 100;
	const porcentaje = Math.min(100, Math.max(0, Math.round(raw)));

	return { porcentaje, retrasada: false };
};
