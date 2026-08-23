// src/pages/admin/DashboardAdmin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Activity,
  BarChart2,
  Folder,
  ArrowRight,
} from "lucide-react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import Navbar from "../../components/common/Navbar";

const statCards = [
  {
    label: "TOTAL PENGAJUAN",
    value: 14,
    icon: <FileText size={16} />,
    bgGradient: "from-blue-600 to-blue-700",
    watermarkIcon: <FileText size={80} />,
  },
  {
    label: "BELUM DIPERIKSA",
    value: 5,
    icon: <Clock size={16} />,
    bgGradient: "from-sky-500 to-sky-600",
    watermarkIcon: <Clock size={80} />,
  },
  {
    label: "DITANGGUHKAN",
    value: 2,
    icon: <AlertCircle size={16} />,
    bgGradient: "from-amber-500 to-orange-500",
    watermarkIcon: <AlertCircle size={80} />,
  },
  {
    label: "DIVALIDASI",
    value: 6,
    icon: <CheckCircle2 size={16} />,
    bgGradient: "from-emerald-500 to-teal-600",
    watermarkIcon: <CheckCircle2 size={80} />,
  },
];

const prestasiData = [
  { year: "2025", Internasional: 2, Nasional: 6, Lokal: 6, "Tidak Terkategorisasi": 0 },
];

const karyaPerBentukData = [
  { name: "Aplikasi / Software", value: 1, fill: "#0A2647" },
  { name: "Karya Seni / Desain", value: 1, fill: "#0B63C6" },
];

const weeklyValidasiData = [
  { week: "28 Sep", count: 0 },
  { week: "5 Okt", count: 0 },
  { week: "12 Okt", count: 1 },
  { week: "19 Okt", count: 0 },
  { week: "26 Okt", count: 1 },
  { week: "2 Nov", count: 0 },
  { week: "9 Nov", count: 1 },
  { week: "16 Nov", count: 1 },
];

const antriValidasi = [
  {
    nama: "Novia Fitriana",
    nim: "202110010",
    kegiatan: "Pelatihan Public Speaking",
    prodi: "Teknik Elektro",
    kategori: "Pelatihan",
    kategoriBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    tanggal: "25 Okt 2025",
    status: "Ditangguhkan",
  },
  {
    nama: "Siti Nurhaliza",
    nim: "202110002",
    kegiatan: "Regional Line Follower Competition",
    prodi: "Manajemen Informatika",
    kategori: "Lomba",
    kategoriBg: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    tanggal: "25 Okt 2025",
    status: "Belum Diperiksa",
  },
  {
    nama: "Ahmad Rizki",
    nim: "202110001",
    kegiatan: "National Coding Competition 2025",
    prodi: "Teknik Informatika",
    kategori: "Lomba",
    kategoriBg: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    tanggal: "20 Okt 2025",
    status: "Belum Diperiksa",
  },
  {
    nama: "Siti Nurhaliza",
    nim: "202110002",
    kegiatan: "Digital Innovation Summit",
    prodi: "Manajemen Informatika",
    kategori: "Seminar",
    kategoriBg: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    tanggal: "18 Okt 2025",
    status: "Ditangguhkan",
  },
  {
    nama: "Hanifa Azzahra",
    nim: "2020021001",
    kegiatan: "National Hackathon 2025",
    prodi: "Teknik Elektro",
    kategori: "Lomba",
    kategoriBg: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    tanggal: "15 Okt 2025",
    status: "Belum Diperiksa",
  },
  {
    nama: "Dewi Lestari",
    nim: "202110004",
    kegiatan: "UI/UX Design Workshop",
    prodi: "Teknik Informatika",
    kategori: "Pelatihan",
    kategoriBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    tanggal: "15 Okt 2025",
    status: "Belum Diperiksa",
  },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-xs text-gray-800 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function KaryaPerBentukChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
        barCategoryGap="30%"
        barSize={22}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Progress Mahasiswa
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Monitor perkembangan mahasiswa dan validasi kegiatan.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/validasi")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-700 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Clock size={14} className="text-sky-600" />
              <span>7 perlu ditindaklanjuti</span>
            </button>
          </div>

          {/* STAT METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${card.bgGradient} rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90">
                  {card.icon}
                  <span>{card.label}</span>
                </div>
                <div className="text-4xl font-extrabold tracking-tight mt-3">
                  {card.value}
                </div>
                <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                  {card.watermarkIcon}
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prestasi per Tahun */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Prestasi per Tahun
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    Sebaran pengajuan menurut tingkat tiap tahun.
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={prestasiData} barCategoryGap="60%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} ticks={[0, 4, 8, 12, 16]} domain={[0, 16]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    formatter={(value) => <span className="text-gray-600 dark:text-slate-400 font-medium">{value}</span>}
                  />
                  <Bar dataKey="Internasional" stackId="a" fill="#0A2647" barSize={45} />
                  <Bar dataKey="Nasional" stackId="a" fill="#0B63C6" barSize={45} />
                  <Bar dataKey="Lokal" stackId="a" fill="#5097E1" radius={[4, 4, 0, 0]} barSize={45} />
                  <Bar dataKey="Tidak Terkategorisasi" stackId="a" fill="#cbd5e1" barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Karya per Bentuk */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Folder size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Karya per Bentuk
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    Sebaran karya mahasiswa menurut bentuknya.
                  </p>
                </div>
              </div>
              <KaryaPerBentukChart data={karyaPerBentukData} />
            </div>
          </div>

          {/* Kegiatan Tervalidasi per Minggu */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Kegiatan Tervalidasi per Minggu
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    Laju validasi delapan pekan terakhir.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 leading-none">
                  4
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                  total tervalidasi
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyValidasiData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ANTRIAN VALIDASI TERBARU TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Antrian Validasi Terbaru
              </h2>
              <button
                onClick={() => navigate("/admin/validasi")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                <span>Lihat semua</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Mahasiswa</th>
                    <th className="py-3 px-3">Kegiatan</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60 text-xs">
                  {antriValidasi.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 dark:text-slate-100">{row.nama}</div>
                        <div className="text-[11px] text-gray-400">{row.nim}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-gray-700 dark:text-slate-300 font-medium">{row.kegiatan}</div>
                        <div className="text-[11px] text-gray-400">{row.prodi}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${row.kategoriBg}`}>
                          {row.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-slate-400">{row.tanggal}</td>
                      <td className="py-3 px-3">
                        {row.status === "Ditangguhkan" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            <Clock size={11} /> {row.status}
                          </span>
                        ) : row.status === "Belum Diperiksa" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                            <Clock size={11} /> {row.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                            <CheckCircle2 size={11} /> {row.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}