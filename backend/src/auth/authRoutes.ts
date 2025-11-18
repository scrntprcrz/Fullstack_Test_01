import { z } from "zod";
import Boom from "@hapi/boom";
import type { Application, Request, Response, NextFunction } from "express";
import { authConfig } from "../auth/config";
import {
	issueAccessToken,
	generateRefreshToken,
	constantTimeEqual,
} from "../auth/tokens";
import { requireAuth } from "../auth/middleware";
import {
	wrapActionAsRouteHandler,
	createNotFoundError,
} from "../helpers/routeHelper";
import bcrypt from "bcryptjs";
import { QueryDb } from "../helpers/db";

const ShapeLogin = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const ShapeRefresh = z.object({
	refreshToken: z.string().optional(),
});

const ShapeLogout = z.object({
	refreshToken: z.string().optional(),
});

type LoginInput = z.infer<typeof ShapeLogin>;
type RefreshInput = z.infer<typeof ShapeRefresh>;
type LogoutInput = z.infer<typeof ShapeLogout>;

interface LoginUserRow {
	id: number;
	empresas_id: number;
	usuario: string;
	correo: string;
	hash_contrasena: string;
	nombre_completo: string;
	es_superadmin: number | boolean;
	is_active: number | boolean;
	empresa_codigo: string;
	empresa_nombre: string;
}

interface AuthRecordRow {
	id: number;
	usuarios_id: number;
	jti: string;
	hash_refresco: string;
	expires_at: Date | string;
	is_active: number | boolean;
}

interface MeInput {
	userId: number;
}

interface MeWithMenuInput {
	userId: number;
}

const getCookie = (req: Request, name: string): string | null => {
	const raw = req.headers.cookie ?? "";
	const parts = raw.split(";").map((x) => x.trim());
	for (const p of parts) {
		const i = p.indexOf("=");
		if (i > 0) {
			const k = p.slice(0, i);
			const v = p.slice(i + 1);
			if (k === name) return decodeURIComponent(v);
		}
	}
	return null;
};

const setRefreshCookie = (
	res: Response,
	token: string,
	maxAgeSec: number
): void => {
	const flags = [
		`Path=${authConfig.cookiePath}`,
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${maxAgeSec}`,
	];
	if (authConfig.useSecureCookies) flags.push("Secure");
	res.setHeader(
		"Set-Cookie",
		`${authConfig.cookieName}=${encodeURIComponent(token)}; ${flags.join(
			"; "
		)}`
	);
};

const clearRefreshCookie = (res: Response): void => {
	const flags = [
		`Path=${authConfig.cookiePath}`,
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (authConfig.useSecureCookies) flags.push("Secure");
	res.setHeader(
		"Set-Cookie",
		`${authConfig.cookieName}=; ${flags.join("; ")}`
	);
};

const fetchUserForLogin = async (
	{ query }: { query: QueryDb },
	{ email }: Pick<LoginInput, "email">
): Promise<LoginUserRow | null> => {
	if (!email) return null;
	const rows = (await query(
		`SELECT u.id,u.empresas_id,u.usuario,u.correo,u.hash_contrasena,u.nombre_completo,u.es_superadmin,u.is_active,
            e.codigo AS empresa_codigo,e.nombre AS empresa_nombre
     FROM usuarios u JOIN empresas e ON e.id=u.empresas_id
     WHERE u.correo=? LIMIT 1`,
		[email]
	)) as LoginUserRow[];
	return rows[0] ?? null;
};

const createAuthRecord = async (
	{ query }: { query: QueryDb },
	{
		userId,
		jti,
		hash,
		ttlSec,
		ua,
		ip,
	}: {
		userId: number;
		jti: string;
		hash: string;
		ttlSec: number;
		ua?: string | string[] | undefined;
		ip?: string | string[] | undefined;
	}
): Promise<void> => {
	const expiresAt = new Date(Date.now() + ttlSec * 1000);
	await query(
		`INSERT INTO tokens_autenticacion (usuarios_id,jti,hash_refresco,expires_at,agente_usuario,ip,is_active)
     VALUES (?,?,?,?,?,?,1)
     ON DUPLICATE KEY UPDATE hash_refresco=VALUES(hash_refresco),expires_at=VALUES(expires_at),agente_usuario=VALUES(agente_usuario),ip=VALUES(ip),is_active=1`,
		[userId, jti, hash, expiresAt, ua ?? null, ip ?? null]
	);
};

const revokeAuthRecord = async (
	{ query }: { query: QueryDb },
	{ jti }: { jti: string }
): Promise<void> => {
	await query(
		"UPDATE tokens_autenticacion SET is_active=0,revoked_at=NOW() WHERE jti=?",
		[jti]
	);
};

const findAuthRecordByJti = async (
	{ query }: { query: QueryDb },
	{ jti }: { jti: string }
): Promise<AuthRecordRow | null> => {
	const rows = (await query(
		`SELECT id,usuarios_id,jti,hash_refresco,expires_at,is_active
     FROM tokens_autenticacion WHERE jti=? LIMIT 1`,
		[jti]
	)) as AuthRecordRow[];
	return rows[0] ?? null;
};

const loginAction = async (
	ctx: { query: QueryDb },
	input: LoginInput,
	req: Request,
	res: Response
): Promise<{
	user: unknown;
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: string;
}> => {
	const body = ShapeLogin.parse(input);
	const user = await fetchUserForLogin(ctx, body);
	if (!user || !user.is_active)
		throw Boom.unauthorized("Invalid credentials");
	const passwordOk = await bcrypt.compare(
		body.password,
		user.hash_contrasena
	);
	if (!passwordOk) throw Boom.unauthorized("Invalid credentials");
	await ctx.query("UPDATE usuarios SET last_login_at=NOW() WHERE id=?", [
		user.id,
	]);
	const refresh = generateRefreshToken();
	await createAuthRecord(ctx, {
		userId: user.id,
		jti: refresh.jti,
		hash: refresh.hash,
		ttlSec: authConfig.refreshTtlSec,
		ua: req.headers["user-agent"],
		ip: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
	});
	const access = await issueAccessToken({
		userId: user.id,
		companyId: user.empresas_id,
		superadmin: !!user.es_superadmin,
		jti: refresh.jti,
	});
	res.setHeader("Authorization", `Bearer ${access.token}`);
	setRefreshCookie(res, refresh.raw, authConfig.refreshTtlSec);
	return {
		user: {
			id: user.id,
			empresaId: user.empresas_id,
			empresa: {
				codigo: user.empresa_codigo,
				nombre: user.empresa_nombre,
			},
			usuario: user.usuario,
			correo: user.correo,
			nombreCompleto: user.nombre_completo,
			esSuperadmin: !!user.es_superadmin,
		},
		accessToken: access.token,
		refreshToken: refresh.raw,
		accessTokenExpiresAt: new Date(access.exp * 1000).toISOString(),
	};
};

const refreshAction = async (
	ctx: { query: QueryDb },
	input: RefreshInput,
	req: Request,
	res: Response
): Promise<{
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: string;
}> => {
	const parsed = ShapeRefresh.parse(input);
	const token = parsed.refreshToken ?? getCookie(req, authConfig.cookieName);
	if (!token) throw Boom.unauthorized("Missing refresh token");
	const parts = token.split(".");
	if (parts.length !== 2) throw Boom.unauthorized("Invalid refresh token");
	const jti = parts[0];
	const record = await findAuthRecordByJti(ctx, { jti });
	if (!record || !record.is_active)
		throw Boom.unauthorized("Invalid refresh token");
	if (new Date(record.expires_at).getTime() <= Date.now()) {
		await revokeAuthRecord(ctx, { jti });
		throw Boom.unauthorized("Expired refresh token");
	}
	const valid = constantTimeEqual(token, record.hash_refresco);
	if (!valid) {
		await revokeAuthRecord(ctx, { jti });
		throw Boom.unauthorized("Invalid refresh token");
	}
	await revokeAuthRecord(ctx, { jti });
	const newRefresh = generateRefreshToken();
	await createAuthRecord(ctx, {
		userId: record.usuarios_id,
		jti: newRefresh.jti,
		hash: newRefresh.hash,
		ttlSec: authConfig.refreshTtlSec,
		ua: req.headers["user-agent"],
		ip: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
	});
	const userRows = (await ctx.query(
		"SELECT id,empresas_id,es_superadmin FROM usuarios WHERE id=? LIMIT 1",
		[record.usuarios_id]
	)) as {
		id: number;
		empresas_id: number;
		es_superadmin: number | boolean;
	}[];
	const user = userRows[0];
	if (!user) throw Boom.unauthorized("User not found");
	const access = await issueAccessToken({
		userId: user.id,
		companyId: user.empresas_id,
		superadmin: !!user.es_superadmin,
		jti: newRefresh.jti,
	});
	res.setHeader("Authorization", `Bearer ${access.token}`);
	setRefreshCookie(res, newRefresh.raw, authConfig.refreshTtlSec);
	return {
		accessToken: access.token,
		refreshToken: newRefresh.raw,
		accessTokenExpiresAt: new Date(access.exp * 1000).toISOString(),
	};
};

const logoutAction = async (
	ctx: { query: QueryDb },
	input: LogoutInput,
	req: Request,
	res: Response
): Promise<null> => {
	const parsed = ShapeLogout.parse(input);
	const token = parsed.refreshToken ?? getCookie(req, authConfig.cookieName);
	if (token) {
		const parts = token.split(".");
		if (parts.length === 2) {
			const jti = parts[0];
			await revokeAuthRecord(ctx, { jti });
		}
	}
	clearRefreshCookie(res);
	return null;
};

const meAction = async (
	{ query }: { query: QueryDb },
	input: MeInput
): Promise<unknown> => {
	const uid = input.userId;
	const rows = (await query(
		`SELECT u.id,u.empresas_id,u.usuario,u.correo,u.nombre_completo,u.es_superadmin,u.is_active,u.last_login_at,u.updated_at,
            e.codigo AS empresa_codigo,e.nombre AS empresa_nombre
     FROM usuarios u JOIN empresas e ON e.id=u.empresas_id WHERE u.id=? LIMIT 1`,
		[uid]
	)) as any[];
	const r = rows[0];
	if (!r) throw createNotFoundError("User not found");
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
		nombreCompleto: r.nombre_completo,
		esSuperadmin: !!r.es_superadmin,
		isActive: !!r.is_active,
		lastLoginAt: r.last_login_at,
		updatedAt: r.updated_at,
	};
};

const meWithMenuAction = async (
	{ query }: { query: QueryDb },
	input: MeWithMenuInput
): Promise<{
	user: any;
	modulos: any[];
}> => {
	const uid = input.userId;
	const uRows = (await query(
		`SELECT u.id,u.empresas_id,u.usuario,u.correo,u.nombre_completo,u.es_superadmin,u.is_active,u.last_login_at,u.updated_at,
            e.codigo AS empresa_codigo,e.nombre AS empresa_nombre
     FROM usuarios u JOIN empresas e ON e.id=u.empresas_id WHERE u.id=? LIMIT 1`,
		[uid]
	)) as any[];
	const u = uRows[0];
	if (!u) throw createNotFoundError("User not found");

	const perfilRows = (await query(
		`SELECT p.id, p.menu_config_json
         FROM usuarios_perfiles up
         JOIN perfiles p ON p.id = up.perfiles_id AND p.is_active = 1
         WHERE up.usuarios_id = ? AND up.es_principal = 1
         LIMIT 1`,
		[uid]
	)) as any[];

	const perfilRow = perfilRows[0];

	let modulos: any[] = [];

	if (perfilRow && perfilRow.menu_config_json != null) {
		const rawConfig = perfilRow.menu_config_json;

		if (typeof rawConfig === "string") {
			const trimmed = rawConfig.trim();
			if (trimmed !== "") {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						modulos = parsed;
					} else if (parsed && typeof parsed === "object") {
						modulos = [parsed];
					}
				} catch {
					modulos = [];
				}
			}
		} else if (Array.isArray(rawConfig)) {
			modulos = rawConfig;
		} else if (rawConfig && typeof rawConfig === "object") {
			modulos = [rawConfig];
		}
	}

	return {
		user: {
			id: u.id,
			empresaId: u.empresas_id,
			empresa: {
				id: u.empresas_id,
				codigo: u.empresa_codigo,
				nombre: u.empresa_nombre,
			},
			usuario: u.usuario,
			correo: u.correo,
			nombreCompleto: u.nombre_completo,
			esSuperadmin: !!u.es_superadmin,
			isActive: !!u.is_active,
			lastLoginAt: u.last_login_at,
			updatedAt: u.updated_at,
		},
		modulos,
	};
};

export const createAuthRouter = (app: Application): void => {
	app.post(
		"/auth/login",
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const out = await loginAction(
					{ query: req.queryDb },
					req.body as LoginInput,
					req,
					res
				);
				res.status(200).json(out);
			} catch (e) {
				next(e);
			}
		}
	);

	app.post(
		"/auth/refresh",
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const out = await refreshAction(
					{ query: req.queryDb },
					(req.body ?? {}) as RefreshInput,
					req,
					res
				);
				res.status(200).json(out);
			} catch (e) {
				next(e);
			}
		}
	);

	app.post(
		"/auth/logout",
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const out = await logoutAction(
					{ query: req.queryDb },
					(req.body ?? {}) as LogoutInput,
					req,
					res
				);
				res.status(204).json(out);
			} catch (e) {
				next(e);
			}
		}
	);

	app.get(
		"/auth/me",
		requireAuth,
		wrapActionAsRouteHandler(meAction, (req) => {
			if (!req.auth?.userId) throw Boom.unauthorized("Unauthorized");
			return { userId: req.auth.userId };
		})
	);

	app.get(
		"/auth/meWithMenu",
		requireAuth,
		wrapActionAsRouteHandler(meWithMenuAction, (req) => {
			if (!req.auth?.userId) throw Boom.unauthorized("Unauthorized");
			return { userId: req.auth.userId };
		})
	);
};
