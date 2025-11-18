import { z } from "zod";
import { QueryDb } from "../../helpers/db";
import { createNotFoundError } from "../../helpers/routeHelper";
import {
	ShapeProyectoCreate,
	ShapeProyectoUpdate,
	ShapeProyectoList,
	ShapeProyectoColaboradoresList,
	ShapeProyectoColaboradorAssign,
	type ProyectoCreateInput,
	type ProyectoUpdateInput,
	type ProyectoListInput,
	type ProyectoColaboradoresListInput,
	type ProyectoColaboradorAssignInput,
} from "./proyectos.schemas";

type DbCtx = { query: QueryDb };

const toMysqlDate = (value?: string | null) => {
	if (!value) return null;
	const trimmed = String(value).trim();
	if (!trimmed) return null;

	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		return trimmed;
	}

	const d = new Date(trimmed);
	if (Number.isNaN(d.getTime())) return null;

	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const listProyectos = async (
	{ query }: DbCtx,
	input: ProyectoListInput
) => {
	const f = ShapeProyectoList.parse(input);
	const where: string[] = [];
	const args: unknown[] = [];
	const joins: string[] = [];

	where.push("p.empresas_id=?");
	args.push(f.empresaId);

	if (f.creadorId) {
		where.push("p.creador_id=?");
		args.push(f.creadorId);
	}

	if (f.colaboradorId) {
		joins.push(
			"JOIN proyectos_usuarios pu ON pu.proyectos_id=p.id AND pu.usuarios_id=?"
		);
		args.push(f.colaboradorId);
	}

	if (typeof f.soloActivos === "boolean" && f.soloActivos) {
		where.push("p.is_archivado=0");
	}

	if (f.q) {
		where.push("(p.codigo LIKE ? OR p.nombre LIKE ?)");
		args.push(`%${f.q}%`, `%${f.q}%`);
	}

	const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
	const sqlJoins = joins.join(" ");

	const rows = (await query(
		`SELECT SQL_CALC_FOUND_ROWS
       p.id,
       p.empresas_id,
       p.codigo,
       p.nombre,
       p.descripcion,
       p.creador_id,
       p.fecha_inicio,
       p.fecha_fin,
       p.is_archivado,
       p.created_at,
       p.updated_at,
       e.codigo AS empresa_codigo,
       e.nombre AS empresa_nombre,
       u.usuario AS creador_usuario,
       u.nombre_completo AS creador_nombre
     FROM proyectos p
     JOIN empresas e ON e.id=p.empresas_id
     JOIN usuarios u ON u.id=p.creador_id
     ${sqlJoins}
     ${sqlWhere}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
		[...args, f.limit, f.offset]
	)) as any[];

	const totalRows = (await query("SELECT FOUND_ROWS() AS total")) as {
		total: number;
	}[];

	const data = rows.map((r) => ({
		id: r.id,
		empresaId: r.empresas_id,
		codigo: r.codigo,
		nombre: r.nombre,
		descripcion: r.descripcion,
		creadorId: r.creador_id,
		fechaInicio: r.fecha_inicio,
		fechaFin: r.fecha_fin,
		isArchivado: !!r.is_archivado,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
		empresa: {
			id: r.empresas_id,
			codigo: r.empresa_codigo,
			nombre: r.empresa_nombre,
		},
		creador: {
			id: r.creador_id,
			usuario: r.creador_usuario,
			nombreCompleto: r.creador_nombre,
		},
	}));

	return {
		data,
		total: totalRows[0]?.total ?? 0,
		limit: f.limit,
		offset: f.offset,
	};
};

export const getProyecto = async ({ query }: DbCtx, input: { id: string }) => {
	const S = z.object({ id: z.string().min(1) }).parse(input);

	const rows = (await query(
		`SELECT
       p.id,
       p.empresas_id,
       p.codigo,
       p.nombre,
       p.descripcion,
       p.creador_id,
       p.fecha_inicio,
       p.fecha_fin,
       p.is_archivado,
       p.created_at,
       p.updated_at,
       e.codigo AS empresa_codigo,
       e.nombre AS empresa_nombre,
       u.usuario AS creador_usuario,
       u.nombre_completo AS creador_nombre
     FROM proyectos p
     JOIN empresas e ON e.id=p.empresas_id
     JOIN usuarios u ON u.id=p.creador_id
     WHERE p.id=? LIMIT 1`,
		[S.id]
	)) as any[];

	const r = rows[0];
	if (!r) throw createNotFoundError("Proyecto no encontrado");

	const colaboradores = (await query(
		`SELECT
       pu.usuarios_id,
       pu.es_propietario,
       pu.puede_editar,
       u.usuario,
       u.nombre_completo,
       u.correo
     FROM proyectos_usuarios pu
     JOIN usuarios u ON u.id=pu.usuarios_id
     WHERE pu.proyectos_id=?
     ORDER BY u.nombre_completo`,
		[r.id]
	)) as any[];

	return {
		id: r.id,
		empresaId: r.empresas_id,
		codigo: r.codigo,
		nombre: r.nombre,
		descripcion: r.descripcion,
		creadorId: r.creador_id,
		fechaInicio: r.fecha_inicio,
		fechaFin: r.fecha_fin,
		isArchivado: !!r.is_archivado,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
		empresa: {
			id: r.empresas_id,
			codigo: r.empresa_codigo,
			nombre: r.empresa_nombre,
		},
		creador: {
			id: r.creador_id,
			usuario: r.creador_usuario,
			nombreCompleto: r.creador_nombre,
		},
		colaboradores: colaboradores.map((c) => ({
			usuarioId: c.usuarios_id,
			usuario: c.usuario,
			nombreCompleto: c.nombre_completo,
			correo: c.correo,
			esPropietario: !!c.es_propietario,
			puedeEditar: !!c.puede_editar,
		})),
	};
};

export const createProyecto = async (
	{ query }: DbCtx,
	input: ProyectoCreateInput
) => {
	const c = ShapeProyectoCreate.parse(input);

	const fechaInicio = toMysqlDate(c.fechaInicio ?? null);
	const fechaFin = toMysqlDate(c.fechaFin ?? null);

	await query(
		`INSERT INTO proyectos
       (empresas_id,codigo,nombre,descripcion,creador_id,fecha_inicio,fecha_fin,is_archivado,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,0,NOW(),NOW())
     ON DUPLICATE KEY UPDATE
       nombre=VALUES(nombre),
       descripcion=VALUES(descripcion),
       fecha_inicio=VALUES(fecha_inicio),
       fecha_fin=VALUES(fecha_fin),
       updated_at=NOW()`,
		[
			c.empresaId,
			c.codigo.trim(),
			c.nombre.trim(),
			c.descripcion ?? null,
			c.creadorId,
			fechaInicio,
			fechaFin,
		]
	);

	const rows = (await query(
		`SELECT id
     FROM proyectos
     WHERE empresas_id=? AND codigo=?
     ORDER BY id DESC
     LIMIT 1`,
		[c.empresaId, c.codigo.trim()]
	)) as { id: number }[];

	const r = rows[0];
	if (!r) throw createNotFoundError("Proyecto no encontrado");

	await query(
		`INSERT INTO proyectos_usuarios
       (proyectos_id,usuarios_id,es_propietario,puede_editar,assigned_at)
     VALUES (?,?,?,?,NOW())
     ON DUPLICATE KEY UPDATE
       es_propietario=VALUES(es_propietario),
       puede_editar=VALUES(puede_editar)`,
		[r.id, c.creadorId, 1, 1]
	);

	return { id: r.id };
};

export const updateProyecto = async (
	{ query }: DbCtx,
	input: ProyectoUpdateInput
) => {
	const S = ShapeProyectoUpdate.parse(input);

	const fechaInicio = toMysqlDate(S.fechaInicio ?? null);
	const fechaFin = toMysqlDate(S.fechaFin ?? null);

	const r = (await query(
		`UPDATE proyectos
     SET empresas_id=?,
         codigo=?,
         nombre=?,
         descripcion=?,
         fecha_inicio=?,
         fecha_fin=?,
         is_archivado=?,
         updated_at=NOW()
     WHERE id=? AND creador_id=?`,
		[
			S.empresaId,
			S.codigo.trim(),
			S.nombre.trim(),
			S.descripcion ?? null,
			fechaInicio,
			fechaFin,
			S.isArchivado ? 1 : 0,
			S.id,
			S.usuarioId,
		]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Proyecto no encontrado");
	return null;
};

export const deleteProyecto = async (
	{ query }: DbCtx,
	input: { id: string; usuarioId: number; hard: boolean }
) => {
	const S = z
		.object({
			id: z.string().min(1),
			usuarioId: z.coerce.number().int().positive(),
			hard: z.boolean().default(false),
		})
		.parse(input);

	if (S.hard) {
		const r = (await query(
			`DELETE FROM proyectos
       WHERE id=? AND creador_id=?`,
			[S.id, S.usuarioId]
		)) as { affectedRows?: number };

		if (!r.affectedRows)
			throw createNotFoundError("Proyecto no encontrado");
		return null;
	}

	const r = (await query(
		`UPDATE proyectos
     SET is_archivado=1,
         updated_at=NOW()
     WHERE id=? AND creador_id=?`,
		[S.id, S.usuarioId]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Proyecto no encontrado");
	return null;
};

export const listProyectoColaboradores = async (
	{ query }: DbCtx,
	input: ProyectoColaboradoresListInput
) => {
	const S = ShapeProyectoColaboradoresList.parse(input);

	const rows = (await query(
		`SELECT
       pu.usuarios_id,
       pu.es_propietario,
       pu.puede_editar,
       u.usuario,
       u.nombre_completo,
       u.correo
     FROM proyectos_usuarios pu
     JOIN usuarios u ON u.id=pu.usuarios_id
     WHERE pu.proyectos_id=?
     ORDER BY u.nombre_completo`,
		[S.proyectoId]
	)) as any[];

	const data = rows.map((r) => ({
		usuarioId: r.usuarios_id,
		usuario: r.usuario,
		nombreCompleto: r.nombre_completo,
		correo: r.correo,
		esPropietario: !!r.es_propietario,
		puedeEditar: !!r.puede_editar,
	}));

	return { data };
};

export const addProyectoColaborador = async (
	{ query }: DbCtx,
	input: ProyectoColaboradorAssignInput
) => {
	const S = ShapeProyectoColaboradorAssign.parse(input);

	await query(
		`INSERT INTO proyectos_usuarios
       (proyectos_id,usuarios_id,es_propietario,puede_editar,assigned_at)
     VALUES (?,?,?,?,NOW())
     ON DUPLICATE KEY UPDATE
       es_propietario=VALUES(es_propietario),
       puede_editar=VALUES(puede_editar)`,
		[
			S.proyectoId,
			S.usuarioId,
			S.esPropietario ? 1 : 0,
			S.puedeEditar ? 1 : 0,
		]
	);

	return null;
};

export const removeProyectoColaborador = async (
	{ query }: DbCtx,
	input: { proyectoId: number; usuarioId: number }
) => {
	const S = z
		.object({
			proyectoId: z.coerce.number().int().positive(),
			usuarioId: z.coerce.number().int().positive(),
		})
		.parse(input);

	const r = (await query(
		`DELETE FROM proyectos_usuarios
     WHERE proyectos_id=? AND usuarios_id=?`,
		[S.proyectoId, S.usuarioId]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Colaborador no encontrado");
	return null;
};
