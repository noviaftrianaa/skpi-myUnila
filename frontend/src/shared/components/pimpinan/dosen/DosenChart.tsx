import { Button, Spinner } from "@heroui/react";
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
  // Show loading state
  isLoading?: boolean;
  // Filter by selected category
  selectedCategory?: string | null;
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
  isLoading = false,
  selectedCategory,
}: DosenChartProps<T>) => {
  // Default jabfung data keys
  const defaultJabfungKeys = [
    { key: "belum_jabfung", name: "Belum Jabfung", color: COLORS[0] },
    { key: "asisten_ahli", name: "Asisten Ahli", color: COLORS[1] },
    { key: "lektor", name: "Lektor", color: COLORS[2] },
    { key: "lektor_kepala", name: "Lektor Kepala", color: COLORS[3] },
    { key: "profesor", name: "Profesor", color: COLORS[4] },
  ];

  // Filter dataKeys based on selectedCategory
  const baseKeys = dataKeys || defaultJabfungKeys;
  const keys = selectedCategory
    ? baseKeys.filter((item) => item.key === selectedCategory)
    : baseKeys;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart
            data={data}
            barSize={30}
            layout="vertical"
            barCategoryGap="35%"
            barGap={6}
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              interval={0}
              tick={{ fontSize: 11 }}
              width={110}
            />
            <Tooltip />
            <Legend verticalAlign="top" />
            {keys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={item.color || "#3b82f6"}
                name={item.name}
                barSize={20}
              />
            ))}
          </BarChart>
        );

      case "bar-stacked":
        return (
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap="35%"
            barSize={30}
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              interval={0}
              tick={{ fontSize: 11 }}
              width={110}
            />
            <Tooltip />
            <Legend verticalAlign="top" />
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
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
            <XAxis
              dataKey={xAxisKey}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
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
    <div className="relative p-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Button
          color="primary"
          variant="solid"
          onPress={onLihatData}
          isDisabled={disabled}
          className="text-white bg-myunila"
        >
          Lihat Data
        </Button>
      </div>

      <div
        className={
          isLoading
            ? "blur-sm pointer-events-none transition-all duration-300"
            : ""
        }
      >
        <ResponsiveContainer width="100%" height={600}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-xl">
          <Spinner
            size="lg"
            color="primary"
            className="mb-4"
            classNames={{
              circle1: "border-b-myunila",
              circle2: "border-b-myunila",
            }}
          />
          <p className="font-medium text-gray-700 animate-pulse">
            Memuat data grafik...
          </p>
        </div>
      )}
    </div>
  );
};
