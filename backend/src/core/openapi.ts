import { z } from "zod";
import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
	extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();

export const createOpenApiDocument = () => {
	const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			title: "API",
			version: "1.0.0",
		},
	});
};
