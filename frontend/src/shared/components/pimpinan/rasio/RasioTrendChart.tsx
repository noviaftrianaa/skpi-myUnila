import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@heroui/react";

interface TrendDataItem {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Array<{
    id: string;
    nama_fakultas?: string;
    nama_prodi?: string;
    total_dosen: number;
    total_mahasiswa: number;
    rasio: string;
  }>;
}

interface RasioTrendChartProps {
  data: TrendDataItem[];
  onLihatData?: () => void;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
        <p className="mb-3 font-bold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-2">
            <p className="text-sm">
              <span style={{ color: entry.color }}>●</span>{" "}
              <span className="font-semibold">{entry.name}:</span>{" "}
              <span className="font-bold">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RasioTrendChart = ({ data, onLihatData }: RasioTrendChartProps) => {
  // Aggregate data per year - calculate overall ratio
  const chartData = data.map(yearData => {
    // Calculate totals for the year
    // Handle both Fakultas (total_dosen, total_mahasiswa) and Prodi (jumlah_dosen, jumlah_mahasiswa) field names
    const totalDosen = yearData.data.reduce((sum, entity) => {
      return sum + (entity.total_dosen || entity.jumlah_dosen || 0);
    }, 0);
    const totalMahasiswa = yearData.data.reduce((sum, entity) => {
      return sum + (entity.total_mahasiswa || entity.jumlah_mahasiswa || 0);
    }, 0);

    // Calculate aggregated ratio
    let aggregatedRatio = 0;
    let ratioDisplay = "0:0";

    if (totalDosen > 0) {
      aggregatedRatio = Math.round(totalMahasiswa / totalDosen);
      ratioDisplay = `1:${aggregatedRatio}`;
    }

    return {
      tahun: yearData.tahun,
      rasio: aggregatedRatio,
      rasioDisplay: ratioDisplay,
      totalDosen,
      totalMahasiswa,
    };
  });

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Tren Rasio Dosen-Mahasiswa
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Data {data.length} tahun terakhir (Rasio & Jumlah)
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
            yAxisId="left"
            label={{
              value: "Rasio (1:N)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Jumlah",
              angle: 90,
              position: "insideRight",
              style: { textAnchor: "middle" },
            }}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rasio"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Rasio (1:N)"
            dot={{ r: 6, fill: "#3b82f6" }}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalDosen"
            stroke="#22c55e"
            strokeWidth={2}
            name="Total Dosen"
            dot={{ r: 4, fill: "#22c55e" }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalMahasiswa"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Total Mahasiswa"
            dot={{ r: 4, fill: "#f59e0b" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {chartData.slice(0, 3).map((yearData, index) => {
          let color = "#22c55e"; // green
          if (yearData.rasio > 20) color = "#eab308"; // yellow
          if (yearData.rasio > 30) color = "#ef4444"; // red

          return (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <p className="mb-1 text-sm font-semibold text-gray-800">
                {yearData.tahun}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600">Rasio</p>
                <p
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  {yearData.rasioDisplay}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">Dosen: <span className="font-semibold text-green-600">{yearData.totalDosen}</span></p>
                <p className="text-xs text-gray-500">Mhs: <span className="font-semibold text-amber-600">{yearData.totalMahasiswa}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
