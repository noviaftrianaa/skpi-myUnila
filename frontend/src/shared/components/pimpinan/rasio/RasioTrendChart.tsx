import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

export const RasioTrendChart = ({
  data,
  onLihatData,
}: RasioTrendChartProps) => {
  // Aggregate data per year - calculate overall ratio
  const chartData = data.map((yearData) => {
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
      // rasio: aggregatedRatio,
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
          <XAxis dataKey="tahun" tick={{ fontSize: 12 }} stroke="#666" />
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
            yAxisId="right"
            type="monotone"
            dataKey="totalDosen"
            stroke="#2563eb"
            strokeWidth={2}
            name="Total Dosen"
            dot={{ r: 4, fill: "#2563eb" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalMahasiswa"
            stroke="#16a34a"
            strokeWidth={2}
            name="Total Mahasiswa"
            dot={{ r: 4, fill: "#16a34a" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {chartData.slice(0, 3).map((yearData, index) => {
          // Calculate ratio from the data
          const ratio =
            yearData.totalDosen > 0
              ? Math.round(yearData.totalMahasiswa / yearData.totalDosen)
              : 0;
          let color = "#16a34a"; // green
          if (ratio > 20) color = "#eab308"; // yellow
          if (ratio > 30) color = "#ef4444"; // red

          return (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <p className="mb-1 text-sm font-semibold text-gray-800">
                {yearData.tahun}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600">Rasio</p>
                <p className="text-sm font-bold" style={{ color }}>
                  {yearData.rasioDisplay}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Dosen:{" "}
                  <span className="font-semibold" style={{ color: "#2563eb" }}>
                    {yearData.totalDosen}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Mhs:{" "}
                  <span className="font-semibold" style={{ color: "#16a34a" }}>
                    {yearData.totalMahasiswa}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
