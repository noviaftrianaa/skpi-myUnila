import { Button } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RasioChartProps {
  data: Array<{
    name: string;
    dosen: number;
    mahasiswa: number;
    rasio: string;
  }>;
  onLihatData: () => void;
}

export const RasioChart = ({ data, onLihatData }: RasioChartProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Grafik Rasio Dosen-Mahasiswa
        </h2>
        <Button
          color="primary"
          variant="solid"
          onPress={onLihatData}
          className="bg-myunila text-white"
        >
          Lihat Data
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="dosen" fill="#3b82f6" name="Dosen" />
          <Bar dataKey="mahasiswa" fill="#22c55e" name="Mahasiswa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
