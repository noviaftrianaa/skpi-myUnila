// src/pages/mahasiswa/Pengajuan.jsx
import { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, Pencil, Trash2,
  Calendar, MapPin, X, ZoomIn, ZoomOut, RotateCw,
} from "lucide-react";
import Sidebar from "../../components/common/SidebarMahasiswa";

const STORAGE_KEY = "skpi_kegiatan";

// Data bawaan — hanya dipakai jika localStorage kosong
const SEED_DATA = [
  {
    id: 1,
    title: "Pelatihan UI/UX Design",
    date: "2025-10-20",
    location: "Jakarta Convention Center",
    kategori: "Pelatihan",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    tags: ["Pelatihan", "Nasional"],
    tagColors: ["text-[#3B82F6] bg-[#EFF6FF]", "text-[#6366F1] bg-[#EEF2FF]"],
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 15,
    certificate: "/Sertifikat.png",
  },
  {
    id: 2,
    title: "National Hackathon 2025",
    date: "2025-10-15",
    location: "Institut Teknologi Bandung",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    tags: ["Lomba", "Nasional"],
    tagColors: ["text-[#F59E0B] bg-[#FFFBEB]", "text-[#6366F1] bg-[#EEF2FF]"],
    status: "Ditangguhkan",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 3,
    title: "Leadership Training Seminar",
    date: "2025-10-10",
    location: "Gedung H Teknik Elektro",
    kategori: "Seminar",
    tingkatan: "Fakultas",
    jabatan: "Peserta",
    tags: ["Seminar", "Fakultas"],
    tagColors: ["text-[#8B5CF6] bg-[#F5F3FF]", "text-[#64748B] bg-[#F1F5F9]"],
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 10,
    certificate: null,
  },
  {
    id: 4,
    title: "Ketua Himpunan Mahasiswa Teknik Elektro",
    date: "2025-09-01",
    location: "Teknik Elektro",
    kategori: "Organisasi",
    tingkatan: "Fakultas",
    jabatan: "Ketua",
    tags: ["Organisasi", "Fakultas"],
    tagColors: ["text-[#0EA5E9] bg-[#F0F9FF]", "text-[#64748B] bg-[#F1F5F9]"],
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 25,
    certificate: null,
  },
  {
    id: 5,
    title: "International Conference Paper",
    date: "2025-08-20",
    location: "Singapore",
    kategori: "Publikasi",
    tingkatan: "Internasional",
    jabatan: "Pembicara",
    tags: ["Publikasi", "Internasional"],
    tagColors: ["text-[#EC4899] bg-[#FDF2F8]", "text-[#7C3AED] bg-[#F5F3FF]"],
    status: "Rejected",
    statusColor: "text-[#DC2626] bg-[#FEE2E2]",
    dot: "bg-[#DC2626]",
    poin: null,
    certificate: null,
  },
  {
    id: 6,
    title: "Artificial Intelligence for Future Innovation",
    date: "2025-08-10",
    location: "Universitas Indonesia",
    kategori: "Seminar",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    tags: ["Seminar", "Nasional"],
    tagColors: ["text-[#8B5CF6] bg-[#F5F3FF]", "text-[#6366F1] bg-[#EEF2FF]"],
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 12,
    certificate: null,
  },
];

// Helper: normalkan tag warna untuk item yang datang dari TambahKegiatan
const TAG_COLOR_MAP = {
  Seminar:       "text-[#7C3AED] bg-[#F3E8FF]",
  Lomba:         "text-[#3AB8BA] bg-[#DDF7F7]",
  Organisasi:    "text-[#10B981] bg-[#ECFDF5]",
  Kepanitiaan:   "text-[#10B981] bg-[#D1FAE5]",
  Pelatihan:     "text-[#2563EB] bg-[#DBEAFE]",
  Publikasi:     "text-[#F59E0B] bg-[#FEF3C7]",

  Internasional: "text-[#7C3AED] bg-[#F5F3FF]",
  Nasional:      "text-[#6366F1] bg-[#EEF2FF]",
  Regional:      "text-[#64748B] bg-[#F1F5F9]",
  Provinsi:      "text-[#64748B] bg-[#F1F5F9]",
  Fakultas:      "text-[#64748B] bg-[#F1F5F9]",
  Jurusan:       "text-[#64748B] bg-[#F1F5F9]",
};

function normalizeItem(item) {
  // Pastikan setiap item punya tagColors — item lama sudah punya, item baru belum
  if (!item.tagColors) {
    const tags = [item.kategori, item.tingkatan].filter(Boolean);
    return {
      ...item,
      tags,
      tagColors: tags.map((t) => TAG_COLOR_MAP[t] || "text-[#64748B] bg-[#F1F5F9]"),
      statusColor: item.statusColor || "text-[#B45309] bg-[#FEF9C3]",
      dot:         item.dot        || "bg-[#F59E0B]",
    };
  }
  return item;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_DATA;
    const parsed = JSON.parse(raw);
    return parsed.length ? parsed.map(normalizeItem) : SEED_DATA;
  } catch {
    return SEED_DATA;
  }
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ onClose, certificate }) {
  const [zoom, setZoom]         = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[16px] font-semibold text-[#0F172A] font-poppins">
            Pratinjau Sertifikat
          </h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A]">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[#E5E7EB]">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8] font-poppins"
          >
            <ZoomOut size={15} /> Perkecil
          </button>
          <span className="text-[13px] text-[#94A3B8] font-poppins">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => z + 0.1)}
            className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8] font-poppins"
          >
            <ZoomIn size={15} /> Perbesar
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8] font-poppins"
          >
            <RotateCw size={15} /> Rotate
          </button>
          <div className="flex-1" />
          <button
            disabled={!certificate}
            onClick={() => {
              if (certificate) {
                const link = document.createElement("a");
                link.href = certificate;
                link.download = "sertifikat.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="flex items-center gap-2 text-white px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
            style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
          >
            <Download size={14} /> Unduh
          </button>
        </div>

        {/* Content */}
        <div className="h-[500px] overflow-auto bg-[#F8FAFC] m-4 rounded-xl border border-[#E2E8F0] flex items-center justify-center">
          {certificate ? (
            <img
              src={certificate}
              alt="sertifikat"
              className="transition-all duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: "90%",
                maxHeight: "90%",
              }}
            />
          ) : (
            <p className="text-[#94A3B8] text-[14px] font-poppins">
              Preview sertifikat akan ditampilkan di sini
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const KATEGORI_OPTS = ["Semua Kategori", "Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi"];
const STATUS_OPTS   = ["Semua Status", "Divalidasi", "Ditangguhkan", "Menunggu", "Rejected"];

export default function Pengajuan() {
  const [data, setData]                     = useState([]);
  const [search, setSearch]                 = useState("");
  const [kategori, setKategori]             = useState("Semua Kategori");
  const [status, setStatus]                 = useState("Semua Status");
  const [preview, setPreview]               = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Baca localStorage setiap kali halaman dimuat
  useEffect(() => {
    setData(loadData());
  }, []);

  const handleDelete = (id) => {
    const updated = data.filter((d) => d.id !== id);
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const totalPoin = data.filter((d) => d.poin).reduce((a, b) => a + (b.poin || 0), 0);

  const filtered = data.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchKat    = kategori === "Semua Kategori" || d.tags?.some((t) => t === kategori);
    const matchSt     = status  === "Semua Status"   || d.status === status;
    return matchSearch && matchKat && matchSt;
  });

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />

      {preview && (
        <PreviewModal
          onClose={() => setPreview(false)}
          certificate={selectedCertificate}
        />
      )}

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#0F172A] font-poppins">Riwayat Pengajuan</h1>
            <p className="text-[14px] text-[#94A3B8] mt-1 font-poppins">
              Lihat dan kelola semua aktivitas yang telah diajukan
            </p>
          </div>
          <button
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 hover:shadow-lg font-poppins"
            style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
          >
            <Download size={16} /> Unduh Transkrip SKPI
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3 text-[14px] font-semibold text-[#374151] font-poppins">
            <Filter size={15} color="#6D28D9" /> Filter &amp; Pencarian
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Kegiatan..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#1D4ED8] transition-colors font-poppins"
              />
            </div>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#374151] focus:outline-none focus:border-[#1D4ED8] cursor-pointer font-poppins"
            >
              {KATEGORI_OPTS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#374151] focus:outline-none focus:border-[#1D4ED8] cursor-pointer font-poppins"
            >
              {STATUS_OPTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="text-[#94A3B8] text-[14px] font-poppins">Belum ada kegiatan ditemukan.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">

                {/* Ikon */}
                <div className="w-10 h-10 bg-[#EEF4FF] rounded-xl flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 bg-[#1D4ED8] rounded opacity-80" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#0F172A] font-poppins">{item.title}</p>
                    {item.isNew && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#DCFCE7] text-[#16A34A] font-poppins">
                        BARU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[12px] text-[#94A3B8] font-poppins">
                      <Calendar size={12} /> {item.date}
                    </span>
                    {item.location && item.location !== "-" && (
                      <span className="flex items-center gap-1 text-[12px] text-[#94A3B8] font-poppins">
                        <MapPin size={12} /> {item.location}
                      </span>
                    )}
                    {item.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium font-poppins ${item.tagColors?.[i] || ""}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[12px] px-3 py-1 rounded-full font-medium flex items-center gap-1 font-poppins ${item.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                      {item.status}
                    </span>
                    {item.poin && (
                      <span className="text-[12px] text-[#64748B] font-poppins">
                        Poin: <span className="text-[#1D4ED8] font-semibold">{item.poin}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setSelectedCertificate(item.certificate); setPreview(true); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FFFBEB] hover:text-[#F59E0B] transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 px-1">
          <p className="text-[13px] text-[#94A3B8] font-poppins">
            Menampilkan {filtered.length} dari {data.length} kegiatan
          </p>
          <p className="text-[13px] text-[#64748B] font-medium font-poppins">
            Total Poin: <span className="text-[#1D4ED8] font-bold">{totalPoin}</span>
          </p>
        </div>
      </main>
    </div>
  );
}