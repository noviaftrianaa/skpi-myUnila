// src/pages/mahasiswa/Dashboard.jsx

import {
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from "lucide-react";

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
import { useNavigate } from "react-router-dom";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const statCards = [
  {
   label: "Total Diajukan",
value: 28,
icon: <Activity size={20} />,
iconBg: "linear-gradient(180deg, #6D28D9, #3AB8BA)",
iconColor: "#FFFFFF",
  },
  {
    label: "Divalidasi",
    value: 22,
    icon: <CheckCircle size={20} />,
    iconBg: "linear-gradient(180deg, #10B981, #34D399)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Ditangguhkan",
    value: 4,
    icon: <Clock size={20} />,
    iconBg: "linear-gradient(180deg, #F59E0B, #FBBF24)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Ditolak",
    value: 2,
    icon: <XCircle size={20} />,
    iconBg: "linear-gradient(180deg, #EF4444, #F87171)",
    iconColor: "#FFFFFF",
  },
];

const distribusiData = [
  { name: "Seminar", value: 30, color: "#7C3AED" },
  { name: "Lomba", value: 25, color: "#3AB8BA" },
  { name: "Organisasi", value: 20, color: "#A7F3D0" },
  { name: "Kepanitiaan", value: 15, color: "#10B981" },
  { name: "Pelatihan", value: 18, color: "#2563EB" },
  { name: "Publikasi", value: 10, color: "#F59E0B" },
];

const aktivitas = [
  {
    title: "Pelatihan UI/UX Design",
    date: "2025-10-20",
    tag: "Pelatihan",
    tagColor: "#0B5EA8",
    status: "Divalidasi",
    statusColor: "#10B981",
    statusBg: " #10B9811A",
    statusIcon: <CheckCircle size={13} />,
  },
  {
    title: "National Hackathon 2026",
    date: "2025-10-15",
    tag: "Lomba",
    tagColor: "#0B5EA8 ",
    status: "Ditangguhkan",
    statusColor: " #F59E0B",
    statusBg: " #F59E0B1A",
    statusIcon: <Clock size={13} />,
  },
  {
    title: "Leadership Training",
    date: "2025-10-10",
    tag: "Pelatihan",
    tagColor: "#0B5EA8",
    status: "Divalidasi",
    statusColor: "#10B981",
    statusBg: " #10B9811A",
    statusIcon: <CheckCircle size={13} />,
  },
  {
    title: "Himpunan Mahasiswa Teknik Elektro",
    date: "2025-09-01",
    tag: "Organisasi",
    tagColor: "#0B5EA8",
    status: "Divalidasi",
    statusColor: "#10B981",
    statusBg: " #10B9811A",
    statusIcon: <CheckCircle size={13} />,
  },
];

const prestasiData = [
  { name: "FT", akademik: 450, nonAkademik: 460 },
  { name: "FK", akademik: 330, nonAkademik: 320 },
  { name: "FISIP", akademik: 300, nonAkademik: 460 },
  { name: "FEB", akademik: 410, nonAkademik: 290 },
  { name: "FH", akademik: 180, nonAkademik: 450 },
];

const karyaData = [
  { name: "FT", karya: 120 },
  { name: "FK", karya: 100 },
  { name: "FISIP", karya: 85 },
  { name: "FEB", karya: 75 },
  { name: "FH", karya: 65 },
];

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────

function DonutChart() {
  return (
    <div className="flex flex-col h-full">
      <p className="font-bold text-[15px] text-[#0F172A] mb-3">
        Distribusi Kategori
      </p>

      <div className="flex justify-center">
        <PieChart width={170} height={170}>
          <Pie
            data={distribusiData}
            cx={85}
            cy={85}
            innerRadius={52}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {distribusiData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        {distribusiData.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-[13px] text-[#475569]">
                {item.name}
              </span>
            </div>

            <span className="text-[13px] font-semibold text-[#0F172A]">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="14"
      />

      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="#0B4D94"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        transform="rotate(-90 90 90)"
      />

      <text
        x="90"
        y="84"
        textAnchor="middle"
        className="fill-[#0F172A] text-[28px] font-bold"
      >
        {value}
      </text>

      <text
        x="90"
        y="104"
        textAnchor="middle"
        className="fill-[#94A3B8] text-[12px]"
      >
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
   return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <SidebarMahasiswa />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-7">
          <h1 className="font-poppins font-bold text-[24px] leading-[36px] tracking-[0px] text-[#0F172A]">
  Halo, Novia!
</h1>

<p className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#94A3B8]">
  Rekam perjalanan prestasi dan pengembangan dirimu
</p>
        </div>

       {/* STAT */}
<div className="grid grid-cols-4 gap-4">
  {statCards.map((card, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
    >
      {/* TEXT */}
<div>
  <p className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#64748B]">
    {card.label}
  </p>

  <p className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#0F172A]">
    {card.value}
  </p>
</div>

      {/* ICON */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: card.iconBg,
          color: card.iconColor,
        }}
      >
        {card.icon}
      </div>
    </div>
  ))}
</div>

        {/* PROGRESS */}
<div className="grid grid-cols-[635px_306px] gap-5 mt-6">
  
  {/* LEFT */}
{/* LEFT */}
<div
  className="rounded-[14px] p-8"
  style={{
    width: "635.56px",
    height: "640px",
    background:
      "linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(58, 184, 186, 0.05) 50%, rgba(167, 243, 208, 0.05) 100%)",
    boxShadow:
      "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
  }}
>
  {/* TITLE */}
  <h2 className="font-poppins font-semibold text-[20px] leading-[30px] tracking-[0px] text-[#0F172A]">
    Progress SKPI
  </h2>

  {/* SUBTITLE */}
  <p className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#64748B]">
    Pantau perkembangan SKPI-mu secara real-time
  </p>

  {/* PROGRESS RING */}
  <div className="flex justify-center mt-15">
    <div
      style={{
        width: "192px",
        height: "192px",
      }}
    >
      <ProgressRing value={72} max={100} />
    </div>
  </div>

{/* PROGRESS BAR */}
<div
  className="mt-10 flex flex-col"
  style={{
    width: "571.56px",
    height: "125px",
    gap: "25px",
  }}
>
  {/* HEADER */}
  <div className="flex justify-between">
    <span className="font-poppins text-[14px] text-[#64748B]">
      Progress
    </span>

    <span className="font-poppins font-semibold text-[14px] text-[#0F172A]">
      72%
    </span>
  </div>

  {/* BAR */}
  <div
    className="overflow-hidden bg-[#E2E8F0]"
    style={{
      width: "571.56px",
      height: "8px",
      borderRadius: "29826200px",
    }}
  >
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#0B4D94]"
      style={{
        width: "72%",
      }}
    />
  </div>

  {/* TEXT */}
  <p className="text-center font-poppins text-[14px] leading-[21px] text-[#64748B]">
    Skor mu mencapai{" "}
    <span className="font-semibold text-[#0F172A]">
      72 dari 100 SKPI poin
    </span>
  </p>
</div>
  {/* BUTTON */}
  <button
  onClick={() => navigate("/tambah-kegiatan")}
  className="
    mt-8
    w-full
    h-[48px]
    rounded-[8px]
    text-white
    font-poppins
    font-semibold
    text-[14px]
    transition-all
    duration-200
    bg-gradient-to-b
    from-[#073864]
    to-[#0B5EA8]
    hover:from-[#0B5EA8]
    hover:to-[#0E7490]
    hover:shadow-lg
    active:scale-[0.98]
  "
>
  Tambah Kegiatan
</button>
</div>
  {/* RIGHT */}
  <div
    className="bg-white rounded-[14px] p-7 flex flex-col"
    style={{
      width: "415.78px",
      height: "640px",
      boxShadow:
        "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
    }}
  >
    <p className="font-poppins font-bold text-[20px] leading-[30px] text-[#0F172A] mb-6">
      Distribusi Kategori
    </p>

    <div className="flex justify-center">
      <PieChart width={220} height={220}>
        <Pie
          data={distribusiData}
          cx={110}
          cy={110}
          innerRadius={65}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {distribusiData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </div>

    <div className="flex flex-col gap-4 mt-8">
      {distribusiData.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: item.color }}
            />

            <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#475569]">
              {item.name}
            </span>
          </div>

          <span className="font-poppins font-semibold text-[14px] leading-[21px] text-[#0F172A]">
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  </div>

</div>
        {/* BANNER */}
       <div className="mt-5 bg-[#EFF6FF] rounded-2xl px-6 py-5 flex items-center gap-4">
  {/* ICON */}
  <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{
      background:
        "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)",
    }}
  >
    <Award size={20} color="#FFFFFF" />
  </div>

  {/* TEXT */}
  <div>
   <p
  className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#0F172A]"
  style={{
    width: "352px",
    height: "27px",
  }}
>
  Sedikit lagi, SKPI-mu hampir lengkap 
</p>

 <p
  className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#64748B]"
  style={{
    width: "450px",
    height: "24px",
  }}
>
  Pastikan seluruh data sudah benar sebelum pengajuan.
</p>
  </div>
</div>
        {/* AKTIVITAS */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[#0F172A]">
              Aktivitas Terbaru
            </h2>

            <button className="text-[13px] text-[#0B5EA8] font-medium hover:underline">
              Tampilkan Semua
            </button>
          </div>

          <div>
            {aktivitas.map((a, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-4 ${
                  i !== aktivitas.length - 1
                    ? "border-b border-[#F1F5F9]"
                    : ""
                }`}
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">
                    {a.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-[#94A3B8]">
                      {a.date}
                    </span>

                    <span
  className="flex items-center gap-1.5 px-3 py-1 rounded-full font-poppins font-normal text-[12px] leading-[18px]"
  style={{
    color: a.tagColor,
  }}
>
  {a.tag}
</span>
                  </div>
                </div>

                <div
  className="flex items-center gap-1.5 px-3 py-1 rounded-full font-poppins font-normal text-[12px] leading-[18px]"
  style={{
    color: a.statusColor,
    background: a.statusBg,
  }}
>
  {a.statusIcon}
  {a.status}
</div>
              </div>
            ))}
          </div>
        </div>

{/* PRESTASI */}
<div
  className="mt-6 bg-white p-6"
  style={{
    width: "1070.33px",
    height: "473px",
    borderRadius: "14px",
    background: "#FFFFFF",
    boxShadow:
      "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
  }}
>
  {/* TITLE */}
  <h2 className="font-poppins font-bold text-[20px] leading-[30px] text-[#0F172A] mb-6">
    Prestasi Mahasiswa
  </h2>

  {/* CHART */}
  <ResponsiveContainer width="100%" height={340}>
    <BarChart data={prestasiData}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#F1F5F9"
        vertical={false}
      />

      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: "#64748B",
          fontSize: 14,
          fontFamily: "Poppins",
        }}
      />

      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{
          fill: "#64748B",
          fontSize: 14,
          fontFamily: "Poppins",
        }}
      />

      <Tooltip />

      <Legend
        wrapperStyle={{
          fontFamily: "Poppins",
          fontSize: "14px",
          color: "#0F172A",
        }}
      />
     {/* NON AKADEMIK */}
      <Bar
        dataKey="nonAkademik"
        fill="#0EA5E9"
        radius={[12, 12, 0, 0]}
        barSize={55}
      />
      {/* AKADEMIK */}
      <Bar
        dataKey="akademik"
        fill="#22C55E"
        radius={[12, 12, 0, 0]}
        barSize={55}
      />

    </BarChart>
  </ResponsiveContainer>
</div>

{/* KARYA */}
<div
  className="mt-6 bg-white p-6 mb-10"
  style={{
    width: "1070.33px",
    height: "423px",
    borderRadius: "14px",
    boxShadow:
      "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
  }}
>
  {/* TITLE */}
  <h2 className="font-poppins font-bold text-[20px] leading-[30px] text-[#0F172A] mb-6">
    Karya Mahasiswa
  </h2>

  {/* CHART */}
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={karyaData}>

      {/* GRADIENT */}
      <defs>
        <linearGradient
          id="karyaGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      {/* GRID */}
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#F1F5F9"
        vertical={false}
      />

      {/* X AXIS */}
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: "#64748B",
          fontSize: 14,
        }}
      />

      {/* Y AXIS */}
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{
          fill: "#64748B",
          fontSize: 14,
        }}
      />

      {/* TOOLTIP */}
      <Tooltip />

      {/* BAR */}
      <Bar
        dataKey="karya"
        fill="url(#karyaGradient)"
        radius={[8, 8, 0, 0]}
        barSize={135}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
      </main>
    </div>
  );
}