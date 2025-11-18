import type { Request } from "express";
import morgan from "morgan";

const serializeForLog = (value: unknown): string => {
	if (value == null) return "-";
	if (typeof value !== "object") return String(value);
	const plain = value as Record<string, unknown>;
	if (Object.keys(plain).length === 0) return "-";
	try {
		return JSON.stringify(plain);
	} catch {
		return "[unserializable]";
	}
};

const getRequestBodyForLog = (req: Request): string => {
	const reqWithBody = req as Request & { body?: unknown };
	return serializeForLog(reqWithBody.body);
};

const getRequestQueryForLog = (req: Request): string => {
	return serializeForLog(req.query);
};

const preferIpv4ForLog = (ip: string | null | undefined): string => {
	if (!ip) return "-";

	let trimmed = ip.trim();

	const lower = trimmed.toLowerCase();
	if (
		lower === "127.0.0.1" ||
		lower === "::1" ||
		lower === "localhost" ||
		lower === "::ffff:127.0.0.1"
	) {
		return "localhost";
	}

	const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;

	if (trimmed.startsWith("::ffff:")) {
		const v4Part = trimmed.substring("::ffff:".length);
		if (ipv4Regex.test(v4Part)) {
			return v4Part;
		}
		trimmed = v4Part;
	}

	if (ipv4Regex.test(trimmed)) {
		return trimmed;
	}

	return trimmed;
};

const getClientIpForLog = (req: Request): string => {
	const forwardedForHeader = req.headers["x-forwarded-for"];
	const forwardedFor =
		typeof forwardedForHeader === "string"
			? forwardedForHeader.split(",")[0].trim()
			: Array.isArray(forwardedForHeader)
			? forwardedForHeader[0]
			: undefined;

	const candidateIp =
		forwardedFor ?? req.ip ?? req.socket?.remoteAddress ?? null;

	return preferIpv4ForLog(candidateIp);
};

export const createHttpLogger = () => {
	morgan.token("body", (req: Request) => getRequestBodyForLog(req));
	morgan.token("query", (req: Request) => getRequestQueryForLog(req));
	morgan.token("client-ip", (req: Request) => getClientIpForLog(req));
	return morgan(
		":client-ip :method :url :status :res[content-length] - :response-time ms | query=:query | body=:body"
	);
};
