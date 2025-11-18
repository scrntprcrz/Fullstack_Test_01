import mysql, { Pool, PoolConnection } from "mysql";
import type { Application, Request, Response, NextFunction } from "express";

export type QueryDb = (sql: string, params?: unknown[]) => Promise<unknown>;

export type WithTransaction = <T>(
	fn: (ctx: { queryDb: QueryDb }) => Promise<T>
) => Promise<T>;

export const createDb = (app: Application): void => {
	const pool: Pool = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD ?? "",
		database: process.env.DB_NAME,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
		socketPath: process.env.DB_SOCKET,
		connectionLimit: 10,
		timezone: "Z",
	});

	pool.on("connection", (conn: PoolConnection) => {
		conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_spanish2_ci");
	});

	const queryPool: QueryDb = (sql, params = []) =>
		new Promise((resolve, reject) => {
			pool.query(sql, params, (err, results) =>
				err ? reject(err) : resolve(results)
			);
		});

	const getConnection = (): Promise<PoolConnection> =>
		new Promise((resolve, reject) =>
			pool.getConnection((err, conn) =>
				err ? reject(err) : resolve(conn)
			)
		);

	const run = (
		conn: PoolConnection,
		sql: string,
		params: unknown[] = []
	): Promise<unknown> =>
		new Promise((resolve, reject) =>
			conn.query(sql, params, (err, results) =>
				err ? reject(err) : resolve(results)
			)
		);

	const begin = (conn: PoolConnection): Promise<void> =>
		new Promise((resolve, reject) =>
			conn.beginTransaction((err) => (err ? reject(err) : resolve()))
		);

	const commit = (conn: PoolConnection): Promise<void> =>
		new Promise((resolve, reject) =>
			conn.commit((err) => (err ? reject(err) : resolve()))
		);

	const rollback = (conn: PoolConnection): Promise<void> =>
		new Promise((resolve) => conn.rollback(() => resolve()));

	const withTransaction: WithTransaction = async (fn) => {
		const conn = await getConnection();
		try {
			await begin(conn);
			const out = await fn({
				queryDb: (sql, params) => run(conn, sql, params ?? []),
			});
			await commit(conn);
			return out;
		} catch (e) {
			await rollback(conn);
			throw e;
		} finally {
			conn.release();
		}
	};

	(app.locals as any).db = pool;
	(app.locals as any).queryDb = queryPool;
	(app.locals as any).withTransaction = withTransaction;
};

export interface DbErrorDetails {
	name?: string;
	code?: string | number;
	errno?: number;
	sqlState?: string;
	sqlMessage?: string;
	sql?: string;
}

export const extractDbErrorDetails = (e: unknown): DbErrorDetails => {
	const err = e as {
		name?: string;
		code?: string | number;
		errno?: number;
		sqlState?: string;
		sqlstate?: string;
		sqlMessage?: string;
		sql?: string;
	} | null;

	const raw: DbErrorDetails = {
		name: err?.name,
		code: err?.code,
		errno: err?.errno,
		sqlState: err?.sqlState || err?.sqlstate,
		sqlMessage: err?.sqlMessage,
		sql: err?.sql,
	};

	return Object.fromEntries(
		Object.entries(raw).filter(([, v]) => v != null)
	) as DbErrorDetails;
};

export const useDb =
	(app: Application) =>
	(req: Request, _res: Response, next: NextFunction): void => {
		(req as any).db = (app.locals as any).db;
		(req as any).queryDb = (app.locals as any).queryDb;
		(req as any).withTransaction = (app.locals as any).withTransaction;
		next();
	};
