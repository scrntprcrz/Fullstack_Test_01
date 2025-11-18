import type { Pool } from "mysql";
import type { QueryDb, WithTransaction, AppDbLocals } from "../helpers/db";

interface AuthInfo {
	userId: number;

	companyId: number;
	superadmin: boolean;
}

declare global {
	namespace Express {
		interface Request {
			db: Pool;
			queryDb: QueryDb;
			withTransaction: WithTransaction;
			auth?: AuthInfo;
		}

		interface Application {
			locals: AppDbLocals;
		}
	}
}

export {};
