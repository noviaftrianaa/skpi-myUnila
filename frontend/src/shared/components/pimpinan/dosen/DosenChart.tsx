import { Button } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Chart type options
export type ChartType = "bar" | "bar-stacked" | "pie" | "line";

// Color palette for charts
const COLORS = [
  "#94a3b8", // gray - for "belum jabfung"
  "#3b82f6", // blue - for "asisten ahli"
  "#22c55e", // green - for "lektor"
  "#f59e0b", // amber - for "lektor kepala"
  "#ef4444", // red - for "profesor"
];

interface DosenChartProps<T = Record<string, any>> {
  data: T[];
  chartType: ChartType;
  title: string;
  onLihatData: () => void;
  // For bar/line charts: keys to display as bars/lines
  dataKeys?: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  // For pie chart: single data key and name key
  pieDataKey?: string;
  pieNameKey?: string;
  // For axis labels
  xAxisKey?: string;
  // Optional subtitle
  subtitle?: string;
  // Disable the "Lihat Data" button
  disabled?: boolean;
}

export const DosenChart = <T extends Record<string, any>>({
  data,
  chartType,
  title,
  onLihatData,
  dataKeys,
  pieDataKey,
  pieNameKey,
  xAxisKey = "name",
  subtitle,
  disabled = false,
}: DosenChartProps<T>) => {
  // Default jabfung data keys
  const defaultJabfungKeys = [
    { key: "belum_jabfung", name: "Belum Jabfung", color: COLORS[0] },
    { key: "asisten_ahli", name: "Asisten Ahli", color: COLORS[1] },
    { key: "lektor", name: "Lektor", color: COLORS[2] },
    { key: "lektor_kepala", name: "Lektor Kepala", color: COLORS[3] },
    { key: "profesor", name: "Profesor", color: COLORS[4] },
  ];

  const keys = dataKeys || defaultJabfungKeys;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={item.color || "#3b82f6"}
                name={item.name}
              />
            ))}
          </BarChart>
        );

      case "bar-stacked":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="jabfung"
                fill={item.color || "#3b82f6"}
                name={item.name}
              />
            ))}
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={pieDataKey || "total"}
              nameKey={pieNameKey || "name"}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={120}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color || "#3b82f6"}
                name={item.name}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Button
          color="primary"
          variant="solid"
          onPress={onLihatData}
          isDisabled={disabled}
          className="bg-myunila text-white"
        >
          Lihat Data
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
