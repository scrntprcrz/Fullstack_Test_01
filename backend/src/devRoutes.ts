import bcrypt from "bcryptjs";
import express, {
	type Application,
	type Request,
	type RequestHandler,
} from "express";

import { z } from "zod";
import { QueryDb } from "./helpers/db";
import {
	createNotFoundError,
	wrapActionAsRouteHandler,
} from "./helpers/routeHelper";
import {
	createEmpresa,
	listEmpresas,
} from "./modules/empresas/empresas.service";
import {
	createPerfil,
	listPerfiles,
} from "./modules/perfiles/perfiles.service";
import {
	createUsuario,
	updateUsuarioPerfiles,
} from "./modules/usuarios/usuarios.service";

const DEFAULT_EMPRESA_CODIGO =
	process.env.DEFAULT_EMPRESA_CODIGO ?? "DEFAULT_EMPRESA";

const DEFAULT_ADMIN_MENU_CONFIG = [
	{
		id: 1,
		codigo: "ADMIN",
		nombre: "Administración",
		icono: "",
		ruta: "/admin",
		orden: 100,
		menu: [
			{
				id: 9,
				opcionMenuIdPadre: null,
				codigo: "ADMIN_PERFILES",
				etiqueta: "Perfiles",
				ruta: "/admin/perfiles",
				icono: "",
				orden: 8,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
			{
				id: 23,
				opcionMenuIdPadre: null,
				codigo: "ADMIN_USUARIOS",
				etiqueta: "Usuarios",
				ruta: "/admin/usuarios",
				icono: "",
				orden: 10,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
		],
	},
	{
		id: 2,
		codigo: "PROYECTOS",
		nombre: "Proyectos",
		icono: "",
		ruta: "/proyectos",
		orden: 200,
		menu: [
			{
				id: 3,
				opcionMenuIdPadre: null,
				codigo: "PROYECTOS",
				etiqueta: "Proyectos",
				ruta: "/proyectos/proyectos",
				icono: "",
				orden: 10,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
			{
				id: 30,
				opcionMenuIdPadre: null,
				codigo: "TAREAS",
				etiqueta: "Tareas",
				ruta: "/proyectos/tareas",
				icono: "",
				orden: 11,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
		],
	},
];

const ShapeCreateUserDev = z.object({
	empresaId: z.coerce.number().int().positive().optional(),
	empresaCodigo: z.string().min(1).optional(),
	usuario: z.string().min(1).optional(),
	correo: z.string().email().optional(),
	nombreCompleto: z.string().min(1).default("User"),
	contrasena: z.string().min(6),
	esSuperadmin: z.boolean().default(false),
	perfilCodigo: z.string().optional(),
});

type CreateUserDevInput = z.infer<typeof ShapeCreateUserDev>;

const ensureId = (value: unknown, label: string): number => {
	if (!value || (value as any).id == null) {
		throw new TypeError(`${label} no retornó id`);
	}

	const id = (value as any).id;

	if (typeof id === "number") {
		return id;
	}

	if (typeof id === "string" && id.trim() !== "") {
		const parsed = parseInt(id, 10);
		if (Number.isNaN(parsed)) {
			throw new TypeError(`${label} retornó id inválido`);
		}
		return parsed;
	}

	throw new TypeError(`${label} retornó id inválido`);
};
const ensureAdminProfileAndMenu = async (
	{ query }: { query: QueryDb },
	params: {
		empresaId: number;
		usuarioId: number;
		perfilCodigo?: string | null;
	}
): Promise<void> => {
	const codigoPerfilNormalizado = params.perfilCodigo?.trim();
	const codigoPerfil =
		codigoPerfilNormalizado && codigoPerfilNormalizado.length > 0
			? codigoPerfilNormalizado
			: "ADMIN";

	const perfiles = await listPerfiles(
		{ query },
		{
			empresaId: params.empresaId,
			codigo: codigoPerfil,
			isActive: true,
			limit: 1,
			offset: 0,
		}
	);

	const perfilExistente =
		perfiles.data && perfiles.data.length ? perfiles.data[0] : null;

	let perfilId: number;

	if (perfilExistente) {
		perfilId = perfilExistente.id;
	} else {
		const nombre =
			codigoPerfil === "ADMIN" ? "Administrador" : codigoPerfil;
		const descripcion =
			codigoPerfil === "ADMIN"
				? "Perfil administrador por defecto"
				: `Perfil ${codigoPerfil}`;

		const esSistema = codigoPerfil === "ADMIN";
		const menuConfigJson =
			codigoPerfil === "ADMIN" ? DEFAULT_ADMIN_MENU_CONFIG : null;

		const perfilResult = await createPerfil({ query }, {
			empresaId: params.empresaId,
			codigo: codigoPerfil,
			nombre,
			descripcion,
			esSistema,
			isActive: true,
			menuConfigJson,
		} as any);

		perfilId = ensureId(perfilResult, `createPerfil ${codigoPerfil}`);
	}

	await updateUsuarioPerfiles(
		{ query },
		{
			usuarioId: params.usuarioId,
			perfiles: [
				{
					perfilId,
					esPrincipal: true,
				},
			],
		}
	);
};

const ensureLocalhost: RequestHandler = (req, res, next) => {
	const rawIp = req.ip ?? req.socket?.remoteAddress ?? "";
	const ip = rawIp.trim();

	if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
		next();
		return;
	}

	res.status(403).json({ error: "Forbidden" });
};

const resolverEmpresaIdParaUsuario = async (
	{ query }: { query: QueryDb },
	params: { empresaId?: number | null; empresaCodigo?: string | null }
): Promise<number> => {
	if (params.empresaId) return params.empresaId;

	const codigo = params.empresaCodigo ?? DEFAULT_EMPRESA_CODIGO;

	const empresasPorCodigo = await listEmpresas({ query }, {
		codigo,
		limit: 1,
		offset: 0,
	} as any);

	const empresaPorCodigo =
		empresasPorCodigo.data && empresasPorCodigo.data.length
			? empresasPorCodigo.data[0]
			: null;

	if (empresaPorCodigo) return empresaPorCodigo.id;

	const empresas = await listEmpresas({ query }, {
		limit: 1,
		offset: 0,
	} as any);

	const empresaExistente =
		empresas.data && empresas.data.length ? empresas.data[0] : null;

	if (empresaExistente) return empresaExistente.id;

	const empresaNueva = await createEmpresa({ query }, {
		codigo,
		nombre: codigo,
		isActive: true,
	} as any);

	return ensureId(empresaNueva, "createEmpresa");
};

const createUserDevTx = async (
	{ query }: { query: QueryDb },
	input: CreateUserDevInput
) => {
	const S = ShapeCreateUserDev.parse(input);

	if (!S.correo && !S.usuario) {
		throw createNotFoundError("correo o usuario requerido");
	}

	let empresaId = S.empresaId ?? null;
	const empresaCodigo = S.empresaCodigo ?? DEFAULT_EMPRESA_CODIGO;

	if (!empresaId) {
		const empresa = await createEmpresa({ query }, {
			codigo: empresaCodigo,
			nombre: empresaCodigo,
			isActive: true,
		} as any);
		empresaId = ensureId(empresa, "createEmpresa");
	}

	const usuarioBase =
		S.usuario ??
		(S.correo ? S.correo.split("@")[0] : `user_${Date.now().toString(36)}`);

	const hashContrasena = await bcrypt.hash(S.contrasena, 10);

	const usuarioResult = await createUsuario(
		{ query },
		{
			empresaId,
			usuario: usuarioBase,
			correo: S.correo ?? `${usuarioBase}@local.dev`,
			hashContrasena,
			nombreCompleto: S.nombreCompleto,
			esSuperadmin: S.esSuperadmin,
			isActive: true,
		}
	);

	const usuarioId = ensureId(usuarioResult, "createUsuario");

	await ensureAdminProfileAndMenu(
		{ query },
		{
			empresaId,
			usuarioId,
		}
	);

	return {
		id: usuarioId,
		empresaId,
		usuario: usuarioBase,
		correo: S.correo ?? `${usuarioBase}@local.dev`,
	};
};

export const createDevRouter = (app: Application): void => {
	if ((process.env.NODE_ENV ?? "development") === "production") return;

	const r = express.Router();

	r.use("/", ensureLocalhost);

	r.get(
		"/listEmpresas",
		wrapActionAsRouteHandler(
			listEmpresas,
			(req: Request) => req.query as any
		)
	);

	r.post(
		"/createUser",
		wrapActionAsRouteHandler(
			createUserDevTx,
			(req: Request) => req.body as CreateUserDevInput,
			{ okStatus: 201 }
		)
	);

	app.use("/dev", r);
};
