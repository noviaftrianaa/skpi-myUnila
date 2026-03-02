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
} from "recharts";

interface RasioChartProps {
  data: Array<{
    name: string;
    dosen: number;
    mahasiswa: number;
    rasio: string;
  }>;
  onLihatData: () => void;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="mb-2 font-bold text-gray-800">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-semibold text-blue-600">Rasio :</span>
            {data.rasio}
          </p>
          <p className="pt-2 mt-2 text-sm font-bold text-purple-600 border-t border-gray-200"></p>
        </div>
      </div>
    );
  }
  return null;
};

export const RasioChart = ({ data, onLihatData }: RasioChartProps) => {
  // Transform data to show normalized values for comparison
  // Dosen always = 1 (as base), Mahasiswa = ratio value
  const chartData = data.map((item) => {
    const rasioValue = parseInt(item.rasio.split(":")[1]);
    return {
      name: item.name,
      dosen: 1,
      mahasiswa: rasioValue,
      rasio: item.rasio,
      dosenAsli: item.dosen,
      mahasiswaAsli: item.mahasiswa,
    };
  });

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Grafik Rasio Dosen-Mahasiswa
          </h2>
          <p className="mt-1 text-sm text-gray-500"></p>
        </div>
        <Button
          color="primary"
          variant="solid"
          onPress={onLihatData}
          className="text-white bg-myunila"
        >
          Lihat Data
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={800}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          barCategoryGap="10%"
          barGap={22}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            label={{
              value: "Rasio (Normalisasi)",
              position: "insideBottom",
              offset: -5,
            }}
            tick={{ fontSize: 11 }}
            stroke="#666"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#666"
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="dosen"
            fill="#3b82f6"
            name="Dosen"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
          <Bar
            dataKey="mahasiswa"
            fill="#22c55e"
            name="Mahasiswa per Dosen"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Rasio Summary */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {data.map((item, index) => {
          const ratioValue = parseInt(item.rasio.split(":")[1]);
          let color = "#22c55e"; // Green
          if (ratioValue > 20) color = "#eab308"; // Yellow
          if (ratioValue > 30) color = "#ef4444"; // Red

          return (
            <div
              key={index}
              className="p-3 border-2 rounded-lg"
              style={{ borderColor: color, backgroundColor: `${color}10` }}
            >
              <p className="mb-1 text-sm font-semibold text-gray-800">
                {item.name}
              </p>
              <p className="text-2xl font-bold" style={{ color }}>
                {item.rasio}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {item.dosen} dosen : {item.mahasiswa} mhs
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
