import { z } from "zod";
import { QueryDb } from "../../helpers/db";
import { createNotFoundError } from "../../helpers/routeHelper";
import {
	ShapeCreate,
	ShapeUpdate,
	ShapeList,
	type CreateInput,
	type UpdateInput,
	type ListInput,
} from "./perfiles.schemas";

type DbCtx = { query: QueryDb };

const serializeMenuConfigJson = (value: unknown): string | null => {
	if (value == null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return null;
		JSON.parse(trimmed);
		return trimmed;
	}
	const serialized = JSON.stringify(value);
	JSON.parse(serialized);
	return serialized;
};

const parseMenuConfigJsonFromDb = (raw: unknown): unknown => {
	if (raw == null) return null;
	if (typeof raw !== "string") return raw;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	try {
		return JSON.parse(trimmed);
	} catch {
		return null;
	}
};

export const listPerfiles = async ({ query }: DbCtx, input: ListInput) => {
	const f = ShapeList.parse(input);

	const where: string[] = [];
	const args: unknown[] = [];

	if (f.empresaId) {
		where.push("empresas_id=?");
		args.push(f.empresaId);
	}
	if (f.codigo) {
		where.push("codigo=?");
		args.push(f.codigo);
	}
	if (f.nombre) {
		where.push("nombre LIKE ?");
		args.push(`%${f.nombre}%`);
	}
	if (typeof f.isActive === "boolean") {
		where.push("is_active=?");
		args.push(f.isActive ? 1 : 0);
	}
	if (f.q) {
		where.push("(codigo LIKE ? OR nombre LIKE ?)");
		args.push(`%${f.q}%`, `%${f.q}%`);
	}

	const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

	const rows = (await query(
		`SELECT SQL_CALC_FOUND_ROWS id,empresas_id,codigo,nombre,descripcion,es_sistema,is_active,menu_config_json,updated_at
     FROM perfiles ${sqlWhere}
     ORDER BY nombre
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
		descripcion: r.descripcion ?? "",
		esSistema: !!r.es_sistema,
		isActive: !!r.is_active,
		menuConfigJson: parseMenuConfigJsonFromDb(r.menu_config_json),
		updatedAt: r.updated_at,
	}));

	return {
		data,
		total: totalRows[0]?.total ?? 0,
		limit: f.limit,
		offset: f.offset,
	};
};

export const getPerfil = async ({ query }: DbCtx, input: { id: string }) => {
	const S = z.object({ id: z.string().min(1) }).parse(input);

	const rows = (await query(
		`SELECT id,empresas_id,codigo,nombre,descripcion,es_sistema,is_active,menu_config_json,updated_at
     FROM perfiles WHERE id=? LIMIT 1`,
		[S.id]
	)) as any[];

	const r = rows[0];
	if (!r) throw createNotFoundError("Perfil no encontrado");

	return {
		id: r.id,
		empresaId: r.empresas_id,
		codigo: r.codigo,
		nombre: r.nombre,
		descripcion: r.descripcion ?? "",
		esSistema: !!r.es_sistema,
		isActive: !!r.is_active,
		menuConfigJson: parseMenuConfigJsonFromDb(r.menu_config_json),
		updatedAt: r.updated_at,
	};
};

export const createPerfil = async ({ query }: DbCtx, input: CreateInput) => {
	const c = ShapeCreate.parse(input);
	const menuConfigJson = serializeMenuConfigJson(c.menuConfigJson);

	await query(
		`INSERT INTO perfiles (empresas_id,codigo,nombre,descripcion,menu_config_json,es_sistema,is_active)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),descripcion=VALUES(descripcion),menu_config_json=VALUES(menu_config_json),es_sistema=VALUES(es_sistema),is_active=VALUES(is_active)`,
		[
			c.empresaId,
			c.codigo,
			c.nombre,
			c.descripcion ?? null,
			menuConfigJson,
			c.esSistema ? 1 : 0,
			c.isActive ? 1 : 0,
		]
	);

	const row = (await query(
		"SELECT id FROM perfiles WHERE empresas_id=? AND codigo=? LIMIT 1",
		[c.empresaId, c.codigo]
	)) as { id: number }[];

	return { id: row[0]?.id };
};

export const updatePerfil = async ({ query }: DbCtx, input: UpdateInput) => {
	const S = ShapeUpdate.parse(input);
	const menuConfigJson = serializeMenuConfigJson(S.menuConfigJson);

	const r = (await query(
		`UPDATE perfiles
     SET empresas_id=?,codigo=?,nombre=?,descripcion=?,menu_config_json=?,es_sistema=?,is_active=?
     WHERE id=?`,
		[
			S.empresaId,
			S.codigo,
			S.nombre,
			S.descripcion ?? null,
			menuConfigJson,
			S.esSistema ? 1 : 0,
			S.isActive ? 1 : 0,
			S.id,
		]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Perfil no encontrado");
	return null;
};

export const updatePerfilEstado = async (
	{ query }: DbCtx,
	input: { id: string; isActive: boolean }
) => {
	const S = z
		.object({ id: z.string().min(1), isActive: z.boolean() })
		.parse(input);

	const r = (await query("UPDATE perfiles SET is_active=? WHERE id=?", [
		S.isActive ? 1 : 0,
		S.id,
	])) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Perfil no encontrado");
	return null;
};

export const deletePerfil = async (
	{ query }: DbCtx,
	input: { id: string; hard?: boolean }
) => {
	const S = z
		.object({ id: z.string().min(1), hard: z.boolean().optional() })
		.parse(input);

	if (S.hard) {
		const r = (await query("DELETE FROM perfiles WHERE id=?", [S.id])) as {
			affectedRows?: number;
		};
		if (!r.affectedRows) throw createNotFoundError("Perfil no encontrado");
	} else {
		const r = (await query("UPDATE perfiles SET is_active=0 WHERE id=?", [
			S.id,
		])) as { affectedRows?: number };
		if (!r.affectedRows) throw createNotFoundError("Perfil no encontrado");
	}

	return null;
};
