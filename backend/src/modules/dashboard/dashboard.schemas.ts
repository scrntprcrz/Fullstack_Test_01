import { z } from "zod";

export const ShapeDashboardStats = z.object({
	usuarioId: z.coerce.number().int().positive(),
	empresaId: z.coerce.number().int().positive().optional(),
});

export type DashboardStatsInput = z.infer<typeof ShapeDashboardStats>;
