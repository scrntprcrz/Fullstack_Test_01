import { z } from "zod";
import { openApiRegistry } from "../../core/openapi";
import {
	ShapeProyectoCreate,
	ShapeProyectoUpdate,
	ShapeProyectoList,
	ShapeProyectoColaboradoresList,
	ShapeProyectoColaboradorAssign,
} from "./proyectos.schemas";

const ProyectoEmpresaSchema = z.object({
	id: z.number().int().positive(),
	codigo: z.string(),
	nombre: z.string(),
});

const ProyectoCreadorSchema = z.object({
	id: z.number().int().positive(),
	usuario: z.string(),
	nombreCompleto: z.string(),
});

const ProyectoColaboradorSchema = z.object({
	usuarioId: z.number().int().positive(),
	usuario: z.string(),
	nombreCompleto: z.string(),
	correo: z.string(),
	esPropietario: z.boolean(),
	puedeEditar: z.boolean(),
});

const ProyectoSchema = z.object({
	id: z.number().int().positive(),
	empresaId: z.number().int().positive(),
	codigo: z.string(),
	nombre: z.string(),
	descripcion: z.string().nullable().optional(),
	creadorId: z.number().int().positive(),
	fechaInicio: z.string().nullable().optional(),
	fechaFin: z.string().nullable().optional(),
	isArchivado: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
	empresa: ProyectoEmpresaSchema,
	creador: ProyectoCreadorSchema,
});

const ProyectoWithColaboradoresSchema = ProyectoSchema.extend({
	colaboradores: z.array(ProyectoColaboradorSchema),
});

const ListProyectosResponseSchema = z.object({
	data: z.array(ProyectoSchema),
	total: z.number().int().nonnegative(),
	limit: z.number().int().nonnegative(),
	offset: z.number().int().nonnegative(),
});

const ListProyectoColaboradoresResponseSchema = z.object({
	data: z.array(ProyectoColaboradorSchema),
});

const CreateProyectoResponseSchema = z.object({
	id: z.number().int().positive(),
});

const ApiErrorSchema = z.object({
	message: z.string(),
});

let isProyectosDocsRegistered = false;

export const registerProyectosOpenApi = () => {
	if (isProyectosDocsRegistered) return;
	isProyectosDocsRegistered = true;

	openApiRegistry.registerPath({
		method: "get",
		path: "/listProyectos",
		request: {
			query: ShapeProyectoList,
		},
		responses: {
			200: {
				description: "Lista paginada de proyectos",
				content: {
					"application/json": {
						schema: ListProyectosResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "get",
		path: "/getProyecto/{id}",
		request: {
			params: z.object({
				id: z.string().min(1),
			}),
		},
		responses: {
			200: {
				description: "Detalle de un proyecto con sus colaboradores",
				content: {
					"application/json": {
						schema: ProyectoWithColaboradoresSchema,
					},
				},
			},
			404: {
				description: "Proyecto no encontrado",
				content: {
					"application/json": {
						schema: ApiErrorSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "post",
		path: "/createProyecto",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ShapeProyectoCreate,
					},
				},
			},
		},
		responses: {
			201: {
				description: "Proyecto creado",
				content: {
					"application/json": {
						schema: CreateProyectoResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "put",
		path: "/updateProyecto/{id}",
		request: {
			params: z.object({
				id: z.string().min(1),
			}),
			body: {
				content: {
					"application/json": {
						schema: ShapeProyectoUpdate,
					},
				},
			},
		},
		responses: {
			204: {
				description: "Proyecto actualizado",
			},
			404: {
				description: "Proyecto no encontrado",
				content: {
					"application/json": {
						schema: ApiErrorSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "delete",
		path: "/deleteProyecto/{id}",
		request: {
			params: z.object({
				id: z.string().min(1),
			}),
			query: z.object({
				usuarioId: z.coerce.number().int().positive(),
				hard: z.enum(["0", "1"]).optional(),
			}),
		},
		responses: {
			204: {
				description: "Proyecto archivado o eliminado",
			},
			404: {
				description: "Proyecto no encontrado",
				content: {
					"application/json": {
						schema: ApiErrorSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "get",
		path: "/listProyectoColaboradores/{id}",
		request: {
			params: z.object({
				id: z.string().min(1),
			}),
		},
		responses: {
			200: {
				description: "Lista de colaboradores del proyecto",
				content: {
					"application/json": {
						schema: ListProyectoColaboradoresResponseSchema,
					},
				},
			},
		},
	});

	openApiRegistry.registerPath({
		method: "post",
		path: "/addProyectoColaborador",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ShapeProyectoColaboradoresList,
					},
				},
			},
		},
		responses: {
			204: {
				description:
					"Colaborador asignado o actualizado en el proyecto",
			},
		},
	});

	openApiRegistry.registerPath({
		method: "delete",
		path: "/removeProyectoColaborador",
		request: {
			query: z.object({
				proyectoId: z.coerce.number().int().positive(),
				usuarioId: z.coerce.number().int().positive(),
			}),
		},
		responses: {
			204: {
				description: "Colaborador removido del proyecto",
			},
			404: {
				description: "Colaborador no encontrado",
				content: {
					"application/json": {
						schema: ApiErrorSchema,
					},
				},
			},
		},
	});
};
