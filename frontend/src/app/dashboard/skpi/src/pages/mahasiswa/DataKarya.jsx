// src/pages/mahasiswa/Pengajuan.jsx
import { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, Pencil, Trash2,
  Calendar, MapPin, X, ZoomIn, ZoomOut, RotateCw,
  Lock, Unlock, AlertCircle, CheckCircle, ExternalLink, Clock, XCircle, Plus, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
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
    pembimbing: "Dr. Eng. Admi Syarif",
    tags: ["Lomba", "Nasional"],
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
    status: "Ditolak",
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
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 12,
    certificate: null,
  },
  {
    id: 7,
    title: "International Robotics Competition 2025",
    date: "2025-11-05",
    location: "Singapore Exhibition Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    tags: ["Lomba", "Internasional"],
    status: "Belum Diperiksa",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 8,
    title: "Desain UI/UX Aplikasi Akademik MyUnila",
    date: "2025-11-20",
    location: "-",
    kategori: "Karya",
    bentukKarya: "Karya Seni / Desain",
    tautanSertifikat: "https://dribbble.com/contoh-karya",
    tags: ["Karya", "Karya Seni / Desain"],
    status: "Diarsipkan",
    statusColor: "text-slate-600 bg-slate-100 border border-slate-200",
    dot: "bg-slate-400",
    poin: null,
    certificate: null,
  },
];

// Helper: normalkan tag warna untuk item yang datang dari TambahKegiatan
const TAG_COLOR_MAP = {
  Seminar:       "text-[#6D28D9] bg-[#F3E8FF] border border-[#D8B4FE]",
  Lomba:         "text-[#0EA5E9] bg-[#E0F2FE] border border-[#BAE6FD]",
  Organisasi:    "text-[#3AB8BA] bg-[#E6F4F4] border border-[#99F6E4]",
  Kepanitiaan:   "text-[#10B981] bg-[#DCFCE7] border border-[#BBF7D0]",
  Pelatihan:     "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]",
  Publikasi:     "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]",
  "PKKMB Universitas": "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]",
  Karya:         "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]",

  Internasional: "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Nasional:      "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Regional:      "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Provinsi:      "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Universitas:   "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Fakultas:      "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
  Jurusan:       "text-[#1E3A8A] bg-[#EFF3FF] border border-[#C7D2FE]",
};

function normalizeItem(item) {
  // Selalu hitung ulang tagColors agar perubahan pada TAG_COLOR_MAP langsung terlihat meskipun data lama ada di localStorage
  const tags = item.tags || [item.kategori, item.tingkatan].filter(Boolean);
  return {
    ...item,
    tags,
    tagColors: tags.map((t) => TAG_COLOR_MAP[t] || "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]"),
    statusColor: item.statusColor || "text-[#B45309] bg-[#FEF9C3]",
    dot:         item.dot        || "bg-[#F59E0B]",
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let dataToLoad = SEED_DATA;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length) dataToLoad = parsed;
    }
    
    // Pastikan ada contoh "Karya" untuk didemokan
    if (!dataToLoad.some(d => d.kategori === "Karya")) {
      const contohKarya = SEED_DATA.filter(d => d.kategori === "Karya");
      dataToLoad = [...dataToLoad, ...contohKarya];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToLoad));
    }
    
    return dataToLoad.map(normalizeItem);
  } catch {
    return SEED_DATA.map(normalizeItem);
  }
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* SISI KIRI: DATA DETAIL */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-[#E5E7EB] bg-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Detail Karya
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-2 font-poppins">
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors md:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* PROFIL MAHASISWA */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-600">👤</span>
                <h3 className="text-sm font-bold text-[#334155] font-poppins">
                  PROFIL MAHASISWA
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Nama</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">Hanifa</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">NPM</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">2020021001</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Program Studi</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">Teknik Elektro</p>
                </div>
              </div>
            </div>

            {/* INFO LENGKAP */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-600">📋</span>
                <h3 className="text-sm font-bold text-[#334155] font-poppins uppercase">
                  INFORMASI KARYA
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Kategori</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.kategori || "-"}</p>
                </div>
                {item.kategori === "Karya" ? (
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Bentuk Karya</p>
                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.bentukKarya || "Aplikasi / Perangkat Lunak"}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Jabatan / Peran</p>
                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.jabatan || "Peserta"}</p>
                  </div>
                )}
                {item.kategori !== "Karya" && (
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Tingkatan</p>
                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.tingkatan || "Nasional"}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">
                    {item.kategori === "Karya" ? "Tanggal Pembuatan" : "Tanggal Sertifikat"}
                  </p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.date || "-"}</p>
                </div>
                {item.kategori !== "Karya" && (
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Nomor Sertifikat</p>
                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5 font-mono">{item.nomorSertifikat || "-"}</p>
                  </div>
                )}
              </div>
              
              {/* TAUTAN */}
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">
                  {item.kategori === "Karya" ? "Tautan Karya / Portofolio" : "Tautan / Link Sertifikat"}
                </p>
                <a href={item.tautanSertifikat || "#"} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block font-medium break-all">
                  {item.tautanSertifikat || "-"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: SERTIFIKAT PREVIEW */}
        <div className="flex-1 bg-[#F8FAFC] flex flex-col relative">
          <div className="hidden md:flex absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-6 md:px-8 py-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <span className="text-blue-600">📄</span>
              Lampiran Pendukung
            </h3>
          </div>

          <div className="px-6 md:px-8 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center gap-4 bg-white">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomOut size={16} />
              Perkecil
            </button>
            <span className="text-[13px] font-semibold text-[#94A3B8] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomIn size={16} />
              Perbesar
            </button>
            <div className="w-px h-4 bg-[#E2E8F0]"></div>
            <button 
              onClick={() => setRotation(r => r + 90)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <RotateCw size={16} />
              Putar
            </button>

            <div className="flex-1" />

            <button
              disabled={!item.certificate}
              onClick={() => {
                if (item.certificate) {
                  const link = document.createElement("a");
                  link.href = item.certificate;
                  link.download = "Hanifa.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50"
              style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
            >
              <Download size={16} />
              Unduh
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8 bg-[#F1F5F9]">
            {item.certificate ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-gray-600">Lampiran Pendukung</p>
                {item.certificate.startsWith("data:application/pdf") ? (
                  <iframe src={item.certificate} style={{ width: "100%", height: "400px", transform: `scale(${zoom})`, transformOrigin: "top center" }} className="shadow-sm border border-gray-200 bg-white" />
                ) : (
                  <img
                    src={item.certificate}
                    alt="sertifikat"
                    className="transition-all duration-300 shadow-sm border border-gray-200 bg-white"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      maxWidth: "90%",
                      maxHeight: "90%",
                    }}
                  />
                )}
              </div>
            ) : (
              <div 
                className="transition-transform duration-200 origin-center bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  width: '600px',
                  height: '420px'
                }}
              >
                <span className="text-blue-200">📄</span>
                <p>Gambar / PDF Lampiran ({item.title})</p>
              </div>
            )}
            
            {item.kategori === "Lomba" && item.skFile && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-sm font-semibold text-gray-600">SK Pembimbing</p>
                {item.skFile.startsWith("data:application/pdf") ? (
                  <iframe src={item.skFile} style={{ width: "100%", height: "400px", transform: `scale(${zoom})`, transformOrigin: "top center" }} className="shadow-sm border border-gray-200 bg-white" />
                ) : (
                  <img
                    src={item.skFile}
                    alt="sk pembimbing"
                    className="transition-all duration-300 shadow-sm border border-gray-200 bg-white"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      maxWidth: "90%",
                      maxHeight: "90%",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal Mahasiswa ─────────────────────────────────────────────────────
function ModalEditMahasiswa({ item, onClose, onSave }) {
  const [judul, setJudul] = useState(item.title || "");
  const [kategori, setKategori] = useState(item.kategori || "");
  const [tahun, setTahun] = useState(item.date ? item.date.slice(0, 4) : "2025");
  const [tingkatan, setTingkatan] = useState(item.tingkatan || "");
  const [jabatan, setJabatan] = useState(item.jabatan || "");
  const [pembimbing, setPembimbing] = useState(item.pembimbing || "");
  const [nomorSertifikat, setNomorSertifikat] = useState(item.nomorSertifikat || "");
  const [tanggalSertifikat, setTanggalSertifikat] = useState(item.date || "");
  const [tautanSertifikat, setTautanSertifikat] = useState(item.tautanSertifikat || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!judul.trim()) { setError("Judul kegiatan wajib diisi."); return; }
    if (!kategori) { setError("Kategori wajib dipilih."); return; }
    if (kategori === "Lomba" && !pembimbing) { setError("Dosen Pembimbing wajib dipilih untuk kategori Lomba."); return; }
    setError("");

    onSave({
      ...item,
      title: judul.trim(),
      kategori,
      date: tanggalSertifikat || `${tahun}-01-01`,
      tingkatan,
      jabatan,
      pembimbing: kategori === "Lomba" ? pembimbing : "",
      nomorSertifikat,
      tautanSertifikat,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A] text-md font-poppins">Edit Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold font-poppins">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Judul Kegiatan</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 font-poppins"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none font-poppins"
              >
                <option value="Seminar">Seminar</option>
                <option value="Lomba">Lomba</option>
                <option value="Organisasi">Organisasi</option>
                <option value="Kepanitiaan">Kepanitiaan</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Publikasi">Publikasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Tahun</label>
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none font-poppins"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Tingkatan</label>
              <select
                value={tingkatan}
                onChange={(e) => setTingkatan(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none font-poppins"
              >
                <option value="Internasional">Internasional</option>
                <option value="Nasional">Nasional</option>
                <option value="Regional">Regional</option>
                <option value="Provinsi">Provinsi</option>
                <option value="Fakultas">Fakultas</option>
                <option value="Jurusan">Jurusan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Jabatan</label>
              <select
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none font-poppins"
              >
                <option value="Peserta">Peserta</option>
                <option value="Ketua">Ketua</option>
                <option value="Anggota">Anggota</option>
                <option value="Panitia">Panitia</option>
                <option value="Pembicara">Pembicara</option>
                <option value="Juri">Juri</option>
              </select>
            </div>
          </div>

          {kategori === "Lomba" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Dosen Pembimbing Lomba</label>
              <select
                value={pembimbing}
                onChange={(e) => setPembimbing(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none font-poppins"
              >
                <option value="">Pilih Pembimbing</option>
                <option value="Dr. Eng. Admi Syarif">Dr. Eng. Admi Syarif</option>
                <option value="Prof. Dr. Ir. Suharno, M.S.">Prof. Dr. Ir. Suharno, M.S.</option>
                <option value="Ahmad Zakaria, Ph.D.">Ahmad Zakaria, Ph.D.</option>
                <option value="Dr. Ryan Randy Suryono">Dr. Ryan Randy Suryono</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Nomor Sertifikat</label>
              <input
                type="text"
                value={nomorSertifikat}
                onChange={(e) => setNomorSertifikat(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 font-poppins"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Tanggal Sertifikat</label>
              <input
                type="date"
                value={tanggalSertifikat}
                onChange={(e) => setTanggalSertifikat(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 font-poppins"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">Tautan Sertifikat</label>
            <input
              type="text"
              value={tautanSertifikat}
              onChange={(e) => setTautanSertifikat(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-blue-500 font-poppins"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition font-poppins"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-white text-xs font-semibold transition active:scale-[0.98] font-poppins shadow-sm hover:opacity-90"
            style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Download Success Modal ──────────────────────────────────────────────────
function ModalDownloadSukses({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4 border border-green-100">
          <CheckCircle size={24} />
        </div>
        <h3 className="font-semibold text-[#0F172A] text-[16px] font-poppins">Unduhan Berhasil!</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed font-poppins">
          Transkrip Final SKPI resmi Anda (Format PDF) telah berhasil diekspor dan diunduh ke perangkat Anda.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] font-poppins"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

// ─── Draft Alert Modal ───────────────────────────────────────────────────────
function ModalDraftAlert({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 border border-amber-100">
          <Lock size={24} />
        </div>
        <h3 className="font-semibold text-[#0F172A] text-[16px] font-poppins">Transkrip Belum Final</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed font-poppins">
          SKPI Anda masih dalam status draf dan belum dikunci oleh Program Studi. Anda belum dapat mengunduh transkrip final.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] font-poppins"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ModalConfirmDelete({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100">
          <Trash2 size={24} />
        </div>
        <h3 className="font-semibold text-[#0F172A] text-[16px] font-poppins">Konfirmasi Hapus</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed font-poppins">
          Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 mt-6 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition font-poppins"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] font-poppins"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const KATEGORI_OPTS = ["Semua Kategori", "Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi", "Karya"];
const STATUS_OPTS   = ["Semua Status", "Divalidasi", "Ditangguhkan", "Menunggu", "Ditolak", "Diarsipkan"];

export default function DataKarya() {
  const [data, setData]                     = useState([]);
  const [search, setSearch]                 = useState("");
  const [kategori, setKategori]             = useState("Semua Kategori");
  const [status, setStatus]                 = useState("Semua Status");
  const [preview, setPreview]               = useState(false);
  const [selectedItem, setSelectedItem]     = useState(null);
  const [editItem, setEditItem]             = useState(null);
  const [deleteItem, setDeleteItem]         = useState(null);
  const [downloadModal, setDownloadModal]   = useState(false);
  const [draftAlertModal, setDraftAlertModal] = useState(false);

  // Baca status kunci dari localStorage (NPM mahasiswa Hanifa = 2020021001)
  const isLocked = typeof window !== "undefined" ? localStorage.getItem("skpi_lock_2020021001") === "true" : false;

  // Baca localStorage setiap kali halaman dimuat
  useEffect(() => {
    setData(loadData());
  }, []);

  const confirmDelete = () => {
    if (deleteItem) {
      const updated = data.filter((d) => d.id !== deleteItem.id);
      setData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDeleteItem(null);
    }
  };

  const handleSaveEdit = (updatedItem) => {
    // Setelah disimpan, reset status menjadi "Menunggu" agar bisa divalidasi ulang admin
    const normalized = normalizeItem({
      ...updatedItem,
      status: "Menunggu",
      statusColor: "text-[#B45309] bg-[#FEF9C3]",
      dot: "bg-[#F59E0B]",
      catatanRevisi: "",
      isNew: false,
    });
    const updated = data.map((d) => d.id === normalized.id ? normalized : d);
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditItem(null);
  };

  const totalPoin = data.filter((d) => d.poin).reduce((a, b) => a + (b.poin || 0), 0);

  const filtered = data.filter((d) => {
    if (d.kategori !== "Karya") return false;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchSt     = status  === "Semua Status"   || d.status === status;
    return matchSearch && matchSt;
  });

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />

      {/* MODAL PRATINJAU SERTIFIKAT */}
      {preview && selectedItem && (
        <PreviewModal
          item={selectedItem}
          onClose={() => { setPreview(false); setSelectedItem(null); }}
        />
      )}

      {/* MODAL EDIT KEGIATAN MAHASISWA */}
      {editItem && (
        <ModalEditMahasiswa
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* MODAL SUKSES DOWNLOAD */}
      {downloadModal && (
        <ModalDownloadSukses onClose={() => setDownloadModal(false)} />
      )}

      {/* MODAL PERINGATAN DRAF */}
      {draftAlertModal && (
        <ModalDraftAlert onClose={() => setDraftAlertModal(false)} />
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteItem && (
        <ModalConfirmDelete
          onClose={() => setDeleteItem(null)}
          onConfirm={confirmDelete}
        />
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#0F172A] font-poppins">Data Karya</h1>
            <p className="text-[14px] text-[#94A3B8] mt-1 font-poppins">
              Lihat dan kelola semua karya yang telah diajukan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tambah-kegiatan"
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 shadow-sm hover:opacity-90 font-poppins"
              style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
            >
              <Plus size={16} /> Tambah Kegiatan
            </Link>
          </div>
        </div>

        {/* BANNER KUNCI SKPI */}
        {isLocked && (
          <div className="mb-5 px-5 py-4 bg-gradient-to-r from-red-500/10 to-amber-400/10 border border-red-200/40 rounded-2xl flex items-center gap-3 shadow-sm">
            <Lock size={18} className="text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700 font-poppins">Transkrip SKPI Anda Telah Dikunci & Diterbitkan</p>
              <p className="text-xs text-gray-500 font-poppins mt-0.5">
                Data kegiatan tidak dapat diubah atau dihapus. Silakan unduh transkrip final menggunakan tombol di atas.
              </p>
            </div>
          </div>
        )}

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
                placeholder="Cari Karya..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#1D4ED8] transition-colors font-poppins"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="text-[#94A3B8] text-[14px] font-poppins">Belum ada kegiatan ditemukan.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const canEdit = !isLocked && (item.status === "Ditangguhkan" || item.status === "Belum Diperiksa" || item.status === "Menunggu" || item.status === "Diarsipkan");
              const canDelete = !isLocked && item.status !== "Divalidasi";
              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    {/* Ikon */}
                    <div className="w-10 h-10 bg-[#EEF4FF] rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="text-[#1D4ED8]" size={20} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold text-[#0F172A] font-poppins">{item.title}</p>
                        {((item.createdAt && Date.now() - item.createdAt < 24 * 60 * 60 * 1000) || (!item.createdAt && item.isNew)) && (
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
                        {item.pembimbing && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium font-poppins text-[#1E3A8A] bg-blue-50 border border-blue-200">
                            Pembimbing: {item.pembimbing}
                          </span>
                        )}
                      </div>
                      </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.tautanSertifikat && (
                        <a
                          href={item.tautanSertifikat.startsWith('http') ? item.tautanSertifikat : `https://${item.tautanSertifikat}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] transition-colors"
                          title="Buka Tautan / Portofolio"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => { setSelectedItem(item); setPreview(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] transition-colors"
                        title="Pratinjau Lampiran"
                      >
                        <Eye size={16} />
                      </button>
                      {/* Tampilkan tombol Edit hanya jika belum dikunci dan boleh diedit */}
                      {canEdit ? (
                        <button
                          onClick={() => setEditItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FFFBEB] hover:text-[#F59E0B] transition-colors"
                          title="Edit & Ajukan Ulang"
                        >
                          <Pencil size={16} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 cursor-not-allowed"
                          title={isLocked ? "SKPI Terkunci (Final)" : "Tidak dapat diedit"}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {/* Tampilkan tombol Hapus hanya jika boleh dihapus */}
                        {canDelete && (
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 size={16} />
                        </button>
                        )}
                      
                    </div>
                  </div>

                  {/* CATATAN REVISI dari Admin (hanya tampil jika status Ditangguhkan) */}
                  {item.status === "Ditangguhkan" && item.catatanRevisi && (
                    <div className="flex items-start gap-2.5 mt-1 px-3 py-2.5 bg-amber-50 border border-amber-200/70 rounded-xl">
                      <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-semibold text-amber-700 font-poppins">Catatan Revisi dari Admin:</p>
                        <p className="text-[12px] text-amber-800 mt-0.5 leading-relaxed font-poppins">{item.catatanRevisi}</p>
                        {!isLocked && (
                          <button
                            onClick={() => setEditItem(item)}
                            className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold transition active:scale-[0.97] font-poppins"
                          >
                            Perbaiki &amp; Ajukan Ulang →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 px-1">
          <p className="text-[13px] text-[#94A3B8] font-poppins">
            Menampilkan {filtered.length} dari {data.length} karya
          </p>
        </div>
      </main>
    </div>
  );
}