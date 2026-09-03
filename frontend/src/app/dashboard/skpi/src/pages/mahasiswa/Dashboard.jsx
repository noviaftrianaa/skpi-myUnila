// src/pages/mahasiswa/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Lock,
  Download,
  BarChart2,
  Flame,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";
import { useLock } from "../../contexts/LockContext";

const statCards = [
  {
    label: "TOTAL KEGIATAN",
    value: 8,
    icon: <FileText size={16} />,
    bgGradient: "from-blue-600 to-blue-700",
    watermarkIcon: <FileText size={80} />,
  },
  {
    label: "TOTAL POIN SKPI",
    value: 68,
    icon: <Award size={16} />,
    bgGradient: "from-purple-600 to-fuchsia-600",
    watermarkIcon: <Award size={80} />,
  },
  {
    label: "DIVALIDASI",
    value: 4,
    icon: <CheckCircle2 size={16} />,
    bgGradient: "from-emerald-500 to-teal-600",
    watermarkIcon: <CheckCircle2 size={80} />,
  },
  {
    label: "MENUNGGU VALIDASI",
    value: 3,
    icon: <Clock size={16} />,
    bgGradient: "from-amber-500 to-orange-500",
    watermarkIcon: <Clock size={80} />,
  },
];

const prestasiPerTahunData = [
  { year: "2022", Internasional: 0, Nasional: 0, Lokal: 1, "Tidak Terkategorisasi": 0 },
  { year: "2025", Internasional: 2, Nasional: 3, Lokal: 2, "Tidak Terkategorisasi": 2 },
];

const jenisPrestasiList = [
  { label: "Internasional", count: 2, dotColor: "bg-[#0A2647]", textColor: "text-[#0A2647]" },
  { label: "Nasional", count: 3, dotColor: "bg-[#0B63C6]", textColor: "text-[#0B63C6]" },
  { label: "Lokal", count: 3, dotColor: "bg-[#5097E1]", textColor: "text-[#5097E1]" },
  { label: "Tidak Terkategorisasi", count: 2, dotColor: "bg-[#CBD5E1]", textColor: "text-[#64748B]" },
];

const kategoriDistributionData = [
  { name: "Lomba", value: 2, color: "#2563eb", percent: "20%" },
  { name: "Seminar", value: 2, color: "#8b5cf6", percent: "20%" },
  { name: "Karya", value: 2, color: "#ec4899", percent: "20%" },
  { name: "Pelatihan", value: 1, color: "#f59e0b", percent: "10%" },
  { name: "Organisasi", value: 1, color: "#10b981", percent: "10%" },
  { name: "Publikasi", value: 1, color: "#06b6d4", percent: "10%" },
  { name: "PKKMB Universitas", value: 1, color: "#64748b", percent: "10%" },
];

const aktivitasTerbaru = [
  {
    title: "International IoT Challenge",
    date: "25 Okt 2025",
    badges: ["Lomba", "Internasional"],
    status: "Belum Diperiksa",
  },
  {
    title: "Regional Line Follower Competition",
    date: "25 Okt 2025",
    badges: ["Lomba", "Regional"],
    status: "Ditangguhkan",
  },
  {
    title: "Pelatihan UI/UX Design",
    date: "20 Okt 2025",
    badges: ["Pelatihan", "Nasional"],
    status: "Divalidasi",
  },
  {
    title: "National Hackathon 2025",
    date: "15 Okt 2025",
    badges: ["Lomba", "Nasional"],
    status: "Ditangguhkan",
  },
  {
    title: "Leadership Training Seminar",
    date: "10 Okt 2025",
    badges: ["Seminar", "Fakultas"],
    status: "Divalidasi",
  },
];

export default function DashboardMahasiswa() {
  const navigate = useNavigate();
  const { isLocked } = useLock();
  const [showDraftModal, setShowDraftModal] = useState(false);

  const totalScore = 68;

  // Sistem predikat berbasis SKP
  const PREDIKAT_LEVELS = [
    { label: "Cukup",      min: 25,  max: 75,  color: "#f59e0b", bgColor: "#fef3c7", darkBg: "#451a03" },
    { label: "Baik",       min: 76,  max: 150, color: "#10b981", bgColor: "#d1fae5", darkBg: "#022c22" },
    { label: "Sangat Baik",min: 151, max: 225, color: "#3b82f6", bgColor: "#dbeafe", darkBg: "#1e3a5f" },
    { label: "Unggul",     min: 226, max: null, color: "#8b5cf6", bgColor: "#ede9fe", darkBg: "#2e1065" },
  ];
  const MAX_DISPLAY = 225; // titik penuh progress bar = 225 SKP (target Sangat Baik)
  const UNGGUL_TARGET = 226;

  const getCurrentPredikat = (score) => {
    if (score < 25)  return { label: "Belum Memenuhi", color: "#94a3b8", next: PREDIKAT_LEVELS[0] };
    if (score <= 75) return { ...PREDIKAT_LEVELS[0], next: PREDIKAT_LEVELS[1] };
    if (score <= 150) return { ...PREDIKAT_LEVELS[1], next: PREDIKAT_LEVELS[2] };
    if (score <= 225) return { ...PREDIKAT_LEVELS[2], next: PREDIKAT_LEVELS[3] };
    return { ...PREDIKAT_LEVELS[3], next: null };
  };

  const currentPredikat = getCurrentPredikat(totalScore);
  // Progress bar ditampilkan relatif ke next milestone
  const progressToNext = currentPredikat.next
    ? Math.round(((totalScore - (currentPredikat.min ?? 0)) / ((currentPredikat.next.min - 1) - (currentPredikat.min ?? 0))) * 100)
    : 100;
  const skpToNext = currentPredikat.next ? (currentPredikat.next.min - totalScore) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* GREETING HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                Halo, NOVIA 👋
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Rekam perjalanan prestasi dan pengembangan dirimu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <span>🪪 2215061024</span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <span>Program Studi S1 Teknik Informatika (S1)</span>
              </div>
              {!isLocked && (
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Unduh Transkrip</span>
                </button>
              )}
            </div>
          </div>

          {/* LOCKED SKPI BANNER (EXACT MATCH SCREENSHOT 1) */}
          {isLocked && (
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E02424] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E02424] dark:text-rose-300">
                    Transkrip SKPI telah dikunci (final)
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-0.5">
                    Transkrip final SKPI Anda sudah diterbitkan program studi dan siap diunduh. Kegiatan tidak dapat ditambah atau diubah lagi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/cetak-skpi")}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E02424] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Unduh Transkrip</span>
              </button>
            </div>
          )}

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

          {/* MIDDLE ROW: Prestasi per Tahun + Jenis Prestasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prestasi per Tahun Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Prestasi per Tahun
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    Sebaran kegiatan menurut tingkat tiap tahun.
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={prestasiPerTahunData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} ticks={[0, 3, 6, 9, 12]} domain={[0, 12]} />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    formatter={(value) => <span className="text-gray-600 dark:text-slate-400">{value}</span>}
                  />
                  <Bar dataKey="Internasional" stackId="a" fill="#0A2647" barSize={36} />
                  <Bar dataKey="Nasional" stackId="a" fill="#0B63C6" barSize={36} />
                  <Bar dataKey="Lokal" stackId="a" fill="#5097E1" barSize={36} />
                  <Bar dataKey="Tidak Terkategorisasi" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Jenis Prestasi List (1 Col - 2x2 GRID MATCHING IMAGE 1) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                      Jenis Prestasi
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {jenisPrestasiList.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-2xl font-bold mt-3 block ${item.textColor}`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LOWER MIDDLE ROW: Progress SKPI Score Gauge + Distribusi Kategori Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress SKPI Score Gauge */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Flame size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Progress SKPI
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    Pantau perkembangan poin SKPI-mu.
                  </p>
                </div>
              </div>

              {/* Score Circular Indicator — berbasis SKP */}
              <div className="flex flex-col items-center justify-center my-4 w-full">

                {/* Lingkaran utama */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Track abu */}
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8"
                      className="text-gray-100 dark:text-slate-800" fill="transparent" />
                    {/* Arc progress ke milestone berikutnya */}
                    <circle
                      cx="50" cy="50" r="40"
                      stroke="#0B437D"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * Math.min(progressToNext, 100)) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-center leading-none px-2">
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">{totalScore}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">SKP</div>
                  </div>
                </div>

                {/* Badge predikat saat ini */}
                <div
                  className="mt-3 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                >
                  {currentPredikat.label}
                </div>

                {/* Segmented milestone bar */}
                <div className="w-full mt-4 px-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 mb-1">
                    <span>0</span>
                    <span>75</span>
                    <span>150</span>
                    <span>225+</span>
                  </div>
                  <div className="w-full flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                    {/* Cukup: 25–75 */}
                    <div className="h-full rounded-l-full" style={{ width: "33.3%", background: totalScore >= 25 ? "#0B437D" : "#e2e8f0", opacity: totalScore >= 25 ? 1 : 0.4 }} />
                    {/* Baik: 76–150 */}
                    <div className="h-full" style={{ width: "33.3%", background: totalScore >= 76 ? "#0B63C6" : "#e2e8f0", opacity: totalScore >= 76 ? 1 : 0.4 }} />
                    {/* Sangat Baik & Unggul: 151–225+ */}
                    <div className="h-full rounded-r-full" style={{ width: "33.4%", background: totalScore >= 151 ? "#5097E1" : "#e2e8f0", opacity: totalScore >= 151 ? 1 : 0.4 }} />
                  </div>
                  {/* Label di bawah segmen */}
                  <div className="flex text-[9px] text-gray-400 mt-0.5 px-0.5">
                    <span style={{ width: "33.3%", color: totalScore >= 25 ? "#0B437D" : undefined }}>Cukup</span>
                    <span style={{ width: "33.3%", color: totalScore >= 76 ? "#0B63C6" : undefined }}>Baik</span>
                    <span style={{ width: "33.4%", color: totalScore >= 151 ? "#5097E1" : undefined }}>Sangat Baik / Unggul</span>
                  </div>
                </div>

                {/* Info ke predikat berikutnya */}
                {currentPredikat.next ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-3">
                    Butuh <span className="font-bold text-gray-900 dark:text-slate-100">{skpToNext} SKP lagi</span> untuk mencapai{" "}
                    <span className="font-bold text-gray-900 dark:text-slate-100">{currentPredikat.next.label}</span>
                  </p>
                ) : (
                  <p className="text-xs text-center mt-3 font-bold text-blue-700 dark:text-blue-300">
                    Predikat Unggul tercapai!
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate("/tambah-kegiatan")}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16} />
                <span>Tambah Kegiatan</span>
              </button>
            </div>

            {/* Distribusi Kategori Donut Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Distribusi Kategori
                  </h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={kategoriDistributionData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {kategoriDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-1.5 text-xs w-full">
                  {kategoriDistributionData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 dark:text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-slate-100">{item.value}</span>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{item.percent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Aktivitas Terbaru */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Aktivitas Terbaru
              </h2>
              <button
                onClick={() => navigate("/pengajuan")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                <span>Lihat semua</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {aktivitasTerbaru.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-gray-400">{item.date}</span>
                      {item.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {item.status === "Divalidasi" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                        <CheckCircle2 size={13} /> Divalidasi
                      </span>
                    ) : item.status === "Ditangguhkan" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                        <Clock size={13} /> Ditangguhkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <Clock size={13} /> Belum Diperiksa
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL TRANSKRIP BELUM FINAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center space-y-4 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center mx-auto">
              <Lock size={26} className="text-[#FF9900]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Transkrip Belum Final
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                SKPI Anda masih dalam status draf dan belum dikunci oleh Program Studi. Anda belum dapat mengunduh transkrip final.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDraftModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}