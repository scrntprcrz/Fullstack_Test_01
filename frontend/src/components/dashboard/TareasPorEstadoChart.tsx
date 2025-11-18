import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import type { TareasPorEstadoChartItem } from "../../domain/dashboard";

type Props = {
	data: TareasPorEstadoChartItem[];
	porcentajeCompletadas: number;
};

export const TareasPorEstadoChart = ({
	data,
	porcentajeCompletadas,
}: Props) => {
	return (
		<div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-slate-800">
					Tareas por estado
				</h2>
				<p className="text-[11px] text-slate-500">
					Avance global:{" "}
					<span className="font-semibold text-slate-800">
						{porcentajeCompletadas}%
					</span>{" "}
					completadas
				</p>
			</div>
			<div className="h-60">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{
							top: 16,
							right: 16,
							bottom: 8,
							left: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="estado" tick={{ fontSize: 11 }} />
						<YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
						<Tooltip />
						<Bar
							dataKey="cantidad"
							name="Tareas"
							radius={[4, 4, 0, 0]}
							fill="#0f172a"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
