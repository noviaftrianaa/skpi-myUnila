import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@heroui/react";

export interface TrendDataItem {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Array<{
    id: string;
    nama_fakultas?: string;
    nama_prodi?: string;
    belum_jabfung?: number;
    asisten_ahli?: number;
    lektor?: number;
    lektor_kepala?: number;
    profesor?: number;
    total: number;
  }>;
}

interface DosenTrendChartProps {
  data: TrendDataItem[];
  title?: string;
  onLihatData?: () => void;
  // Jabfung category keys to track
  categoryKeys?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
}

const JABFUNG_CATEGORIES = [
  { key: "profesor", name: "Profesor", color: "#ef4444" },
  { key: "lektor_kepala", name: "Lektor Kepala", color: "#f59e0b" },
  { key: "lektor", name: "Lektor", color: "#22c55e" },
  { key: "asisten_ahli", name: "Asisten Ahli", color: "#3b82f6" },
  { key: "belum_jabfung", name: "Belum Jabfung", color: "#94a3b8" },
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="mb-2 font-bold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-1">
            <p className="text-sm">
              <span style={{ color: entry.color }}>●</span>{" "}
              <span className="font-semibold">{entry.name}:</span>{" "}
              {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DosenTrendChart = ({ data, title, onLihatData, categoryKeys = JABFUNG_CATEGORIES }: DosenTrendChartProps) => {
  // Determine if data is at prodi level or fakultas level
  const isProdiLevel = data.length > 0 && data[0].data.length > 0 && !!data[0].data[0].nama_prodi;

  // Get unique names for lines (either fakultas or prodi names)
  const entityNames = data.length > 0 && data[0].data.length > 0
    ? [...new Set(data.flatMap(year => year.data.map(d => isProdiLevel ? d.nama_prodi : d.nama_fakultas)))]
    : [];

  const isMultiEntity = entityNames.length > 1;

  // Transform data to format suitable for line chart
  const chartData = data.map(yearData => {
    const yearItem: any = {
      tahun: yearData.tahun,
    };

    yearData.data.forEach(entity => {
      // Always aggregate by jabfung category, regardless of entity count
      categoryKeys.forEach(cat => {
        if (!yearItem[cat.key]) {
          yearItem[cat.key] = 0;
        }
        yearItem[cat.key] += entity[cat.key as keyof typeof entity] || 0;
      });
    });

    return yearItem;
  });

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {title || "Tren Jabatan Fungsional (5 Tahun Terakhir)"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Data {data.length} tahun terakhir
            {isProdiLevel && " (Program Studi)"}
            {!isProdiLevel && entityNames.length > 1 && " (Universitas)"}
          </p>
        </div>
        {onLihatData && (
          <Button
            color="primary"
            variant="solid"
            onPress={onLihatData}
            className="text-white bg-myunila"
          >
            Lihat Data
          </Button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="tahun"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            label={{
              value: "Jumlah Dosen",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Always show jabfung category lines (aggregated totals) */}
          {categoryKeys.map(cat => (
            <Line
              key={cat.key}
              type="monotone"
              dataKey={cat.key}
              stroke={cat.color}
              strokeWidth={2}
              name={cat.name}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {data.slice(0, 3).map((yearData, index) => {
          // Calculate jabfung totals for this year
          const jabfungTotals = categoryKeys.reduce((acc, cat) => {
            acc[cat.key] = yearData.data.reduce((sum, entity) => {
              return sum + (entity[cat.key as keyof typeof entity] || 0);
            }, 0);
            return acc;
          }, {} as Record<string, number>);

          return (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <p className="mb-2 text-sm font-semibold text-gray-800">
                {yearData.tahun}
              </p>
              <div className="space-y-1">
                {categoryKeys.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">{cat.name}</p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: cat.color }}
                    >
                      {jabfungTotals[cat.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
