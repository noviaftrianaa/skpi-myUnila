// src/pages/mahasiswa/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Award,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
} from "lucide-react";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const statCards = [
  {
    label: "Total Diajukan",
    value: 28,
    icon: <Activity size={20} />,
    iconBg: "linear-gradient(180deg, #6D28D9 0%, #3AB8BA 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Divalidasi",
    value: 22,
    icon: <CheckCircle size={20} />,
    iconBg: "linear-gradient(180deg, #10B981 0%, #34D399 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Ditangguhkan",
    value: 4,
    icon: <Clock size={20} />,
    iconBg: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Ditolak",
    value: 2,
    icon: <XCircle size={20} />,
    iconBg: "linear-gradient(180deg, #EF4444 0%, #F87171 100%)",
    iconColor: "#FFFFFF",
  },
];

const jenisPrestasi = [
  { label: "Internasional", value: 7, color: "#1E3A8A" },
  { label: "Nasional", value: 11, color: "#1D4ED8" },
  { label: "Lokal", value: 4, color: "#60A5FA" },
  { label: "Tidak Terkategorisasi", value: 2, color: "#BFDBFE" },
];

const prestasiPertahun = [
  { year: "2026", Internasional: 25, Nasional: 55, Lokal: 30, "Tidak Terkategorisasi": 10 },
  { year: "2025", Internasional: 10, Nasional: 40, Lokal: 25, "Tidak Terkategorisasi": 8 },
  { year: "2024", Internasional: 45, Nasional: 90, Lokal: 40, "Tidak Terkategorisasi": 20 },
  { year: "2023", Internasional: 30, Nasional: 65, Lokal: 35, "Tidak Terkategorisasi": 15 },
];

const distribusiData = [
  { name: "Seminar", value: 30, color: "#6D28D9" },
  { name: "Lomba", value: 25, color: "#0EA5E9" },
  { name: "Organisasi", value: 20, color: "#3AB8BA" },
  { name: "Kepanitiaan", value: 15, color: "#10B981" },
  { name: "Lainnya", value: 10, color: "#F59E0B" },
];

const aktivitas = [
  {
    title: "Pelatihan UI/UX Design",
    date: "2025-10-20",
    tag: "Pelatihan",
    tagColor: "#F59E0B",
    tagBg: "#FEF3C7",
    tagBorder: "#FDE68A",
    status: "Divalidasi",
    statusColor: "#049D71",
    statusBg: "#E6F8F3",
    statusIcon: <CheckCircle size={13} />,
  },
  {
    title: "National Hackathon 2026",
    date: "2025-10-15",
    tag: "Lomba",
    tagColor: "#0EA5E9",
    tagBg: "#E0F2FE",
    tagBorder: "#BAE6FD",
    status: "Ditangguhkan",
    statusColor: "#F59E0B",
    statusBg: "#FFF5E6",
    statusIcon: <Clock size={13} />,
  },
  {
    title: "Leadership Training",
    date: "2025-10-10",
    tag: "Pelatihan",
    tagColor: "#F59E0B",
    tagBg: "#FEF3C7",
    tagBorder: "#FDE68A",
    status: "Divalidasi",
    statusColor: "#049D71",
    statusBg: "#E6F8F3",
    statusIcon: <CheckCircle size={13} />,
  },
  {
    title: "Himpunan Mahasiswa Teknik Elektro",
    date: "2025-09-01",
    tag: "Organisasi",
    tagColor: "#3AB8BA",
    tagBg: "#E6F4F4",
    tagBorder: "#99F6E4",
    status: "Divalidasi",
    statusColor: "#049D71",
    statusBg: "#E6F8F3",
    statusIcon: <CheckCircle size={13} />,
  },
  {
    title: "PKKMB UNIVERSITAS",
    date: "2022-08-15",
    tag: "PKKMB Universitas",
    tagColor: "#F59E0B",
    tagBg: "#FEF3C7",
    tagBorder: "#FDE68A",
    status: "Belum Diperiksa",
    statusColor: "#64748B",
    statusBg: "#F1F5F9",
    statusIcon: <Clock size={13} />,
  },
];

// ─────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────

function ProgressRing({ value, max }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progress = value / max;
  const strokeDasharray = `${progress * circumference} ${circumference}`;

  return (
    <svg width="180" height="180">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="14" />
      <circle
        cx="90" cy="90" r={radius} fill="none"
        stroke="url(#ringGrad)" strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        transform="rotate(-90 90 90)"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#073864" />
          <stop offset="100%" stopColor="#0B5EA8" />
        </linearGradient>
      </defs>
      <text x="90" y="87" textAnchor="middle" fill="#0F172A" fontSize="26" fontWeight="700" fontFamily="Poppins">
        {value}
      </text>
      <text x="90" y="107" textAnchor="middle" fill="#94A3B8" fontSize="12" fontFamily="Poppins">
        dari {max}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const isLocked = typeof window !== "undefined" ? localStorage.getItem("skpi_lock_2020021001") === "true" : false;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <SidebarMahasiswa />

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">

        {/* HEADER */}
        <div className="mb-7">
          <h1 className="font-poppins font-bold text-[24px] leading-[36px] text-[#0F172A]">
            Halo, Hanifa 👋
          </h1>
          <p className="mt-1 font-poppins font-normal text-[16px] leading-[24px] text-[#94A3B8]">
            Rekam perjalanan prestasi dan pengembangan dirimu
          </p>
        </div>

        {/* LOCKED SKPI BANNER */}
        {isLocked && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-200/30 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800 font-poppins">
                  Transkrip SKPI Telah Dikunci (Final)
                </p>
                <p className="text-xs text-gray-500 mt-1 font-poppins">
                  Transkrip final SKPI Anda telah diterbitkan oleh program studi dan siap untuk diunduh. Anda tidak dapat lagi menambah atau mengedit kegiatan.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/pengajuan")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] font-poppins"
            >
              Unduh Transkrip
            </button>
          </div>
        )}

        {/* STATUS SKPI - STAT CARDS */}
        <p className="font-poppins font-semibold text-[14px] text-[#64748B] mb-3 uppercase tracking-wide">
          Status SKPI
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-poppins font-normal text-[13px] text-[#64748B]">{card.label}</p>
                <p className="font-poppins font-bold text-[28px] text-[#0F172A]">{card.value}</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* JENIS PRESTASI */}
        <p className="font-poppins font-semibold text-[14px] text-[#64748B] mb-3 uppercase tracking-wide">
          Jenis Prestasi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {jenisPrestasi.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="font-poppins font-normal text-[13px] text-[#64748B] mb-1">{item.label}</p>
              <p
                className="font-poppins font-bold text-[28px]"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* PRESTASI PER TAHUN */}
        <div className="bg-white rounded-[14px] p-6 mb-6" style={{ boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A" }}>
          <h2 className="font-poppins font-semibold text-[16px] text-[#0F172A] mb-4">
            Prestasi Pertahun
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={prestasiPertahun} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Internasional" fill="#0B487E" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Nasional" fill="#0B5EA8" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Lokal" fill="#85CCF9" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Tidak Terkategorisasi" fill="#C4E4F9" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PROGRESS + DISTRIBUSI */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-6">

          {/* PROGRESS SKPI */}
          <div
            className="rounded-[14px] p-8"
            style={{
              background: "linear-gradient(135deg, rgba(109,40,217,0.05) 0%, rgba(58,184,186,0.05) 50%, rgba(167,243,208,0.05) 100%)",
              boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
            }}
          >
            <h2 className="font-poppins font-semibold text-[18px] text-[#0F172A]">Progress SKPI</h2>
            <p className="mt-1 font-poppins text-[14px] text-[#64748B]">
              Pantau perkembangan SKPI-mu secara real-time
            </p>

            {/* RING */}
            <div className="flex justify-center mt-8">
              <ProgressRing value={72} max={100} />
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-8">
              <div className="flex justify-between mb-2">
                <span className="font-poppins text-[13px] text-[#64748B]">Progress</span>
                <span className="font-poppins font-semibold text-[13px] text-[#0F172A]">72%</span>
              </div>
              <div className="overflow-hidden bg-[#E2E8F0] rounded-full" style={{ height: 8 }}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#073864] to-[#0B5EA8]"
                  style={{ width: "72%" }}
                />
              </div>
              <p className="text-center font-poppins text-[13px] text-[#64748B] mt-3">
                Skor mu mencapai{" "}
                <span className="font-semibold text-[#0F172A]">72 dari 100 SKPI poin</span>
              </p>
            </div>

            {/* BUTTON */}
            <button
              disabled={isLocked}
              onClick={() => navigate("/tambah-kegiatan")}
              className={`mt-6 w-full h-[48px] rounded-[8px] text-white font-poppins font-semibold text-[14px] transition-all duration-200 ${
                isLocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200"
                  : "bg-gradient-to-b from-[#073864] to-[#0B5EA8] hover:from-[#0B5EA8] hover:to-[#0E7490] hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {isLocked ? "🔒 SKPI Terkunci (Final)" : "Tambah Kegiatan"}
            </button>
          </div>

          {/* DISTRIBUSI KATEGORI SKPI */}
          <div
            className="bg-white rounded-[14px] p-6 flex flex-col"
            style={{ boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A" }}
          >
            <div className="flex items-center gap-2 mb-4">
              {/* Gradient icon sesuai screenshot */}
              <div style={{
                width: 28, height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1D4ED8" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="url(#trendGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16 7 22 7 22 13" stroke="url(#trendGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-poppins font-semibold text-[15px] text-[#0F172A]">
                Distribusi Kategori SKPI
              </p>
            </div>

            <div className="flex justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={distribusiData}
                  cx={100} cy={100}
                  innerRadius={60} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {distribusiData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {distribusiData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="font-poppins text-[13px] text-[#475569]">{item.name}</span>
                  </div>
                  <span className="font-poppins font-semibold text-[13px] text-[#0F172A]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BANNER */}
        <div className="bg-[#EFF6FF] rounded-2xl px-6 py-5 flex items-center gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
          >
            <Award size={20} color="#FFFFFF" />
          </div>
          <div>
            <p className="font-poppins font-normal text-[16px] text-[#0F172A]">
              Sedikit lagi, SKPI-mu hampir lengkap 🚀
            </p>
            <p className="mt-1 font-poppins font-normal text-[14px] text-[#64748B]">
              Pastikan seluruh data sudah benar sebelum pengajuan.
            </p>
          </div>
        </div>

        {/* AKTIVITAS TERBARU */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[#0F172A]">Aktivitas Terbaru</h2>
            {aktivitas.length > 3 && (
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-[13px] text-[#0B5EA8] font-medium hover:underline focus:outline-none"
              >
                {showAllActivities ? "Sembunyikan" : "Tampilkan Semua"}
              </button>
            )}
          </div>

          <div>
            {(showAllActivities ? aktivitas : aktivitas.slice(0, 3)).map((a, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-4 ${
                  i !== aktivitas.length - 1 ? "border-b border-[#F1F5F9]" : ""
                }`}
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-[#94A3B8]">{a.date}</span>
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-poppins font-normal text-[12px] border whitespace-nowrap"
                      style={{ color: a.tagColor, background: a.tagBg || "#EFF3FF", borderColor: a.tagBorder || "#C7D2FE" }}
                    >
                      {a.tag}
                    </span>
                  </div>
                </div>

                <div
                  className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full font-poppins font-medium text-[12px]"
                  style={{ color: a.statusColor, background: a.statusBg }}
                >
                  {a.statusIcon}
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}