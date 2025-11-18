export const PROYECTOS_PAGE_SIZE = 20;

export type ProyectoListItem = {
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
};

export type ProyectoColaboradorItem = {
	usuarioId: number;
	usuario: string;
	nombreCompleto: string;
	correo: string;
	esPropietario: boolean;
	puedeEditar: boolean;
};

export type ProyectoDetalle = {
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
	colaboradores: ProyectoColaboradorItem[];
};

export type ProyectosListResponse = {
	data: ProyectoListItem[];
	total: number;
	limit: number;
	offset: number;
};

export const buildProyectosListParams = (
	empresaId: number,
	limit: number,
	offset: number,
	q?: string,
	soloActivos?: boolean,
	creadorId?: number,
	colaboradorId?: number
) => {
	const params: Record<string, unknown> = {
		empresaId,
		limit,
		offset,
	};

	if (q && q.trim().length > 0) {
		params.q = q.trim();
	}

	if (soloActivos) {
		params.soloActivos = true;
	}

	if (creadorId) {
		params.creadorId = creadorId;
	}

	if (colaboradorId) {
		params.colaboradorId = colaboradorId;
	}

	return params;
};

export const normalizeFecha = (value?: string) => {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return null;
	return trimmed;
};

export type ProyectoFormBase = {
	codigo: string;
	nombre: string;
	descripcion?: string;
	fechaInicio?: string;
	fechaFin?: string;
	isArchivado: boolean;
};

export const buildProyectoCreatePayload = <T extends ProyectoFormBase>(
	values: T,
	empresaId: number,
	creadorId: number
) => ({
	empresaId,
	codigo: values.codigo.trim(),
	nombre: values.nombre.trim(),
	descripcion: values.descripcion?.trim() || undefined,
	fechaInicio: normalizeFecha(values.fechaInicio),
	fechaFin: normalizeFecha(values.fechaFin),
	creadorId,
});

export const buildProyectoUpdatePayload = <T extends ProyectoFormBase>(
	values: T,
	empresaId: number,
	id: number,
	usuarioId: number
) => ({
	id,
	empresaId,
	codigo: values.codigo.trim(),
	nombre: values.nombre.trim(),
	descripcion: values.descripcion?.trim() || undefined,
	fechaInicio: normalizeFecha(values.fechaInicio),
	fechaFin: normalizeFecha(values.fechaFin),
	isArchivado: values.isArchivado,
	usuarioId,
});

export const formatDate = (value?: string | null) => {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleDateString();
};

export const toInputDate = (value?: string | null) => {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
};
