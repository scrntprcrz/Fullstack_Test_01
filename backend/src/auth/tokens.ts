import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import {
	randomBytes,
	randomUUID,
	createHash,
	timingSafeEqual,
} from "node:crypto";
import { authConfig } from "./config";

const b64u = (buffer: Buffer): string => buffer.toString("base64url");

const nowSec = (): number => Math.floor(Date.now() / 1000);

const sha256 = (value: string): Buffer =>
	createHash("sha256").update(value).digest();

const hashHex = (value: string): string =>
	createHash("sha256").update(value).digest("hex");

export interface AccessTokenPayload extends JWTPayload {
	sub: string;
	uid: number;
	cid: number;
	adm: boolean;
	typ: "access";
	jti: string;
}

export interface IssueAccessTokenInput {
	userId: number;
	companyId: number;
	superadmin: boolean;
	jti: string;
}

export interface IssuedAccessToken {
	token: string;
	exp: number;
}

export const issueAccessToken = async ({
	userId,
	companyId,
	superadmin,
	jti,
}: IssueAccessTokenInput): Promise<IssuedAccessToken> => {
	const iat = nowSec();
	const exp = iat + authConfig.accessTtlSec;
	const payload: AccessTokenPayload = {
		sub: String(userId),
		uid: userId,
		cid: companyId,
		adm: !!superadmin,
		typ: "access",
		jti,
		iat,
		exp,
		iss: authConfig.issuer,
		aud: authConfig.audience,
	};
	const jwt = await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setIssuer(authConfig.issuer)
		.setAudience(authConfig.audience)
		.setIssuedAt(iat)
		.setExpirationTime(exp)
		.sign(authConfig.secret);
	return { token: jwt, exp };
};

export interface RefreshToken {
	raw: string;
	jti: string;
	hash: string;
}

export const generateRefreshToken = (): RefreshToken => {
	const jti = randomUUID();
	const raw = `${jti}.${b64u(randomBytes(32))}`;
	return { raw, jti, hash: hashHex(raw) };
};

export const verifyAccessToken = async (
	token: string
): Promise<AccessTokenPayload> => {
	const { payload } = await jwtVerify(token, authConfig.secret, {
		issuer: authConfig.issuer,
		audience: authConfig.audience,
	});
	return payload as AccessTokenPayload;
};

export const constantTimeEqual = (a: string, b: string): boolean => {
	const A = sha256(a);
	const B = sha256(b);
	try {
		return timingSafeEqual(A, B);
	} catch {
		return false;
	}
};
