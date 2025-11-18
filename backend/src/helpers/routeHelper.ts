import Boom, { Boom as BoomError } from "@hapi/boom";
import { CorsOptions } from "cors";
import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { extractDbErrorDetails, QueryDb } from "./db";

export const createNotFoundError = (message = "Not found"): Error => {
	const e = new Error(message);
	e.name = "NotFoundError";
	return e;
};

const attachDebug = (boomErr: BoomError, err?: unknown): BoomError => {
	const isProd = (process.env.NODE_ENV ?? "development") === "production";
	if (!isProd) {
		const src =
			(err as Error) ??
			(boomErr.data as Error) ??
			(boomErr as unknown as Error);
		const stack = src?.stack
			? String(src.stack).split("\n").slice(0, 8)
			: null;
		(boomErr.output.payload as any).debug = {
			name: src?.name ?? null,
			message: src?.message ?? null,
			stack,
		};
		(boomErr.output.payload as any).message =
			src?.message || boomErr.output.payload.message;
	}
	return boomErr;
};

export const normalizeToBoomError = (err: unknown): BoomError => {
	const anyErr = err as {
		name?: string;
		message?: string;
		issues?: unknown;
		sqlMessage?: string;
	} | null;

	if (Boom.isBoom(err)) return attachDebug(err, (err as BoomError).data);

	if (anyErr?.name === "ZodError") {
		return attachDebug(
			Boom.badRequest("Validation error", { issues: anyErr.issues }),
			err
		);
	}

	if (anyErr?.name === "NotFoundError") {
		return attachDebug(Boom.notFound(anyErr.message || "Not found"), err);
	}

	const db = extractDbErrorDetails(err);
	const msg = anyErr?.sqlMessage || anyErr?.message || "DB error";
	const boom = Object.keys(db).length
		? Boom.badImplementation(msg, { db })
		: Boom.badImplementation(msg);

	return attachDebug(boom, err);
};

export interface WrapOptions<TInput, TOutput> {
	okStatus?: number;
	mapOk?: (value: TOutput) => unknown;
	buildCtx?: (req: Request) => { query: QueryDb };
}

export const wrapActionAsRouteHandler =
	<TInput = unknown, TOutput = unknown>(
		action: (
			ctx: {
				query: QueryDb;
			},
			input: TInput
		) => Promise<TOutput> | TOutput,
		pickInput?: (req: Request) => TInput,
		{
			okStatus = 200,
			mapOk = ((v) => v) as (v: TOutput) => unknown,
			buildCtx = ((req) => ({ query: req.queryDb })) as (
				req: Request
			) => { query: QueryDb },
		}: WrapOptions<TInput, TOutput> = {}
	) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const ctx = buildCtx(req);
			const input = pickInput ? pickInput(req) : (undefined as TInput);
			const out = await action(ctx, input);
			if (okStatus === 204) {
				res.status(204).end();
				return;
			}
			res.status(okStatus).json(mapOk(out));
		} catch (e) {
			next(normalizeToBoomError(e));
		}
	};

export function notFoundHandler(
	_req: Request,
	_res: Response,
	next: NextFunction
) {
	next(Boom.notFound("Not Found"));
}
export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	const boomErr = normalizeToBoomError(err);
	const { output, data } = boomErr;
	const isProd = (process.env.NODE_ENV ?? "development") === "production";
	const message = isProd
		? output.payload.message
		: boomErr.message || output.payload.message;

	res.status(output.statusCode)
		.set(output.headers)
		.json({ ...output.payload, message, data: data ?? null });
}

export const createApiRateLimiter = () => {
	return rateLimit({
		windowMs: 900000,
		limit: 100,
		standardHeaders: true,
		legacyHeaders: false,
	});
};

export const buildCorsOptions = (): CorsOptions => {
	const origin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
	return {
		origin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		exposedHeaders: ["Authorization"],
	};
};

const normalizeToPureIpInternal = (
	ip: string | null | undefined
): string | null => {
	if (!ip) return null;
	const trimmed = ip.trim();
	if (trimmed.startsWith("::ffff:")) {
		return trimmed.substring("::ffff:".length);
	}
	return trimmed;
};

export const normalizeToPureIp = (
	ip: string | null | undefined
): string | null => {
	return normalizeToPureIpInternal(ip);
};

const isLocalLikeIp = (ip: string | null | undefined): boolean => {
	if (!ip) return false;
	console.log(ip);
	const trimmed = ip.trim().toLowerCase();

	if (
		trimmed === "127.0.0.1" ||
		trimmed === "::1" ||
		trimmed === "localhost"
	) {
		return true;
	}

	if (trimmed.startsWith("::ffff:")) {
		return true;
	}

	return false;
};

const parseXForwardedFor = (
	header: string | string[] | undefined
): string[] => {
	if (!header) return [];

	if (typeof header === "string") {
		return header
			.split(",")
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	}

	const parts: string[] = [];

	for (const item of header) {
		parts.push(
			...item
				.split(",")
				.map((part) => part.trim())
				.filter((part) => part.length > 0)
		);
	}

	return parts;
};

export const isSelfRequest = (
	rawIp: string | null | undefined,
	xForwardedForHeader: string | string[] | undefined
): boolean => {
	if (isLocalLikeIp(rawIp)) {
		return true;
	}

	const forwardedIps = parseXForwardedFor(xForwardedForHeader);

	for (const forwarded of forwardedIps) {
		if (isLocalLikeIp(forwarded)) {
			return true;
		}
	}

	return false;
};
