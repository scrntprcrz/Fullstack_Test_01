import Boom from "@hapi/boom";
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./tokens";

const parseBearer = (header: unknown): string | null => {
	if (!header || typeof header !== "string") return null;
	const [type, value] = header.split(" ");
	if (!type || !value || type.toLowerCase() !== "bearer") return null;
	return value;
};

export const requireAuth = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const raw = parseBearer(req.headers.authorization);
		if (!raw) {
			next(Boom.unauthorized("Missing Bearer token"));
			return;
		}
		const payload = await verifyAccessToken(raw);
		req.auth = {
			userId: Number(payload.uid),
			companyId: Number(payload.cid),
			superadmin: !!payload.adm,
		};
		next();
	} catch {
		next(Boom.unauthorized("Invalid or expired token"));
	}
};
