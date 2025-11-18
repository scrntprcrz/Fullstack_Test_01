import { atom } from "jotai";
import { setAccessToken } from "../api/http";

export interface AuthUser {
	id: number;
	empresaId: number;
	usuario: string;
	correo: string;
	nombreCompleto: string;
	esSuperadmin: boolean;
}

export interface AuthMenuPermissions {
	puedeVer: boolean;
	puedeCrear: boolean;
	puedeActualizar: boolean;
	puedeEliminar: boolean;
}

export interface AuthMenuItem {
	id: number;
	opcionMenuIdPadre: number | null;
	codigo: string;
	etiqueta: string;
	ruta: string;
	icono: string;
	orden: number;
	permisos: AuthMenuPermissions;
	children: AuthMenuItem[];
}

export interface AuthModulo {
	id: number;
	codigo: string;
	nombre: string;
	icono: string;
	ruta: string;
	orden: number;
	menu: AuthMenuItem[];
}

export interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser | null;
	accessToken: string | null;
	menu: AuthModulo[] | null;
}

const emptyState: AuthState = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
	menu: null,
};

const readInitialAuth = (): AuthState => {
	if (typeof window === "undefined") {
		return emptyState;
	}

	const raw = window.localStorage.getItem("authState");
	if (!raw) {
		return emptyState;
	}

	try {
		const parsed = JSON.parse(raw) as Partial<AuthState>;
		const state: AuthState = {
			isAuthenticated:
				!!parsed.isAuthenticated &&
				!!parsed.accessToken &&
				!!parsed.user,
			user: parsed.user ?? null,
			accessToken: parsed.accessToken ?? null,
			menu: Array.isArray(parsed.menu) ? parsed.menu : null,
		};
		setAccessToken(state.accessToken);
		return state;
	} catch {
		return emptyState;
	}
};

export const authAtom = atom<AuthState>(readInitialAuth());

export const setAuthAtom = atom(null, (_get, set, next: AuthState) => {
	set(authAtom, next);
	setAccessToken(next.accessToken);
	if (typeof window !== "undefined") {
		window.localStorage.setItem("authState", JSON.stringify(next));
	}
});

export const clearAuthAtom = atom(null, (_get, set) => {
	set(authAtom, emptyState);
	setAccessToken(null);
	if (typeof window !== "undefined") {
		window.localStorage.removeItem("authState");
	}
});
