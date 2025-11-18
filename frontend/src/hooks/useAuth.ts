import { useAtom, useSetAtom } from "jotai";
import {
	authAtom,
	setAuthAtom,
	clearAuthAtom,
	type AuthUser,
	type AuthModulo,
	type AuthState,
} from "../state/authAtoms";
import { http, setAccessToken } from "../api/http";

interface LoginResponse {
	user: AuthUser;
	accessToken: string;
	refreshToken?: string;
	accessTokenExpiresAt: string;
}

interface MeWithMenuResponse {
	user: AuthUser;
	modulos: AuthModulo[];
}

export const useAuth = () => {
	const [auth] = useAtom(authAtom);
	const setAuth = useSetAtom(setAuthAtom);
	const clearAuth = useSetAtom(clearAuthAtom);

	const login = async (email: string, password: string) => {
		try {
			const res = await http.post<LoginResponse>("/auth/login", {
				email,
				password,
			});
			const data = res.data;
			setAccessToken(data.accessToken);

			const meRes = await http.get<MeWithMenuResponse>(
				"/auth/meWithMenu"
			);
			const me = meRes.data;

			const next: AuthState = {
				isAuthenticated: true,
				user: me.user,
				accessToken: data.accessToken,
				menu: me.modulos,
			};

			setAuth(next);
		} catch (error) {
			setAccessToken(null);
			clearAuth();
			throw error;
		}
	};

	const logout = async () => {
		try {
			await http.post("/auth/logout", {});
		} catch {
			console.log();
		} finally {
			clearAuth();
		}
	};

	const refreshMe = async () => {
		if (!auth.accessToken) return;
		try {
			const res = await http.get<MeWithMenuResponse>("/auth/meWithMenu");
			const me = res.data;
			const next: AuthState = {
				isAuthenticated: true,
				user: me.user,
				accessToken: auth.accessToken,
				menu: me.modulos,
			};
			setAuth(next);
		} catch {
			clearAuth();
		}
	};

	return {
		auth,
		login,
		logout,
		refreshMe,
	};
};
