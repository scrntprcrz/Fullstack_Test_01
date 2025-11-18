import { z } from "zod";

export const ShapeCreate = z.object({
	codigo: z.string().min(1),
	nombre: z.string().min(1),
	taxId: z.string().optional(),
	correo: z.string().email().optional(),
	telefono: z.string().optional(),
	direccion: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const ShapeUpdate = ShapeCreate.extend({ id: z.string().min(1) });

export const ShapeList = z.object({
	codigo: z.string().optional(),
	nombre: z.string().optional(),
	isActive: z.boolean().optional(),
	q: z.string().optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});

export type CreateInput = z.infer<typeof ShapeCreate>;
export type UpdateInput = z.infer<typeof ShapeUpdate>;
export type ListInput = z.infer<typeof ShapeList>;
