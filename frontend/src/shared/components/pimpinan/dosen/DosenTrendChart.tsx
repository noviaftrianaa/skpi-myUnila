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
    // dokter_pendidik_klinis?: number;
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
    // Jenjang pendidikan fields
    d3?: number;
    d4?: number;
    s1?: number;
    s2?: number;
    s2_terapan?: number;
    s3?: number;
    profesi?: number;
    sp1?: number;
    sp2?: number;
    belum_jenjang?: number;
    // Jenis kelamin fields
    laki_laki?: number;
    perempuan?: number;
    // Status kepegawaian fields
    pns?: number;
    cpns?: number;
    pppk?: number;
    non_asn?: number;
    asn_jf_non_dosen?: number;
    dokter_pendidik_klinis?: number;
    lainnya?: number;
    // Pangkat golongan fields
    juru_muda?: number;
    juru_muda_tk_1?: number;
    juru?: number;
    juru_tk_1?: number;
    pengatur_muda?: number;
    pengatur_muda_tk_1?: number;
    pengatur?: number;
    pengatur_tk_1?: number;
    penata_muda?: number;
    penata_muda_tk_1?: number;
    penata?: number;
    penata_tk_1?: number;
    pembina?: number;
    pembina_tk_1?: number;
    pembina_utama_muda?: number;
    pembina_utama_madya?: number;
    pembina_utama?: number;
    belum_pangkat_gol?: number;
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
  selectedCategory?: string | null;
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

const JENJANG_PENDIDIKAN_CATEGORIES = [
  { key: "s3", name: "S3", color: "#ef4444" },
  { key: "s2", name: "S2", color: "#f59e0b" },
  { key: "s2_terapan", name: "S2 Terapan", color: "#22c55e" },
  { key: "profesi", name: "Profesi", color: "#14b8a6" },
  { key: "sp1", name: "Sp1", color: "#06b6d4" },
  { key: "sp2", name: "Sp2", color: "#0ea5e9" },
  { key: "s1", name: "S1", color: "#3b82f6" },
  { key: "d4", name: "D4", color: "#6366f1" },
  { key: "d3", name: "D3", color: "#8b5cf6" },
  { key: "belum_jenjang", name: "Belum Jenjang", color: "#cbd5e1" },
];

const JENIS_KELAMIN_CATEGORIES = [
  { key: "laki_laki", name: "Laki-laki", color: "#3b82f6" },
  { key: "perempuan", name: "Perempuan", color: "#ec4899" },
];

const PANGKAT_GOLONGAN_CATEGORIES = [
  { key: "juru_muda", name: "Juru Muda", color: "#06b6d4" },
  { key: "juru_muda_tk_1", name: "Juru Muda Tk. I", color: "#0ea5e9" },
  { key: "juru", name: "Juru", color: "#3b82f6" },
  { key: "juru_tk_1", name: "Juru Tk. I", color: "#6366f1" },
  { key: "pengatur_muda", name: "Pengatur Muda", color: "#8b5cf6" },
  { key: "pengatur_muda_tk_1", name: "Pengatur Muda Tk. I", color: "#a855f7" },
  { key: "pengatur", name: "Pengatur", color: "#d946ef" },
  { key: "pengatur_tk_1", name: "Pengatur Tk. I", color: "#ec4899" },
  { key: "penata_muda", name: "Penata Muda", color: "#22c55e" },
  { key: "penata_muda_tk_1", name: "Penata Muda Tk. I", color: "#14b8a6" },
  { key: "penata", name: "Penata", color: "#06b6d4" },
  { key: "penata_tk_1", name: "Penata Tk. I", color: "#0ea5e9" },
  { key: "pembina", name: "Pembina", color: "#3b82f6" },
  { key: "pembina_tk_1", name: "Pembina Tk. I", color: "#6366f1" },
  { key: "pembina_utama_muda", name: "Pembina Utama Muda", color: "#8b5cf6" },
  { key: "pembina_utama_madya", name: "Pembina Utama Madya", color: "#a855f7" },
  { key: "pembina_utama", name: "Pembina Utama", color: "#d946ef" },
  { key: "belum_pangkat_gol", name: "Belum Pangkat", color: "#cbd5e1" },
];

const STATUS_KEPEGAWAIAN_CATEGORIES = [
  { key: "pns", name: "PNS", color: "#3b82f6" },
  { key: "cpns", name: "CPNS", color: "#22c55e" },
  { key: "pppk", name: "PPPK", color: "#f59e0b" },
  { key: "asn_jf_non_dosen", name: "ASN JF Non Dosen", color: "#8b5cf6" },
  {
    key: "dokter_pendidik_klinis",
    name: "Dokter Pendidik Klinis",
    color: "#06b6d4",
  },
  { key: "non_asn", name: "Non-ASN", color: "#ef4444" },
  { key: "lainnya", name: "Lainnya", color: "#94a3b8" },
];

export {
  JABFUNG_CATEGORIES,
  IKATAN_KERJA_CATEGORIES,
  JENJANG_PENDIDIKAN_CATEGORIES,
  JENIS_KELAMIN_CATEGORIES,
  PANGKAT_GOLONGAN_CATEGORIES,
  STATUS_KEPEGAWAIAN_CATEGORIES,
};

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
  selectedCategory,
}: DosenTrendChartProps) => {
  // Filter categories based on selectedCategory
  const filteredCategories = selectedCategory
    ? categoryKeys.filter((cat) => cat.key === selectedCategory)
    : categoryKeys;

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
      filteredCategories.forEach((cat) => {
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
          {filteredCategories.map((cat) => (
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
          const jabfungTotals = filteredCategories.reduce(
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
                {filteredCategories.map((cat) => (
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
