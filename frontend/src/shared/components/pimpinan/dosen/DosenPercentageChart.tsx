import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export interface PercentageData {
  name: string;
  value: number;
  color: string;
}

interface DosenPercentageChartProps {
  data: PercentageData[];
  title?: string;
  subtitle?: string;
}

const COLORS = {
  belum_jabfung: "#94a3b8", // gray
  asisten_ahli: "#3b82f6", // blue
  lektor: "#22c55e", // green
  lektor_kepala: "#f59e0b", // amber
  profesor: "#ef4444", // red
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce(
      (sum: number, entry: any) => sum + entry.payload.value,
      0,
    );
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="mb-2 font-bold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">
          Jumlah:{" "}
          <span className="font-semibold text-gray-800">
            {data.value.toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Presentase:{" "}
          <span className="font-semibold text-gray-800">{percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const DosenPercentageChart = ({
  data,
  title,
  subtitle,
}: DosenPercentageChartProps) => {
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each data item
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }));

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {title || "Presentase Jabatan Fungsional"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {subtitle ||
            "Perbandingan jumlah dosen berdasarkan jabatan fungsional"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          {dataWithPercentage.map((item, index) => (
            <div
              key={index}
              className="p-4 border-2 rounded-lg"
              style={{
                borderColor: item.color,
                backgroundColor: `${item.color}10`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.percentage}%
                </p>
                <p className="text-xs text-gray-600">
                  {item.value.toLocaleString()} dosen
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
