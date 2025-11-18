import { z } from "zod";

export const ShapeCreate = z.object({
	empresaId: z.coerce.number().int().positive(),
	usuario: z.string().min(1),
	correo: z.string().email(),
	hashContrasena: z.string().min(10),
	nombreCompleto: z.string().min(1),
	esSuperadmin: z.boolean().default(false),
	isActive: z.boolean().default(true),
});

export const ShapeUpdate = z.object({
	id: z.string().min(1),
	empresaId: z.coerce.number().int().positive(),
	usuario: z.string().min(1),
	correo: z.string().email(),
	nombreCompleto: z.string().min(1),
	esSuperadmin: z.boolean().default(false),
	isActive: z.boolean().default(true),
	hashContrasena: z.string().min(10).optional(),
});

export const ShapeList = z.object({
	empresaId: z.coerce.number().int().positive().optional(),
	usuario: z.string().optional(),
	correo: z.string().optional(),
	isActive: z.boolean().optional(),
	q: z.string().optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});

export const ShapeProfilesAssign = z.object({
	usuarioId: z.coerce.number().int().positive(),
	perfiles: z
		.array(
			z.object({
				perfilId: z.coerce.number().int().positive(),
				esPrincipal: z.boolean().default(false),
			})
		)
		.min(1),
});

export type CreateInput = z.infer<typeof ShapeCreate>;
export type UpdateInput = z.infer<typeof ShapeUpdate>;
export type ListInput = z.infer<typeof ShapeList>;
export type ProfilesAssignInput = z.infer<typeof ShapeProfilesAssign>;
