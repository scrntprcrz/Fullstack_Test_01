import { z } from "zod";
import { QueryDb } from "../../helpers/db";
import { createNotFoundError } from "../../helpers/routeHelper";
import {
	ShapeTareaCreate,
	ShapeTareaUpdate,
	ShapeTareaList,
	ShapeTareaEstadoUpdate,
	ShapeTareaReordenKanban,
	type TareaCreateInput,
	type TareaUpdateInput,
	type TareaListInput,
	type TareaEstadoUpdateInput,
	type TareaReordenKanbanInput,
} from "./tareas.schemas";

type DbCtx = { query: QueryDb };

const buildOrderBy = (orderBy?: string, orderDirection?: string) => {
	const dir = orderDirection === "asc" ? "ASC" : "DESC";

	if (orderBy === "createdAt") return `t.created_at ${dir}`;
	if (orderBy === "fechaVencimiento") return `t.fecha_vencimiento ${dir}`;
	if (orderBy === "prioridad") return `t.prioridad ${dir}`;
	if (orderBy === "estado") return `t.estado ${dir}`;
	if (orderBy === "ordenKanban") return `t.orden_kanban ${dir}`;

	return `t.orden_kanban ${dir}`;
};

type TareaFechaCheckInput = {
	proyectoId: number;
	fechaInicio?: string | null;
	fechaVencimiento?: string | null;
};

const ensureFechasDentroDeProyecto = async (
	{ query }: DbCtx,
	params: TareaFechaCheckInput
) => {
	const { proyectoId, fechaInicio, fechaVencimiento } = params;

	if (!fechaInicio && !fechaVencimiento) return;

	const rows = (await query(
		"SELECT fecha_inicio, fecha_fin FROM proyectos WHERE id=? LIMIT 1",
		[proyectoId]
	)) as { fecha_inicio: Date | null; fecha_fin: Date | null }[];

	const proyecto = rows[0];
	if (!proyecto) return;

	const toTs = (value?: Date | string | null) => {
		if (!value) return null;
		const d = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(d.getTime())) return null;
		return d.getTime();
	};

	const proyectoInicioTs = toTs(proyecto.fecha_inicio);
	const proyectoFinTs = toTs(proyecto.fecha_fin);
	const tareaInicioTs = toTs(fechaInicio ?? null);
	const tareaFinTs = toTs(fechaVencimiento ?? null);

	if (proyectoInicioTs && tareaInicioTs && tareaInicioTs < proyectoInicioTs) {
		throw new Error(
			"La fecha de inicio de la tarea no puede ser anterior al inicio del proyecto"
		);
	}

	if (proyectoFinTs && tareaFinTs && tareaFinTs > proyectoFinTs) {
		throw new Error(
			"La fecha de vencimiento de la tarea no puede ser posterior al fin del proyecto"
		);
	}
};

const assertAsignadoEsColaborador = async (
	{ query }: DbCtx,
	proyectoId: number,
	asignadoId?: number
) => {
	if (!asignadoId) return;

	const rows = (await query(
		`SELECT 1
     FROM proyectos_usuarios
     WHERE proyectos_id=? AND usuarios_id=?
     LIMIT 1`,
		[proyectoId, asignadoId]
	)) as any[];

	if (!rows.length)
		throw createNotFoundError("El usuario no es colaborador del proyecto");
};

export const listTareas = async ({ query }: DbCtx, input: TareaListInput) => {
	const f = ShapeTareaList.parse(input);

	const where: string[] = [];
	const args: unknown[] = [];
	const joins: string[] = ["JOIN proyectos p ON p.id=t.proyectos_id"];

	if (f.empresaId) {
		where.push("p.empresas_id=?");
		args.push(f.empresaId);
	}

	if (f.proyectoId) {
		where.push("t.proyectos_id=?");
		args.push(f.proyectoId);
	}

	if (f.estado) {
		where.push("t.estado=?");
		args.push(f.estado);
	}

	if (f.prioridad) {
		where.push("t.prioridad=?");
		args.push(f.prioridad);
	}

	if (f.asignadoId) {
		where.push("t.asignado_id=?");
		args.push(f.asignadoId);
	}

	if (f.q) {
		where.push("(t.titulo LIKE ? OR t.descripcion LIKE ?)");
		args.push(`%${f.q}%`, `%${f.q}%`);
	}

	const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
	const sqlJoins = joins.join(" ");
	const orderBySql = buildOrderBy(f.orderBy, f.orderDirection);

	const rows = (await query(
		`SELECT SQL_CALC_FOUND_ROWS
       t.id,
       t.proyectos_id,
       t.titulo,
       t.descripcion,
       t.estado,
       t.prioridad,
       t.asignado_id,
       t.orden_kanban,
       t.fecha_inicio,
       t.fecha_vencimiento,
       t.is_archivada,
       t.created_at,
       t.updated_at,
       p.empresas_id,
       p.nombre AS proyecto_nombre,
       u.nombre_completo AS asignado_nombre
     FROM tareas t
     ${sqlJoins}
     LEFT JOIN usuarios u ON u.id=t.asignado_id
     ${sqlWhere}
     ORDER BY ${orderBySql}
     LIMIT ? OFFSET ?`,
		[...args, f.limit, f.offset]
	)) as any[];

	const totalRows = (await query("SELECT FOUND_ROWS() AS total")) as {
		total: number;
	}[];

	const data = rows.map((r) => ({
		id: r.id,
		proyectoId: r.proyectos_id,
		titulo: r.titulo,
		descripcion: r.descripcion,
		estado: r.estado,
		prioridad: r.prioridad,
		asignadoId: r.asignado_id,
		ordenKanban: r.orden_kanban,
		fechaInicio: r.fecha_inicio,
		fechaVencimiento: r.fecha_vencimiento,
		isArchivada: !!r.is_archivada,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
		proyecto: {
			id: r.proyectos_id,
			empresaId: r.empresas_id,
			nombre: r.proyecto_nombre,
		},
		asignado: r.asignado_id
			? {
					id: r.asignado_id,
					nombreCompleto: r.asignado_nombre,
			  }
			: null,
	}));

	return {
		data,
		total: totalRows[0]?.total ?? 0,
		limit: f.limit,
		offset: f.offset,
	};
};

export const getTarea = async ({ query }: DbCtx, input: { id: string }) => {
	const S = z.object({ id: z.string().min(1) }).parse(input);

	const rows = (await query(
		`SELECT
       t.id,
       t.proyectos_id,
       t.titulo,
       t.descripcion,
       t.estado,
       t.prioridad,
       t.asignado_id,
       t.orden_kanban,
       t.fecha_inicio,
       t.fecha_vencimiento,
       t.is_archivada,
       t.created_at,
       t.updated_at,
       p.empresas_id,
       p.nombre AS proyecto_nombre,
       u.nombre_completo AS asignado_nombre
     FROM tareas t
     JOIN proyectos p ON p.id=t.proyectos_id
     LEFT JOIN usuarios u ON u.id=t.asignado_id
     WHERE t.id=?
     LIMIT 1`,
		[S.id]
	)) as any[];

	const r = rows[0];
	if (!r) throw createNotFoundError("Tarea no encontrada");

	return {
		id: r.id,
		proyectoId: r.proyectos_id,
		titulo: r.titulo,
		descripcion: r.descripcion,
		estado: r.estado,
		prioridad: r.prioridad,
		asignadoId: r.asignado_id,
		ordenKanban: r.orden_kanban,
		fechaInicio: r.fecha_inicio,
		fechaVencimiento: r.fecha_vencimiento,
		isArchivada: !!r.is_archivada,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
		proyecto: {
			id: r.proyectos_id,
			empresaId: r.empresas_id,
			nombre: r.proyecto_nombre,
		},
		asignado: r.asignado_id
			? {
					id: r.asignado_id,
					nombreCompleto: r.asignado_nombre,
			  }
			: null,
	};
};

export const createTarea = async (ctx: DbCtx, input: TareaCreateInput) => {
	const { query } = ctx;
	const c = ShapeTareaCreate.parse(input);

	await ensureFechasDentroDeProyecto(
		{ query },
		{
			proyectoId: c.proyectoId,
			fechaInicio: c.fechaInicio ?? null,
			fechaVencimiento: c.fechaVencimiento ?? null,
		}
	);

	await assertAsignadoEsColaborador({ query }, c.proyectoId, c.asignadoId);

	const r = (await query(
		`INSERT INTO tareas
       (proyectos_id,titulo,descripcion,estado,prioridad,asignado_id,orden_kanban,fecha_inicio,fecha_vencimiento,is_archivada,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,0,NOW(),NOW())`,
		[
			c.proyectoId,
			c.titulo.trim(),
			c.descripcion ?? null,
			c.estado,
			c.prioridad,
			c.asignadoId ?? null,
			c.ordenKanban,
			c.fechaInicio ?? null,
			c.fechaVencimiento ?? null,
		]
	)) as { insertId?: number };

	if (!r.insertId) throw createNotFoundError("No se pudo crear la tarea");

	return { id: r.insertId };
};

export const updateTarea = async (ctx: DbCtx, input: TareaUpdateInput) => {
	const { query } = ctx;
	const S = ShapeTareaUpdate.parse(input);

	await ensureFechasDentroDeProyecto(
		{ query },
		{
			proyectoId: S.proyectoId,
			fechaInicio: S.fechaInicio ?? null,
			fechaVencimiento: S.fechaVencimiento ?? null,
		}
	);

	await assertAsignadoEsColaborador({ query }, S.proyectoId, S.asignadoId);

	const r = (await query(
		`UPDATE tareas
      SET proyectos_id=?,
          titulo=?,
          descripcion=?,
          estado=?,
          prioridad=?,
          asignado_id=?,
          orden_kanban=?,
          fecha_inicio=?,
          fecha_vencimiento=?,
          updated_at=NOW()
      WHERE id=? AND proyectos_id=?`,
		[
			S.proyectoId,
			S.titulo.trim(),
			S.descripcion ?? null,
			S.estado,
			S.prioridad,
			S.asignadoId ?? null,
			S.ordenKanban,
			S.fechaInicio ?? null,
			S.fechaVencimiento ?? null,
			S.id,
			S.proyectoId,
		]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Tarea no encontrada");
	return null;
};

export const updateTareaEstado = async (
	{ query }: DbCtx,
	input: TareaEstadoUpdateInput
) => {
	const S = ShapeTareaEstadoUpdate.parse(input);

	const r = (await query(
		`UPDATE tareas
      SET estado=?,
          updated_at=NOW()
      WHERE id=?`,
		[S.estado, S.id]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Tarea no encontrada");
	return null;
};

export const deleteTarea = async (
	{ query }: DbCtx,
	input: { id: string; hard: boolean }
) => {
	const S = z
		.object({
			id: z.string().min(1),
			hard: z.boolean().default(true),
		})
		.parse(input);

	if (S.hard) {
		const r = (await query(
			`DELETE FROM tareas
       WHERE id=?`,
			[S.id]
		)) as { affectedRows?: number };

		if (!r.affectedRows) throw createNotFoundError("Tarea no encontrada");
		return null;
	}

	const r = (await query(
		`UPDATE tareas
      SET is_archivada=1,
          updated_at=NOW()
      WHERE id=?`,
		[S.id]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Tarea no encontrada");
	return null;
};

export const reordenarTareasKanban = async (
	{ query }: DbCtx,
	input: TareaReordenKanbanInput
) => {
	const S = ShapeTareaReordenKanban.parse(input);

	for (const item of S.items) {
		const r = (await query(
			`UPDATE tareas
       SET estado=?,
           orden_kanban=?,
           updated_at=NOW()
       WHERE id=? AND proyectos_id=?`,
			[item.estado, item.ordenKanban, item.id, S.proyectoId]
		)) as { affectedRows?: number };

		if (!r.affectedRows) {
			throw createNotFoundError("Tarea no encontrada");
		}
	}

	return null;
};
