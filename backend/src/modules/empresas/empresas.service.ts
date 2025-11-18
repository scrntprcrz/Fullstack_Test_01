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
} from "./empresas.schemas";

type DbCtx = { query: QueryDb };

export const listEmpresas = async ({ query }: DbCtx, input: ListInput) => {
	const f = ShapeList.parse(input);
	const where: string[] = [];
	const args: unknown[] = [];

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
		where.push("(codigo LIKE ? OR nombre LIKE ? OR correo LIKE ?)");
		args.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
	}

	const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
	const rows = (await query(
		`SELECT SQL_CALC_FOUND_ROWS id,codigo,nombre,tax_id,correo,telefono,direccion,is_active,updated_at
     FROM empresas ${sqlWhere}
     ORDER BY codigo,nombre
     LIMIT ? OFFSET ?`,
		[...args, f.limit, f.offset]
	)) as any[];

	const totalRows = (await query("SELECT FOUND_ROWS() AS total")) as {
		total: number;
	}[];

	const data = rows.map((r) => ({
		id: r.id,
		codigo: r.codigo,
		nombre: r.nombre,
		taxId: r.tax_id ?? "",
		correo: r.correo ?? "",
		telefono: r.telefono ?? "",
		direccion: r.direccion ?? "",
		isActive: !!r.is_active,
		updatedAt: r.updated_at,
	}));

	return {
		data,
		total: totalRows[0]?.total ?? 0,
		limit: f.limit,
		offset: f.offset,
	};
};

export const getEmpresa = async ({ query }: DbCtx, input: { id: string }) => {
	const S = z.object({ id: z.string().min(1) }).parse(input);
	const rows = (await query(
		`SELECT id,codigo,nombre,tax_id,correo,telefono,direccion,is_active,updated_at
     FROM empresas WHERE id=? LIMIT 1`,
		[S.id]
	)) as any[];
	const r = rows[0];
	if (!r) throw createNotFoundError("Empresa no encontrada");

	return {
		id: r.id,
		codigo: r.codigo,
		nombre: r.nombre,
		taxId: r.tax_id ?? "",
		correo: r.correo ?? "",
		telefono: r.telefono ?? "",
		direccion: r.direccion ?? "",
		isActive: !!r.is_active,
		updatedAt: r.updated_at,
	};
};

export const createEmpresa = async ({ query }: DbCtx, input: CreateInput) => {
	const c = ShapeCreate.parse(input);
	await query(
		`INSERT INTO empresas
     (codigo,nombre,tax_id,correo,telefono,direccion,is_active)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       nombre=VALUES(nombre),
       tax_id=VALUES(tax_id),
       correo=VALUES(correo),
       telefono=VALUES(telefono),
       direccion=VALUES(direccion),
       is_active=VALUES(is_active)`,
		[
			c.codigo,
			c.nombre,
			c.taxId ?? null,
			c.correo ?? null,
			c.telefono ?? null,
			c.direccion ?? null,
			c.isActive ? 1 : 0,
		]
	);

	const row = (await query("SELECT id FROM empresas WHERE codigo=? LIMIT 1", [
		c.codigo,
	])) as { id: number }[];

	return { id: row[0]?.id };
};

export const updateEmpresa = async ({ query }: DbCtx, input: UpdateInput) => {
	const S = ShapeUpdate.parse(input);
	const r = (await query(
		`UPDATE empresas
     SET codigo=?,nombre=?,tax_id=?,correo=?,telefono=?,direccion=?,is_active=?,updated_at=NOW()
     WHERE id=?`,
		[
			S.codigo,
			S.nombre,
			S.taxId ?? null,
			S.correo ?? null,
			S.telefono ?? null,
			S.direccion ?? null,
			S.isActive ? 1 : 0,
			S.id,
		]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Empresa no encontrada");
	return null;
};

export const updateEmpresaEstado = async (
	{ query }: DbCtx,
	input: { id: string; isActive: boolean }
) => {
	const S = z
		.object({ id: z.string().min(1), isActive: z.boolean() })
		.parse(input);

	const r = (await query(
		"UPDATE empresas SET is_active=?, updated_at=NOW() WHERE id=?",
		[S.isActive ? 1 : 0, S.id]
	)) as { affectedRows?: number };

	if (!r.affectedRows) throw createNotFoundError("Empresa no encontrada");
	return null;
};

export const deleteEmpresa = async (
	{ query }: DbCtx,
	input: { id: string; hard?: boolean }
) => {
	const S = z
		.object({ id: z.string().min(1), hard: z.boolean().optional() })
		.parse(input);

	if (S.hard) {
		const r = (await query("DELETE FROM empresas WHERE id=?", [S.id])) as {
			affectedRows?: number;
		};
		if (!r.affectedRows) throw createNotFoundError("Empresa no encontrada");
	} else {
		const r = (await query(
			"UPDATE empresas SET is_active=0, updated_at=NOW() WHERE id=?",
			[S.id]
		)) as { affectedRows?: number };
		if (!r.affectedRows) throw createNotFoundError("Empresa no encontrada");
	}

	return null;
};
