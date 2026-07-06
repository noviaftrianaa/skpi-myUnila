// src/pages/admin/DashboardAdmin.jsx
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Users, FileText, CheckCircle, Clock, Eye, Search, Calendar, X } from "lucide-react";
import SidebarAdmin from "../../components/common/SidebarAdmin";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const statCards = [
  {
    label: "Total Mahasiswa",
    value: 120,
    icon: <Users size={20} />,
    iconBg: "linear-gradient(180deg, #1E3A8A 0%, #0EA5E9 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Pengajuan Kegiatan",
    value: 472,
    icon: <FileText size={20} />,
    iconBg: "linear-gradient(180deg, #0EA5E9 0%, #38BDF8 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Kegiatan Divalidasi",
    value: 310,
    icon: <CheckCircle size={20} />,
    iconBg: "linear-gradient(180deg, #22C55E 0%, #4ADE80 100%)",
    iconColor: "#FFFFFF",
  },
  {
    label: "Kegiatan Ditangguhkan",
    value: 78,
    icon: <Clock size={20} />,
    iconBg: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)",
    iconColor: "#FFFFFF",
  },
];

const prestasiData = [
  { year: "2022", Internasional: 25, Nasional: 55, Lokal: 30, "Tidak Terkategorisasi": 10 },
  { year: "2023", Internasional: 10, Nasional: 40, Lokal: 25, "Tidak Terkategorisasi": 8 },
  { year: "2024", Internasional: 45, Nasional: 90, Lokal: 40, "Tidak Terkategorisasi": 20 },
  { year: "2025", Internasional: 30, Nasional: 65, Lokal: 35, "Tidak Terkategorisasi": 15 },
];

const karyaData = [
  { name: "FT", karya: 120 },
  { name: "FK", karya: 105 },
  { name: "FH", karya: 95 },
  { name: "FP", karya: 88 },
  { name: "FEB", karya: 80 },
  { name: "FISIP", karya: 75 },
  { name: "FKIP", karya: 68 },
  { name: "FMIPA", karya: 60 },
];

const trendData = [
  { week: "Minggu 1", Ditangguhkan: 30, Divalidasi: 5 },
  { week: "Minggu 2", Ditangguhkan: 20, Divalidasi: 18 },
  { week: "Minggu 3", Ditangguhkan: 35, Divalidasi: 8 },
  { week: "Minggu 4", Ditangguhkan: 38, Divalidasi: 12 },
  { week: "Minggu 5", Ditangguhkan: 45, Divalidasi: 7 },
];

const pengajuanTerbaru = [
  {
    nama: "Ahmad Rizki",
    kegiatan: "National Coding Competition",
    kategori: "Lomba",
    kategoriBg: "#E0F2FE",
    kategoriColor: "#0EA5E9",
    kategoriBorder: "#BAE6FD",
    status: "Ditangguhkan",
    statusBg: "#FFF7ED",
    statusColor: "#EA580C",
    tanggal: "2025-10-25",
  },
  {
    nama: "Siti Nurhaliza",
    kegiatan: "Leadership Summit 2025",
    kategori: "Seminar",
    kategoriBg: "#F3E8FF",
    kategoriColor: "#6D28D9",
    kategoriBorder: "#D8B4FE",
    status: "Ditangguhkan",
    statusBg: "#FFF7ED",
    statusColor: "#EA580C",
    tanggal: "2025-10-25",
  },
  {
    nama: "Budi Santoso",
    kegiatan: "Student Union President",
    kategori: "Organisasi",
    kategoriBg: "#E6F4F4",
    kategoriColor: "#3AB8BA",
    kategoriBorder: "#99F6E4",
    status: "Divalidasi",
    statusBg: "#F0FDF4",
    statusColor: "#16A34A",
    tanggal: "2025-10-24",
  },
  {
    nama: "Dewi Lestari",
    kegiatan: "UI/UX Workshop",
    kategori: "Pelatihan",
    kategoriBg: "#FEF3C7",
    kategoriColor: "#F59E0B",
    kategoriBorder: "#FDE68A",
    status: "Divalidasi",
    statusBg: "#F0FDF4",
    statusColor: "#16A34A",
    tanggal: "2025-10-24",
  },
  {
    nama: "Eko Prasetyo",
    kegiatan: "Community Service Program",
    kategori: "Kepanitiaan",
    kategoriBg: "#DCFCE7",
    kategoriColor: "#10B981",
    kategoriBorder: "#BBF7D0",
    status: "Ditolak",
    statusBg: "#FEF2F2",
    statusColor: "#DC2626",
    tanggal: "2025-10-23",
  },
];

// ─────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// MODAL DETAIL PENGAJUAN
// ─────────────────────────────────────────────────────────────

function DetailPengajuanModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid #F1F5F9",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>Detail Pengajuan</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nama Mahasiswa</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{item.nama}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{item.tanggal}</p>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kegiatan</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{item.kegiatan}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kategori</p>
              <span style={{
                background: item.kategoriBg, color: item.kategoriColor,
                border: `1px solid ${item.kategoriBorder || "#FDE68A"}`,
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>{item.kategori}</span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
              <span style={{
                background: item.statusBg, color: item.statusColor,
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>{item.status}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#2563EB", color: "#fff", border: "none",
              padding: "8px 20px", borderRadius: 10, fontSize: 13,
              fontWeight: 500, cursor: "pointer",
            }}
          >Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  const [detailItem, setDetailItem] = useState(null);
  const [showAllPengajuan, setShowAllPengajuan] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Poppins', sans-serif" }}>
      <SidebarAdmin />

      {/* DETAIL MODAL */}
      {detailItem && <DetailPengajuanModal item={detailItem} onClose={() => setDetailItem(null)} />}

      <main style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }} className="pt-20 lg:pt-6 md:px-7">

        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          {/* Search - full width */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 8, padding: "8px 14px", width: "100%",
          }}>
            <Search size={16} color="#94A3B8" />
            <input
              placeholder="Cari Kegiatan atau Mahasiswa..."
              style={{ border: "none", outline: "none", fontSize: 13, color: "#64748B", background: "transparent", width: "100%" }}
            />
          </div>
        </div>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Progress Mahasiswa</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Monitor perkembangan mahasiswa dan validasi kegiatan.</p>
          </div>
        </div>

        {/* STAT CARDS */}
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

        {/* PRESTASI MAHASISWA */}
        <div style={{
          background: "#fff", borderRadius: 12,
          padding: "20px 24px", marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Prestasi Mahasiswa</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={prestasiData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Internasional" fill="#0B487E" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Nasional" fill="#0B5EA8" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Lokal" fill="#85CCF9" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Tidak Terkategorisasi" fill="#C4E4F9" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KARYA MAHASISWA */}
        <div style={{
          background: "#fff", borderRadius: 12,
          padding: "20px 24px", marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Karya Mahasiswa</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={karyaData}>
              <defs>
                <linearGradient id="karyaGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="karya" fill="url(#karyaGradAdmin)" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* JUMLAH KEGIATAN TERVALIDASI */}
        <div style={{
          background: "#fff", borderRadius: 12,
          padding: "20px 24px", marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Jumlah Kegiatan Tervalidasi</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="Ditangguhkan" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 5, fill: "#F59E0B" }} />
              <Line type="monotone" dataKey="Divalidasi" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 5, fill: "#06B6D4" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PENGAJUAN TERBARU */}
        <div style={{
          background: "#fff", borderRadius: 12,
          padding: "20px 24px", marginBottom: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0 }}>Pengajuan Terbaru</h2>
            <button 
              onClick={() => setShowAllPengajuan(!showAllPengajuan)}
              style={{ fontSize: 13, color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            >
              {showAllPengajuan ? "Lebih Sedikit" : "Tampilkan Semua"}
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                {["NAMA MAHASISWA", "KEGIATAN", "KATEGORI", "STATUS", "TANGGAL", "AKSI"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "8px 12px", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(showAllPengajuan ? pengajuanTerbaru : pengajuanTerbaru.slice(0, 3)).map((row, i) => (
                <tr key={i} style={{ borderBottom: i < pengajuanTerbaru.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <td style={{ padding: "12px 12px", fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{row.nama}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, color: "#475569" }}>{row.kegiatan}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      background: row.kategoriBg, color: row.kategoriColor,
                      border: `1px solid ${row.kategoriBorder || "#C7D2FE"}`,
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    }}>
                      {row.kategori}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {row.status === "Divalidasi" ? (
                        <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#E6F8F3] text-[#049D71] font-poppins">
                          <CheckCircle size={14} /> {row.status}
                        </span>
                      ) : row.status === "Ditangguhkan" ? (
                        <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#FFF5E6] text-[#F59E0B] font-poppins">
                          <Clock size={14} /> {row.status}
                        </span>
                      ) : row.status === "Ditolak" ? (
                        <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] font-poppins">
                          <X size={14} /> {row.status}
                        </span>
                      ) : (
                        <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600 font-poppins">
                          <Clock size={14} /> {row.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 13, color: "#64748B" }}>{row.tanggal}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <button
                      onClick={() => setDetailItem(row)}
                      style={{
                        background: "#EFF6FF", border: "none", borderRadius: 6,
                        padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                    >
                      <Eye size={14} color="#2563EB" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}