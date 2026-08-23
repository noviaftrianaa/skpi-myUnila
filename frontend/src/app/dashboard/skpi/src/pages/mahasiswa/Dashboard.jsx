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
  Flame,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";

const statCards = [
  {
    label: "TOTAL KEGIATAN",
    value: 8,
    icon: <FileText size={16} />,
    watermark: <FileText size={96} className="absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none" />,
    bgGradient: "from-blue-600 via-blue-600 to-blue-500",
  },
  {
    label: "TOTAL POIN SKPI",
    value: 68,
    subtitle: "Target 100 poin",
    icon: <Award size={16} />,
    watermark: <Award size={96} className="absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none" />,
    bgGradient: "from-purple-600 via-purple-600 to-fuchsia-600",
  },
  {
    label: "DIVALIDASI",
    value: 4,
    icon: <CheckCircle2 size={16} />,
    watermark: <CheckCircle2 size={96} className="absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none" />,
    bgGradient: "from-emerald-500 via-emerald-600 to-teal-600",
  },
  {
    label: "MENUNGGU VALIDASI",
    value: 3,
    icon: <Clock size={16} />,
    watermark: <Clock size={96} className="absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none" />,
    bgGradient: "from-amber-500 via-amber-600 to-orange-500",
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
    title: "Desain UI/UX Aplikasi Akademik MyUnila",
    date: "20 Nov 2025",
    badges: ["Karya", "Karya Seni / Desain"],
    status: "Divalidasi",
  },
  {
    title: "International Robotics Competition 2025",
    date: "08 Nov 2025",
    badges: ["Lomba", "Internasional"],
    status: "Belum Diperiksa",
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
  const [isLocked, setIsLocked] = useState(false);

  const totalScore = 68;
  const targetScore = 100;
  const scorePercent = Math.round((totalScore / targetScore) * 100);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* LOCKED SKPI BANNER (if transcript is locked) */}
          {isLocked && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Transkrip SKPI Telah Dikunci (Final)
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Transkrip final SKPI Anda telah diterbitkan oleh program studi dan siap untuk diunduh. Anda tidak dapat lagi menambah atau mengedit kegiatan.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/cetak-skpi")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                <Download size={14} />
                <span>Unduh Transkrip</span>
              </button>
            </div>
          )}

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

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs self-start sm:self-auto">
              <span>🪪 2215061024</span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <span>Program Studi S1 Teknik Informatika (S1)</span>
            </div>
          </div>

          {/* 4 METRIC STAT CARDS (EXACT MATCH USER ATTACHMENT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${card.bgGradient} rounded-3xl p-6 sm:p-7 text-white shadow-xs relative overflow-hidden flex flex-col justify-between`}
              >
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-90 uppercase">
                  {card.icon}
                  <span>{card.label}</span>
                </div>
                <div className="mt-3">
                  <div className="text-4xl sm:text-5xl font-extrabold">{card.value}</div>
                  {card.subtitle && (
                    <div className="text-xs opacity-80 mt-1">{card.subtitle}</div>
                  )}
                </div>
                {card.watermark}
              </div>
            ))}
          </div>

          {/* MIDDLE ROW: Prestasi per Tahun + Jenis Prestasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prestasi per Tahun Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <TrendingUp size={18} />
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
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
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

              {/* Score Circular Indicator */}
              <div className="flex flex-col items-center justify-center my-4 w-full">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-slate-800" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0B437D"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * scorePercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-center leading-none">
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">{totalScore}</div>
                    <div className="text-xs text-gray-400 mt-1">dari {targetScore}</div>
                  </div>
                </div>

                <div className="w-full mt-4 space-y-1.5 px-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{scorePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B437D] rounded-full transition-all duration-500" style={{ width: `${scorePercent}%` }} />
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-3">
                  Skormu mencapai <span className="font-bold text-gray-900 dark:text-slate-100">{totalScore} dari {targetScore} poin SKPI</span>
                </p>
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
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <PieIcon size={18} />
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
    </div>
  );
}