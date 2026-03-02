import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PercentageData {
  name: string;
  value: number;
  color: string;
}

interface RasioPercentageChartProps {
  data: PercentageData[];
  title?: string;
  subtitle?: string;
}

const COLORS = {
  dosem: "#3b82f6", // blue
  mahasiswa: "#22c55e", // green
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="mb-2 font-bold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">
          Jumlah: <span className="font-semibold text-gray-800">{data.value.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-600">
          Presentase: <span className="font-semibold text-gray-800">{percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const RasioPercentageChart = ({ data, title, subtitle }: RasioPercentageChartProps) => {
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each data item
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }));

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {title || "Presentase Dosen vs Mahasiswa"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {subtitle || "Perbandingan jumlah total dosen dan mahasiswa"}
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
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
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
                  {item.value.toLocaleString()} orang
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600">Total Populasi</p>
            <p className="text-xl font-bold text-blue-600">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Dosen + Mahasiswa</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-600">Rasio Rata-rata</p>
            <p className="text-xl font-bold text-green-600">
              {data.length === 2
                ? `1:${Math.round(data[1].value / data[0].value)}`
                : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Dosen : Mahasiswa</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-gray-600">Kategori</p>
            <p className="text-xl font-bold text-purple-600">
              {total > 50000 ? "Besar" : total > 20000 ? "Sedang" : "Kecil"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Berdasarkan total populasi</p>
          </div>
        </div>
      </div>
    </div>
  );
};
