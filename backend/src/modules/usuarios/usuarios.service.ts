import { z } from "zod";
import { QueryDb } from "../../helpers/db";
import { createNotFoundError } from "../../helpers/routeHelper";
import {
	ShapeCreate,
	ShapeUpdate,
	ShapeList,
	ShapeProfilesAssign,
	type CreateInput,
	type UpdateInput,
	type ListInput,
	type ProfilesAssignInput,
} from "./usuarios.schemas";

type DbDeps = { query: QueryDb };

const buildUsuariosListFilter = (f: ListInput) => {
	const where: string[] = [];
	const args: unknown[] = [];

	if (f.empresaId) {
		where.push("u.empresas_id=?");
		args.push(f.empresaId);
	}
	if (f.usuario) {
		where.push("u.usuario=?");
		args.push(f.usuario);
	}
	if (f.correo) {
		where.push("u.correo=?");
		args.push(f.correo);
	}
	if (typeof f.isActive === "boolean") {
		where.push("u.is_active=?");
		args.push(f.isActive ? 1 : 0);
	}
	if (f.q) {
		where.push(
			"(u.usuario LIKE ? OR u.correo LIKE ? OR u.nombre_completo LIKE ?)"
		);
		args.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
	}

	const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

	return { sqlWhere, args };
};

export const listUsuarios = async ({ query }: DbDeps, input: ListInput) => {
	const f = ShapeList.parse(input);
	const { sqlWhere, args } = buildUsuariosListFilter(f);

	const rows = (await query(
		`SELECT SQL_CALC_FOUND_ROWS
       u.id,
       u.empresas_id,
       u.usuario,
       u.correo,
       u.hash_contrasena,
       u.nombre_completo,
       u.es_superadmin,
       u.is_active,
       u.last_login_at,
       u.created_at,
       u.updated_at,
       e.codigo AS empresa_codigo,
       e.nombre AS empresa_nombre
     FROM usuarios u
     JOIN empresas e ON e.id=u.empresas_id
     ${sqlWhere}
     ORDER BY u.usuario
     LIMIT ? OFFSET ?`,
		[...args, f.limit, f.offset]
	)) as any[];

	const totalRows = (await query("SELECT FOUND_ROWS() AS total")) as {
		total: number;
	}[];

	const data = rows.map((r) => ({
		id: r.id,
		empresaId: r.empresas_id,
		empresa: {
			id: r.empresas_id,
			codigo: r.empresa_codigo,
			nombre: r.empresa_nombre,
		},
		usuario: r.usuario,
		correo: r.correo,
		hashContrasena: r.hash_contrasena,
		nombreCompleto: r.nombre_completo,
		esSuperadmin: !!r.es_superadmin,
		isActive: !!r.is_active,
		lastLoginAt: r.last_login_at,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
	}));

	return {
		data,
		total: totalRows[0]?.total ?? 0,
		limit: f.limit,
		offset: f.offset,
	};
};

export const getUsuario = async ({ query }: DbDeps, input: { id: string }) => {
	const S = z.object({ id: z.string().min(1) }).parse(input);
	const rows = (await query(
		`SELECT
       u.id,
       u.empresas_id,
       u.usuario,
       u.correo,
       u.hash_contrasena,
       u.nombre_completo,
       u.es_superadmin,
       u.is_active,
       u.last_login_at,
       u.created_at,
       u.updated_at,
       e.codigo AS empresa_codigo,
       e.nombre AS empresa_nombre
     FROM usuarios u
     JOIN empresas e ON e.id=u.empresas_id
     WHERE u.id=? LIMIT 1`,
		[S.id]
	)) as any[];

	const r = rows[0];
	if (!r) throw createNotFoundError("Usuario no encontrado");

	const profs = (await query(
		`SELECT up.perfiles_id AS perfiles_id, p.codigo AS codigo, p.nombre AS nombre, up.es_principal AS es_principal
     FROM usuarios_perfiles up
     JOIN perfiles p ON p.id=up.perfiles_id
     WHERE up.usuarios_id=?
     ORDER BY up.es_principal DESC, p.nombre`,
		[S.id]
	)) as any[];

	return {
		id: r.id,
		empresaId: r.empresas_id,
		empresa: {
			id: r.empresas_id,
			codigo: r.empresa_codigo,
			nombre: r.empresa_nombre,
		},
		usuario: r.usuario,
		correo: r.correo,
		hashContrasena: r.hash_contrasena,
		nombreCompleto: r.nombre_completo,
		esSuperadmin: !!r.es_superadmin,
		isActive: !!r.is_active,
		lastLoginAt: r.last_login_at,
		createdAt: r.created_at,
		updatedAt: r.updated_at,
		perfiles: profs.map((x) => ({
			perfilesId: x.perfiles_id,
			codigo: x.codigo,
			nombre: x.nombre,
			esPrincipal: !!x.es_principal,
		})),
	};
};

export const createUsuario = async ({ query }: DbDeps, input: CreateInput) => {
	const c = ShapeCreate.parse(input);
	await query(
		`INSERT INTO usuarios (empresas_id,usuario,correo,hash_contrasena,nombre_completo,es_superadmin,is_active,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,NOW(),NOW())
     ON DUPLICATE KEY UPDATE correo=VALUES(correo),nombre_completo=VALUES(nombre_completo),es_superadmin=VALUES(es_superadmin),is_active=VALUES(is_active),updated_at=NOW()`,
		[
			c.empresaId,
			c.usuario,
			c.correo,
			c.hashContrasena,
			c.nombreCompleto,
			c.esSuperadmin ? 1 : 0,
			c.isActive ? 1 : 0,
		]
	);

	const row = (await query(
		"SELECT id FROM usuarios WHERE empresas_id=? AND usuario=? LIMIT 1",
		[c.empresaId, c.usuario]
	)) as { id: number }[];

	return { id: row[0]?.id };
};

export const updateUsuario = async ({ query }: DbDeps, input: UpdateInput) => {
	const S = ShapeUpdate.parse(input);
	const r = (await query(
		`UPDATE usuarios
     SET empresas_id=?,usuario=?,correo=?,nombre_completo=?,es_superadmin=?,is_active=?,hash_contrasena=COALESCE(?,hash_contrasena),updated_at=NOW()
     WHERE id=?`,
		[
			S.empresaId,
			S.usuario,
			S.correo,
			S.nombreCompleto,
			S.esSuperadmin ? 1 : 0,
			S.isActive ? 1 : 0,
			S.hashContrasena ?? null,
			S.id,
		]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Usuario no encontrado");
	return null;
};

export const updateUsuarioEstado = async (
	{ query }: DbDeps,
	input: { id: string; isActive: boolean }
) => {
	const S = z
		.object({ id: z.string().min(1), isActive: z.boolean() })
		.parse(input);

	const r = (await query(
		"UPDATE usuarios SET is_active=?, updated_at=NOW() WHERE id=?",
		[S.isActive ? 1 : 0, S.id]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Usuario no encontrado");
	return null;
};

export const updateUsuarioPerfiles = async (
	{ query }: DbDeps,
	input: ProfilesAssignInput
) => {
	const S = ShapeProfilesAssign.parse(input);

	await query("DELETE FROM usuarios_perfiles WHERE usuarios_id=?", [
		S.usuarioId,
	]);

	for (const p of S.perfiles) {
		await query(
			`INSERT INTO usuarios_perfiles (usuarios_id,perfiles_id,es_principal,assigned_at)
       VALUES (?,?,?,NOW())
       ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal), assigned_at=NOW()`,
			[S.usuarioId, p.perfilId, p.esPrincipal ? 1 : 0]
		);
	}

	return null;
};

export const deleteUsuario = async (
	{ query }: DbDeps,
	input: { id: string; hard?: boolean }
) => {
	const S = z
		.object({
			id: z.string().min(1),
			hard: z.boolean().optional(),
		})
		.parse(input);

	if (S.hard) {
		const r = (await query("DELETE FROM usuarios WHERE id=?", [S.id])) as {
			affectedRows?: number;
		};

		if (!r.affectedRows) {
			throw createNotFoundError("Usuario no encontrado");
		}
	} else {
		const r = (await query(
			"UPDATE usuarios SET is_active=0, updated_at=NOW() WHERE id=?",
			[S.id]
		)) as { affectedRows?: number };

		if (!r.affectedRows) {
			throw createNotFoundError("Usuario no encontrado");
		}
	}

	return null;
};
