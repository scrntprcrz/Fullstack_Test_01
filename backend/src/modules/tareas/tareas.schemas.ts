import { z } from "zod";

export const estadosPermitidos = [
	"pendiente",
	"en_progreso",
	"completada",
] as const;

export const prioridadesPermitidas = ["baja", "media", "alta"] as const;

export const ShapeTareaCreate = z.object({
	proyectoId: z.coerce.number().int().positive(),
	titulo: z.string().min(1),
	descripcion: z.string().optional(),
	estado: z.enum(estadosPermitidos).default("pendiente"),
	prioridad: z.enum(prioridadesPermitidas).default("media"),
	asignadoId: z.coerce.number().int().positive().optional(),
	ordenKanban: z.coerce.number().int().nonnegative().default(0),
	fechaInicio: z.string().min(1).optional(),
	fechaVencimiento: z.string().min(1).optional(),
});

export const ShapeTareaUpdate = z.object({
	id: z.coerce.number().int().positive(),
	proyectoId: z.coerce.number().int().positive(),
	titulo: z.string().min(1),
	descripcion: z.string().optional(),
	estado: z.enum(estadosPermitidos),
	prioridad: z.enum(prioridadesPermitidas),
	asignadoId: z.coerce.number().int().positive().optional(),
	ordenKanban: z.coerce.number().int().nonnegative(),
	fechaInicio: z.string().min(1).optional(),
	fechaVencimiento: z.string().min(1).optional(),
});

export const ShapeTareaList = z.object({
	empresaId: z.coerce.number().int().positive().optional(),
	proyectoId: z.coerce.number().int().positive().optional(),
	estado: z.enum(estadosPermitidos).optional(),
	prioridad: z.enum(prioridadesPermitidas).optional(),
	asignadoId: z.coerce.number().int().positive().optional(),
	q: z.string().optional(),
	orderBy: z
		.enum([
			"createdAt",
			"fechaVencimiento",
			"prioridad",
			"estado",
			"ordenKanban",
		])
		.optional(),
	orderDirection: z.enum(["asc", "desc"]).optional(),
	limit: z.coerce.number().int().positive().max(200).default(50),
	offset: z.coerce.number().int().nonnegative().default(0),
});

export const ShapeTareaEstadoUpdate = z.object({
	id: z.coerce.number().int().positive(),
	estado: z.enum(estadosPermitidos),
});

export const ShapeTareaReordenKanban = z.object({
	proyectoId: z.coerce.number().int().positive(),
	items: z
		.array(
			z.object({
				id: z.coerce.number().int().positive(),
				estado: z.enum(estadosPermitidos),
				ordenKanban: z.coerce.number().int().nonnegative(),
			})
		)
		.min(1),
});

export type TareaCreateInput = z.infer<typeof ShapeTareaCreate>;
export type TareaUpdateInput = z.infer<typeof ShapeTareaUpdate>;
export type TareaListInput = z.infer<typeof ShapeTareaList>;
export type TareaEstadoUpdateInput = z.infer<typeof ShapeTareaEstadoUpdate>;
export type TareaReordenKanbanInput = z.infer<typeof ShapeTareaReordenKanban>;
