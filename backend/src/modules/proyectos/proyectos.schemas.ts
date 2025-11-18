import { z } from "zod";
import { openApiRegistry } from "../../core/openapi";

export const ShapeProyectoCreate = openApiRegistry.register(
	"ProyectoCreateInput",
	z.object({
		empresaId: z.coerce.number().int().positive(),
		codigo: z.string().min(1),
		nombre: z.string().min(1),
		descripcion: z.string().optional(),
		fechaInicio: z.string().min(1).optional(),
		fechaFin: z.string().min(1).optional(),
		creadorId: z.coerce.number().int().positive(),
	})
);

export const ShapeProyectoUpdate = openApiRegistry.register(
	"ProyectoUpdateInput",
	z.object({
		id: z.coerce.number().int().positive(),
		empresaId: z.coerce.number().int().positive(),
		codigo: z.string().min(1),
		nombre: z.string().min(1),
		descripcion: z.string().optional(),
		fechaInicio: z.string().min(1).optional(),
		fechaFin: z.string().min(1).optional(),
		creadorId: z.coerce.number().int().positive(),
	})
);

export const ShapeProyectoList = openApiRegistry.register(
	"ProyectoListInput",
	z.object({
		empresaId: z.coerce.number().int().positive(),
		busqueda: z.string().optional(),
		page: z.coerce.number().int().min(1).default(1),
		pageSize: z.coerce.number().int().min(1).max(100).default(20),
	})
);

export const ShapeProyectoColaboradoresList = openApiRegistry.register(
	"ProyectoColaboradoresListInput",
	z.object({
		proyectoId: z.coerce.number().int().positive(),
	})
);

export const ShapeProyectoColaboradorAssign = openApiRegistry.register(
	"ProyectoColaboradorAssignInput",
	z.object({
		proyectoId: z.coerce.number().int().positive(),
		usuarioId: z.coerce.number().int().positive(),
		esPropietario: z.boolean().default(false),
		puedeEditar: z.boolean().default(true),
	})
);

export type ProyectoCreateInput = z.infer<typeof ShapeProyectoCreate>;
export type ProyectoUpdateInput = z.infer<typeof ShapeProyectoUpdate>;
export type ProyectoListInput = z.infer<typeof ShapeProyectoList>;
export type ProyectoColaboradoresListInput = z.infer<
	typeof ShapeProyectoColaboradoresList
>;
export type ProyectoColaboradorAssignInput = z.infer<
	typeof ShapeProyectoColaboradorAssign
>;
