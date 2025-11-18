export const authConfig = {
	issuer: process.env.AUTH_ISSUER ?? "app",
	audience: process.env.AUTH_AUDIENCE ?? "app-clients",
	accessTtlSec: Number(process.env.AUTH_ACCESS_TTL_SEC ?? 900),
	refreshTtlSec: Number(process.env.AUTH_REFRESH_TTL_SEC ?? 2592000),
	cookieName: process.env.AUTH_REFRESH_COOKIE ?? "refresh_token",
	cookiePath: process.env.AUTH_REFRESH_COOKIE_PATH ?? "/",
	useSecureCookies: (process.env.NODE_ENV ?? "development") !== "development",
	secret: new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me"),
} as const;
