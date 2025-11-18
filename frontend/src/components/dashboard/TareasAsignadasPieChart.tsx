import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
} from "recharts";
import type { TareasAsignadasPieItem } from "../../domain/dashboard";

type Props = {
	data: TareasAsignadasPieItem[];
};

const PIE_COLORS = ["#0f766e", "#e5e7eb"];

export const TareasAsignadasPieChart = ({ data }: Props) => {
	return (
		<div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-slate-800">
					Distribución de tareas
				</h2>
				<p className="text-[11px] text-slate-500">
					Asignadas vs otras tareas.
				</p>
			</div>
			<div className="h-60">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Tooltip />
						<Legend
							verticalAlign="bottom"
							height={24}
							wrapperStyle={{
								fontSize: 11,
							}}
						/>
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="55%"
							outerRadius={65}
							labelLine={false}
							label={(props) =>
								`${props.name} ${Math.round(
									(props.percent ?? 0) * 100
								)}%`
							}
						>
							{data.map((_entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={PIE_COLORS[index % PIE_COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
