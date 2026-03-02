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

export const RasioTrendChart = ({ data, onLihatData }: RasioTrendChartProps) => {
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
      // Extract ratio value from "1:XX" format
      const ratioMatch = entity.rasio.match(/1:(\d+)/);
      const ratioValue = ratioMatch ? parseInt(ratioMatch[1]) : 0;

      const entityName = isProdiLevel ? entity.nama_prodi : entity.nama_fakultas;

      if (isMultiEntity) {
        // Use entity name as key for multiple lines
        yearItem[entityName || 'Unknown'] = ratioValue;
      } else {
        // Single entity - use simpler key
        yearItem.rasio = ratioValue;
      }
    });

    return yearItem;
  });

  // Define lines based on entity count
  const colors = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ];

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Tren Rasio Dosen-Mahasiswa
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Data {data.length} tahun terakhir
            {isProdiLevel && " (per Program Studi)"}
            {!isProdiLevel && entityNames.length > 1 && " (per Fakultas)"}
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
              value: "Rasio (1:N)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {isMultiEntity ? (
            // Multiple lines for each entity (fakultas or prodi)
            entityNames.map((entityName, index) => (
              <Line
                key={entityName}
                type="monotone"
                dataKey={entityName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={entityName}
                dot={{ r: 4 }}
              />
            ))
          ) : (
            // Single line for filtered view
            <Line
              type="monotone"
              dataKey="rasio"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Rasio"
              dot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {data.slice(0, 3).map((yearData, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <p className="mb-1 text-sm font-semibold text-gray-800">
              {yearData.tahun}
            </p>
            {yearData.data.map((entity, eIndex) => {
              const ratioMatch = entity.rasio.match(/1:(\d+)/);
              const ratioValue = ratioMatch ? parseInt(ratioMatch[1]) : 0;
              let color = "#22c55e"; // green
              if (ratioValue > 20) color = "#eab308"; // yellow
              if (ratioValue > 30) color = "#ef4444"; // red

              const entityName = isProdiLevel ? entity.nama_prodi : entity.nama_fakultas;

              return (
                <div key={eIndex} className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">
                    {isMultiEntity ? entityName : isProdiLevel ? "Prodi" : "Fakultas"}
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {entity.rasio}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
