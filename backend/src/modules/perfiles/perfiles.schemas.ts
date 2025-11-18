import { z } from "zod";

export const ShapeCreate = z.object({
	empresaId: z.coerce.number().int().positive(),
	codigo: z.string().min(1),
	nombre: z.string().min(1),
	descripcion: z.string().optional(),
	esSistema: z.boolean().default(false),
	isActive: z.coerce.boolean().optional(),
	menuConfigJson: z.any().optional(),
});

export const ShapeUpdate = ShapeCreate.extend({ id: z.string().min(1) });

export const ShapeList = z.object({
	empresaId: z.coerce.number().int().positive().optional(),
	codigo: z.string().optional(),
	nombre: z.string().optional(),
	isActive: z.coerce.boolean().optional(),
	q: z.string().optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});

export type CreateInput = z.infer<typeof ShapeCreate>;
export type UpdateInput = z.infer<typeof ShapeUpdate>;
export type ListInput = z.infer<typeof ShapeList>;
