// src/pages/admin/DashboardAdmin.jsx

import SidebarAdmin from "../../components/common/SidebarAdmin";

import {
  Search,
  Bell,
  Filter,
  Users,
  FileText,
  CheckCircle,
  Clock3,
  Eye,
  TrendingUp,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ======================================================
// DATA
// ======================================================

const chartData = [
  { minggu: "Minggu 1", divalidasi: 45, ditangguhkan: 12 },
  { minggu: "Minggu 2", divalidasi: 52, ditangguhkan: 18 },
  { minggu: "Minggu 3", divalidasi: 61, ditangguhkan: 15 },
  { minggu: "Minggu 4", divalidasi: 58, ditangguhkan: 20 },
  { minggu: "Minggu 5", divalidasi: 70, ditangguhkan: 10 },
];

const pengajuanData = [
  {
    nama: "Ahmad Rizki",
    activity: "National Coding Competition",
    category: "Competition",
    status: "Pending",
    date: "2025-10-25",
  },
  {
    nama: "Siti Nurhaliza",
    activity: "Leadership Summit 2025",
    category: "Seminar",
    status: "Pending",
    date: "2025-10-25",
  },
  {
    nama: "Budi Santoso",
    activity: "Student Union President",
    category: "Organization",
    status: "Approved",
    date: "2025-10-24",
  },
  {
    nama: "Dewi Lestari",
    activity: "UI/UX Workshop",
    category: "Workshop",
    status: "Approved",
    date: "2025-10-24",
  },
  {
    nama: "Eko Prasetyo",
    activity: "Community Service Program",
    category: "Volunteering",
    status: "Rejected",
    date: "2025-10-23",
  },
];

// ======================================================
// STAT CARDS — mengikuti struktur statCards mahasiswa
// ======================================================

const statCards = [
  {
    label: "Total Mahasiswa",
    value: 120,
    icon: <Users size={20} />,
    iconBg: "linear-gradient(180deg, #0EA5E9, #0B5EA8)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Pengajuan",
    value: 472,
    icon: <FileText size={20} />,
    iconBg: "linear-gradient(180deg, #6D28D9, #3AB8BA)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Divalidasi",
    value: 310,
    icon: <CheckCircle size={20} />,
    iconBg: "linear-gradient(180deg, #10B981, #34D399)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Ditangguhkan",
    value: 78,
    icon: <Clock3 size={20} />,
    iconBg: "linear-gradient(180deg, #F59E0B, #FBBF24)",
    iconColor: "#FFFFFF",
  },
];

// ======================================================
// MAIN
// ======================================================

export default function DashboardAdmin() {
  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      {/* SIDEBAR */}
      <SidebarAdmin />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* TOPBAR */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full max-w-3xl">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari kegiatan atau mahasiswa..."
              className="bg-transparent outline-none w-full ml-3 text-sm"
            />
          </div>
          <div className="flex items-center gap-3 ml-5">
            <button className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
              <Filter size={18} />
            </button>
            <button className="relative w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* HEADER — sama persis dengan mahasiswa */}
        <div className="mb-7 mt-8">
          <h1 className="font-poppins font-bold text-[24px] leading-[36px] tracking-[0px] text-[#0F172A]">
            Halo, Admin!
          </h1>
          <p className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#94A3B8]">
            Monitor perkembangan mahasiswa dan validasi SKPI.
          </p>
        </div>

        {/* STAT CARDS — grid-cols-4, struktur identik */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#64748B]">
                  {card.label}
                </p>
                <p className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#0F172A]">
                  {card.value}
                </p>
              </div>
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

        {/* CHART STATISTIK VALIDASI
            Menggunakan dimensi identik dengan card LEFT mahasiswa (635.56px × 640px)
            diletakkan full-width agar proporsional */}
        <div
          className="mt-6 rounded-[14px] p-8"
          style={{
            height: "480px",
            background:
              "linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(11,94,168,0.05) 50%, rgba(167,243,208,0.05) 100%)",
            boxShadow:
              "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
          }}
        >
          {/* TITLE */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-poppins font-semibold text-[20px] leading-[30px] tracking-[0px] text-[#0F172A]">
                Statistik Validasi
              </h2>
              <p className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#64748B]">
                Pantau tren validasi dan pengajuan mahasiswa
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
              Last 30 Days
            </button>
          </div>

          {/* LINE CHART */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="minggu"
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
                <Line
                  type="monotone"
                  dataKey="ditangguhkan"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="divalidasi"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABEL PENGAJUAN TERBARU
            Menggunakan card putih + shadow sama dengan card "Aktivitas Terbaru" mahasiswa */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-poppins font-bold text-[20px] leading-[30px] text-[#0F172A]">
              Pengajuan Terbaru
            </h2>
            <button className="text-[13px] text-[#0B5EA8] font-medium hover:underline">
              Tampilkan Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[#64748B] text-[12px] font-semibold tracking-wide border-b border-[#F1F5F9]">
                  <th className="pb-4">NAMA</th>
                  <th className="pb-4">KEGIATAN</th>
                  <th className="pb-4">KATEGORI</th>
                  <th className="pb-4">STATUS</th>
                  <th className="pb-4">TANGGAL</th>
                  <th className="pb-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {pengajuanData.map((item, index) => (
                  <tr
                    key={index}
                    className={`text-sm ${
                      index !== pengajuanData.length - 1
                        ? "border-b border-[#F1F5F9]"
                        : ""
                    }`}
                  >
                    {/* NAMA */}
                    <td className="py-4">
                      <p className="font-semibold text-[14px] text-[#0F172A]">
                        {item.nama}
                      </p>
                    </td>

                    {/* KEGIATAN */}
                    <td className="py-4">
                      <p className="text-[14px] text-[#475569]">
                        {item.activity}
                      </p>
                    </td>

                    {/* KATEGORI */}
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs">
                        {item.category}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* TANGGAL */}
                    <td className="py-4">
                      <p className="text-[12px] text-[#94A3B8]">{item.date}</p>
                    </td>

                    {/* AKSI */}
                    <td className="py-4 text-center">
                      <button className="text-[#0B5EA8] hover:text-blue-800 transition">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BANNER INFO — identik dengan banner mahasiswa */}
        <div className="mt-5 bg-[#EFF6FF] rounded-2xl px-6 py-5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)",
            }}
          >
            <TrendingUp size={20} color="#FFFFFF" />
          </div>
          <div>
            <p
              className="font-poppins font-normal text-[18px] leading-[27px] tracking-[0px] text-[#0F172A]"
              style={{ width: "352px", height: "27px" }}
            >
              Validasi meningkat minggu ini!
            </p>
            <p
              className="mt-1 font-poppins font-normal text-[16px] leading-[24px] tracking-[0px] text-[#64748B]"
              style={{ width: "550px", height: "24px" }}
            >
              Pastikan semua pengajuan ditinjau sebelum tenggat waktu.
            </p>
          </div>
        </div>

        {/* SPACER BAWAH */}
        <div className="mb-10" />
      </main>
    </div>
  );
}