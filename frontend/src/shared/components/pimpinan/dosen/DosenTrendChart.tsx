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

export interface TrendDataItem {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Array<{
    id: string;
    nama_fakultas?: string;
    nama_prodi?: string;
    // Jabfung fields
    belum_jabfung?: number;
    asisten_ahli?: number;
    lektor?: number;
    lektor_kepala?: number;
    profesor?: number;
    // Ikatan kerja fields
    dosen_tetap?: number;
    dosen_pns_dpk?: number;
    dokter_pendidik_klinis?: number;
    dosen_tetap_bh?: number;
    dosen_tidak_tetap?: number;
    p3k_asn?: number;
    dosen_perjanjian_kerja?: number;
    instruktur?: number;
    tutor?: number;
    jft?: number;
    pengajar_nondosen?: number;
    dosen_tetap_pk_waktu_tertentu?: number;
    belum_ikatan_kerja?: number;
    total: number;
  }>;
}

interface DosenTrendChartProps {
  data: TrendDataItem[];
  title?: string;
  onLihatData?: () => void;
  // Category keys to track (jabfung or ikatan kerja)
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

const IKATAN_KERJA_CATEGORIES = [
  { key: "dosen_tetap", name: "Dosen Tetap", color: "#3b82f6" },
  { key: "dosen_pns_dpk", name: "PNS DPK", color: "#6366f1" },
  {
    key: "dokter_pendidik_klinis",
    name: "Dokter Pendidik Klinis",
    color: "#8b5cf6",
  },
  { key: "dosen_tetap_bh", name: "Dosen Tetap BH", color: "#a855f7" },
  { key: "dosen_tidak_tetap", name: "Dosen Tidak Tetap", color: "#22c55e" },
  { key: "p3k_asn", name: "P3K ASN", color: "#14b8a6" },
  { key: "dosen_perjanjian_kerja", name: "Perjanjian Kerja", color: "#06b6d4" },
  { key: "instruktur", name: "Instruktur", color: "#f59e0b" },
  { key: "tutor", name: "Tutor", color: "#f97316" },
  { key: "jft", name: "JFT", color: "#ef4444" },
  { key: "pengajar_nondosen", name: "Pengajar Nondosen", color: "#dc2626" },
  {
    key: "dosen_tetap_pk_waktu_tertentu",
    name: "Tetap PKWTT",
    color: "#b91c1c",
  },
  { key: "belum_ikatan_kerja", name: "Belum Ikatan Kerja", color: "#cbd5e1" },
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="mb-2 font-bold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-1">
            <p className="text-sm">
              <span style={{ color: entry.color }}>●</span>{" "}
              <span className="font-semibold">{entry.name}:</span> {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DosenTrendChart = ({
  data,
  title,
  onLihatData,
  categoryKeys = JABFUNG_CATEGORIES,
}: DosenTrendChartProps) => {
  // Determine if data is at prodi level or fakultas level
  const isProdiLevel =
    data.length > 0 && data[0].data.length > 0 && !!data[0].data[0].nama_prodi;

  // Get unique names for lines (either fakultas or prodi names)
  const entityNames =
    data.length > 0 && data[0].data.length > 0
      ? [
          ...new Set(
            data.flatMap((year) =>
              year.data.map((d) =>
                isProdiLevel ? d.nama_prodi : d.nama_fakultas,
              ),
            ),
          ),
        ]
      : [];

  // Transform data to format suitable for line chart
  const chartData = data.map((yearData) => {
    const yearItem: any = {
      tahun: yearData.tahun,
    };

    yearData.data.forEach((entity) => {
      // Always aggregate by category, regardless of entity count
      categoryKeys.forEach((cat) => {
        if (!yearItem[cat.key]) {
          yearItem[cat.key] = 0;
        }
        const value = entity[cat.key as keyof typeof entity];
        yearItem[cat.key] += typeof value === "number" ? value : 0;
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
          <XAxis dataKey="tahun" tick={{ fontSize: 12 }} stroke="#666" />
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
          {categoryKeys.map((cat) => (
            <Line
              key={cat.key}
              type="monotone"
              dataKey={cat.key}
              stroke={cat.color}
              strokeWidth={2}
              name={cat.name}
              dot={{ r: 4 }}
              className=" -z-10"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
        {data.slice(0, 3).map((yearData, index) => {
          // Calculate jabfung totals for this year
          const jabfungTotals = categoryKeys.reduce(
            (acc, cat) => {
              acc[cat.key] = yearData.data.reduce((sum, entity) => {
                const value = entity[cat.key as keyof typeof entity];
                return sum + (typeof value === "number" ? value : 0);
              }, 0);
              return acc;
            },
            {} as Record<string, number>,
          );

          return (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <p className="mb-2 text-sm font-semibold text-gray-800">
                {yearData.tahun}
              </p>
              <div className="space-y-1">
                {categoryKeys.map((cat) => (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between"
                  >
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
