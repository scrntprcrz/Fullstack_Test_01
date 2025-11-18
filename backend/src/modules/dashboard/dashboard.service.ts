import { QueryDb } from "../../helpers/db";
import {
	ShapeDashboardStats,
	type DashboardStatsInput,
} from "./dashboard.schemas";

type DbCtx = { query: QueryDb };

export const getDashboardEstadisticasUsuario = async (
	{ query }: DbCtx,
	input: DashboardStatsInput
) => {
	const S = ShapeDashboardStats.parse(input);

	const whereProyectos: string[] = [];
	const argsProyectos: unknown[] = [];

	whereProyectos.push("(p.creador_id=? OR pu.usuarios_id=?)");
	argsProyectos.push(S.usuarioId, S.usuarioId);

	if (S.empresaId) {
		whereProyectos.push("p.empresas_id=?");
		argsProyectos.push(S.empresaId);
	}

	const sqlWhere = `WHERE ${whereProyectos.join(" AND ")}`;

	const proyectosRows = (await query(
		`SELECT DISTINCT p.id
     FROM proyectos p
     LEFT JOIN proyectos_usuarios pu ON pu.proyectos_id=p.id
     ${sqlWhere}`,
		argsProyectos
	)) as { id: number }[];

	const proyectoIds = proyectosRows.map((r) => r.id);
	const totalProyectos = proyectoIds.length;

	if (!proyectoIds.length) {
		return {
			totalProyectos: 0,
			totalTareas: 0,
			tareasPorEstado: {
				pendiente: 0,
				enProgreso: 0,
				completada: 0,
			},
			totalTareasAsignadas: 0,
		};
	}

	const placeholders = proyectoIds.map(() => "?").join(",");

	const tareasRows = (await query(
		`SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN t.estado='pendiente' THEN 1 ELSE 0 END) AS pendientes,
       SUM(CASE WHEN t.estado='en_progreso' THEN 1 ELSE 0 END) AS en_progreso,
       SUM(CASE WHEN t.estado='completada' THEN 1 ELSE 0 END) AS completadas
     FROM tareas t
     WHERE t.proyectos_id IN (${placeholders})`,
		proyectoIds
	)) as any[];

	const tareasAsignadasRows = (await query(
		`SELECT
       COUNT(*) AS total_asignadas
     FROM tareas t
     WHERE t.proyectos_id IN (${placeholders})
       AND t.asignado_id=?`,
		[...proyectoIds, S.usuarioId]
	)) as any[];

	const t = tareasRows[0] ?? {};
	const ta = tareasAsignadasRows[0] ?? {};

	return {
		totalProyectos,
		totalTareas: Number(t.total ?? 0),
		tareasPorEstado: {
			pendiente: Number(t.pendientes ?? 0),
			enProgreso: Number(t.en_progreso ?? 0),
			completada: Number(t.completadas ?? 0),
		},
		totalTareasAsignadas: Number(ta.total_asignadas ?? 0),
	};
};
