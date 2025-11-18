export type UsuarioListItem = {
	id: number;
	empresaId: number;
	empresa: {
		id: number;
		codigo: string;
		nombre: string;
	};
	usuario: string;
	correo: string;
	hashContrasena: string;
	nombreCompleto: string;
	esSuperadmin: boolean;
	isActive: boolean;
	lastLoginAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type UsuarioPerfilItem = {
	perfilesId: number;
	codigo: string;
	nombre: string;
	esPrincipal: boolean;
};

export type UsuarioDetalle = UsuarioListItem & {
	perfiles: UsuarioPerfilItem[];
};

export type UsuariosListResponse = {
	data: UsuarioListItem[];
	total: number;
	limit: number;
	offset: number;
};

export type PerfilItem = {
	id: number;
	empresaId: number;
	codigo: string;
	nombre: string;
	descripcion: string;
	esSistema: boolean;
	isActive: boolean;
	updatedAt: string;
};

export type PerfilesListResponse = {
	data: PerfilItem[];
	total: number;
	limit: number;
	offset: number;
};

export const buildUsuariosListParams = (
	empresaId: number,
	limit: number,
	offset: number
) => ({
	empresaId,
	limit,
	offset,
});

export const buildPerfilesListParams = (empresaId: number) => ({
	empresaId,
	isActive: true,
	limit: 200,
	offset: 0,
});

export type UsuarioFormBase = {
	usuario: string;
	nombreCompleto: string;
	correo: string;
	perfilId: string;
	esSuperadmin: boolean;
	isActive: boolean;
	password?: string;
};

export const buildUsuarioCreatePayload = (
	values: UsuarioFormBase,
	empresaId: number,
	hashContrasena: string
) => ({
	empresaId,
	usuario: values.usuario.trim(),
	correo: values.correo.trim(),
	nombreCompleto: values.nombreCompleto.trim(),
	esSuperadmin: values.esSuperadmin,
	isActive: values.isActive,
	hashContrasena,
});

export const buildUsuarioUpdatePayload = (
	values: UsuarioFormBase,
	empresaId: number,
	id: number,
	hashContrasena?: string
) => ({
	id: String(id),
	empresaId,
	usuario: values.usuario.trim(),
	correo: values.correo.trim(),
	nombreCompleto: values.nombreCompleto.trim(),
	esSuperadmin: values.esSuperadmin,
	isActive: values.isActive,
	...(hashContrasena ? { hashContrasena } : {}),
});

export const buildUsuarioPerfilesPayload = (
	usuarioId: number,
	perfilId: string
) => ({
	usuarioId,
	perfiles: [
		{
			perfilId: Number(perfilId),
			esPrincipal: true,
		},
	],
});

export const formatDateTime = (value?: string | null) => {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleString();
};
