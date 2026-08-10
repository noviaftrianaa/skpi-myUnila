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
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Activity,
  BarChart2,
  Folder,
  X,
} from "lucide-react";
import SidebarAdmin from "../../components/common/SidebarAdmin";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const statCards = [
  {
    label: "TOTAL PENGAJUAN",
    value: 14,
    icon: <FileText size={16} />,
    bgGradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    watermarkIcon: <FileText size={80} />,
  },
  {
    label: "BELUM DIPERIKSA",
    value: 5,
    icon: <Clock size={16} />,
    bgGradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    watermarkIcon: <Clock size={80} />,
  },
  {
    label: "DITANGGUHKAN",
    value: 2,
    icon: <Clock size={16} />,
    bgGradient: "linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)",
    watermarkIcon: <Clock size={80} />,
  },
  {
    label: "DIVALIDASI",
    value: 6,
    icon: <CheckCircle size={16} />,
    bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    watermarkIcon: <CheckCircle size={80} />,
  },
];

// Hanya tampilkan 2025 sesuai screenshot
const prestasiData = [
  { year: "2025", Internasional: 1, Nasional: 8, Lokal: 5, "Tidak Terkategorisasi": 2 },
];

const karyaPerBentukData = [
  { name: "Aplikasi / Software", value: 1 },
  { name: "Karya Seni / Desain", value: 1 },
];

const weeklyValidasiData = [
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
    kategoriBg: "#FEF3C7",
    kategoriColor: "#D97706",
    tanggal: "25 Okt 2025",
    status: "Ditangguhkan",
  },
  {
    nama: "Siti Nurhaliza",
    nim: "202110002",
    kegiatan: "Regional Line Follower Competition",
    prodi: "Manajemen Informatika",
    kategori: "Lomba",
    kategoriBg: "#E0F2FE",
    kategoriColor: "#0284C7",
    tanggal: "25 Okt 2025",
    status: "Belum Diperiksa",
  },
  {
    nama: "Ahmad Rizki",
    nim: "202110015",
    kegiatan: "Leadership Summit 2025",
    prodi: "Teknik Sipil",
    kategori: "Seminar",
    kategoriBg: "#F3E8FF",
    kategoriColor: "#7C3AED",
    tanggal: "24 Okt 2025",
    status: "Divalidasi",
  },
  {
    nama: "Budi Santoso",
    nim: "202110033",
    kegiatan: "Student Union President",
    prodi: "Ilmu Hukum",
    kategori: "Organisasi",
    kategoriBg: "#DCFCE7",
    kategoriColor: "#16A34A",
    tanggal: "23 Okt 2025",
    status: "Divalidasi",
  },
];

// ─────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 8, padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}>
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
// KARYA PER BENTUK — horizontal bar custom
// ─────────────────────────────────────────────────────────────
function KaryaPerBentuk({ data }) {
  const maxVal = 4;
  const ticks = [0, 1, 2, 3, 4];
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#64748B", width: 150, textAlign: "right", flexShrink: 0 }}>
              {item.name}
            </span>
            <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 4, height: 16, position: "relative", overflow: "hidden" }}>
              <div style={{
                width: `${(item.value / maxVal) * 100}%`,
                height: "100%",
                background: i === 0 ? "#0B3D70" : "#1565C0",
                borderRadius: 4,
              }} />
            </div>
          </div>
        ))}
      </div>
      {/* X-axis ticks */}
      <div style={{ display: "flex", paddingLeft: 162, marginTop: 10 }}>
        {ticks.map((n) => (
          <span key={n} style={{ flex: 1, fontSize: 11, color: "#94A3B8", textAlign: "left" }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? antriValidasi : antriValidasi.slice(0, 3);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      <SidebarAdmin />

      <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>Progress Mahasiswa</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
              Monitor perkembangan mahasiswa dan validasi kegiatan.
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 20, padding: "6px 14px", fontSize: 12,
            fontWeight: 600, color: "#F97316", cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <Clock size={13} color="#F97316" />
            7 perlu ditindaklanjuti
          </button>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 22 }}>
          {statCards.map((card, i) => (
            <div
              key={i}
              style={{
                background: card.bgGradient,
                borderRadius: 16, padding: "18px 20px",
                color: "#fff", position: "relative", overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                transition: "transform 0.2s, box-shadow 0.2s",
                minHeight: 110, display: "flex", flexDirection: "column",
                justifyContent: "space-between", cursor: "default",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.16)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", opacity: 0.9 }}>
                {card.icon}<span>{card.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, letterSpacing: "-1px" }}>{card.value}</div>
              <div style={{ position: "absolute", right: -8, top: -8, opacity: 0.15, pointerEvents: "none" }}>{card.watermarkIcon}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW — Prestasi per Tahun + Karya per Bentuk */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Prestasi per Tahun — stacked bar */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BarChart2 size={18} color="#2563EB" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>Prestasi per Tahun</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>Sebaran pengajuan menurut tingkat tiap tahun.</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={prestasiData} barCategoryGap="60%">
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} ticks={[0, 4, 8, 12, 16]} domain={[0, 16]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(value) => <span style={{ color: "#64748B" }}>{value}</span>}
                />
                <Bar dataKey="Internasional" stackId="a" fill="#0B3D70" barSize={60} />
                <Bar dataKey="Nasional" stackId="a" fill="#1565C0" barSize={60} />
                <Bar dataKey="Lokal" stackId="a" fill="#64B5F6" barSize={60} />
                <Bar dataKey="Tidak Terkategorisasi" stackId="a" fill="#CFE8FA" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Karya per Bentuk */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Folder size={18} color="#2563EB" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>Karya per Bentuk</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>Sebaran karya mahasiswa menurut bentuknya.</p>
              </div>
            </div>
            <KaryaPerBentuk data={karyaPerBentukData} />
          </div>
        </div>

        {/* Kegiatan Tervalidasi per Minggu — Area chart */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Activity size={18} color="#2563EB" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>Kegiatan Tervalidasi per Minggu</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>Laju validasi delapan pekan terakhir.</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1 }}>4</p>
              <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>total tervalidasi</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyValidasiData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ r: 4, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#2563EB" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ANTRIAN VALIDASI TERBARU */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>Antrian Validasi Terbaru</h2>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#2563EB", fontWeight: 500 }}
            >
              {showAll ? "Tampilkan lebih sedikit" : "Lihat semua →"}
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                {["MAHASISWA", "KEGIATAN", "KATEGORI", "TANGGAL", "STATUS"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: 10, fontWeight: 700,
                    color: "#94A3B8", padding: "8px 12px",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < displayed.length - 1 ? "1px solid #F8FAFC" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 12px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>{row.nama}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "1px 0 0" }}>{row.nim}</p>
                  </td>
                  <td style={{ padding: "13px 12px" }}>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{row.kegiatan}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "1px 0 0" }}>{row.prodi}</p>
                  </td>
                  <td style={{ padding: "13px 12px" }}>
                    <span style={{
                      background: row.kategoriBg, color: row.kategoriColor,
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{row.kategori}</span>
                  </td>
                  <td style={{ padding: "13px 12px", fontSize: 12, color: "#64748B" }}>{row.tanggal}</td>
                  <td style={{ padding: "13px 12px" }}>
                    {row.status === "Divalidasi" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F0FDF4", color: "#16A34A", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        <CheckCircle size={12} /> {row.status}
                      </span>
                    ) : row.status === "Ditangguhkan" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFF7ED", color: "#EA580C", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        <Clock size={12} /> {row.status}
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F1F5F9", color: "#475569", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        <Eye size={12} /> {row.status}
                      </span>
                    )}
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