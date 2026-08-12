// src/pages/admin/Validasi.jsx

import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import {
  Search,
  Eye,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Lock,
  Unlock,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
  Save,
  CheckCircle,
  ChevronLeft,
  Pencil,
  FileText,
  Award,
  User,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";

// ======================================================
// DATA — diurutkan dari permohonan terlama → terbaru
// ======================================================

const allValidasiData = [
  {
    id: 1,
    nama: "Budi Santoso",
    npm: "202110003",
    programStudi: "Teknik Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "Ketua BEM Unila",
    tanggal: "2025-09-01",
    kategori: "Organisasi",
    poin: 25,
    statusValidasi: "Divalidasi",
  },
  {
    id: 2,
    nama: "Eko Prasetyo",
    npm: "202110005",
    programStudi: "Sistem Informasi",
    statusMahasiswa: "Aktif",
    kegiatan: "Dasar Keamanan Siber",
    tanggal: "2025-10-10",
    kategori: "Seminar",
    poin: 10,
    statusValidasi: "Ditolak",
  },
  {
    id: 3,
    nama: "Dewi Lestari",
    npm: "202110004",
    programStudi: "Teknik Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "UI/UX Design Workshop",
    tanggal: "2025-10-15",
    kategori: "Pelatihan",
    poin: 12,
    statusValidasi: "Ditangguhkan",
  },
  {
    id: 4,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "Digital Innovation Summit",
    tanggal: "2025-10-18",
    kategori: "Seminar",
    poin: 15,
    statusValidasi: "Ditangguhkan",
  },
  {
    id: 5,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "National Coding Competition 2025",
    tanggal: "2025-10-20",
    kategori: "Lomba",
    poin: 20,
    statusValidasi: "Ditangguhkan",
  },
  // Kegiatan tambahan untuk simulasi multi-kegiatan per mahasiswa
  {
    id: 6,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "Seminar AI & Machine Learning",
    tanggal: "2025-10-22",
    kategori: "Seminar",
    poin: 10,
    statusValidasi: "Ditangguhkan",
  },
  {
    id: 7,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    statusMahasiswa: "Aktif",
    kegiatan: "Pelatihan Public Speaking",
    tanggal: "2025-10-25",
    kategori: "Pelatihan",
    poin: 8,
    statusValidasi: "Ditangguhkan",
  },
];

// ======================================================
// KOMPONEN STATUS BADGE
// ======================================================

function StatusBadge({ status }) {
  if (status === "Divalidasi") {
    return (
      <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#E6F8F3] text-[#049D71] font-poppins">
        <CheckCircle size={14} /> {status}
      </span>
    );
  } else if (status === "Ditangguhkan") {
    return (
      <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#FFF5E6] text-[#F59E0B] font-poppins">
        <Clock size={14} /> {status}
      </span>
    );
  } else if (status === "Menunggu" || status === "Belum Diperiksa") {
    return (
      <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600 font-poppins">
        <Clock size={14} /> {status === "Menunggu" ? "Belum Diperiksa" : status}
      </span>
    );
  } else {
    return (
      <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] font-poppins">
        <XCircle size={14} /> {status}
      </span>
    );
  }
}

// ======================================================
// MODAL PRATINJAU SERTIFIKAT
// ======================================================

function ModalSertifikat({ item, onClose }) {
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
                Detail Validasi Kegiatan
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-2 font-poppins">
                {item.kegiatan}
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
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.nama}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">NPM</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.npm}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Program Studi</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.programStudi}</p>
                </div>
              </div>
            </div>

            {/* INFO LENGKAP */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-600">📋</span>
                <h3 className="text-sm font-bold text-[#334155] font-poppins uppercase">
                  INFORMASI KEGIATAN
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Kategori</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.kategori}</p>
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
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.tanggal}</p>
                </div>
                {item.kategori !== "Karya" && (
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Nomor Sertifikat</p>
                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5 font-mono">{item.nomorSertifikat || "102/UN26/SKPI/2025"}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Poin</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.poin || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={item.statusValidasi} />
                  </div>
                </div>
              </div>

              {/* TAUTAN */}
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">
                  {item.kategori === "Karya" ? "Tautan Karya / Portofolio" : "Tautan / Link Sertifikat"}
                </p>
                <a href={item.tautanSertifikat || "#"} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block font-medium break-all">
                  {item.tautanSertifikat || "https://drive.google.com/file/d/contoh-link/view"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: SERTIFIKAT PREVIEW */}
        <div className="flex-1 bg-[#F8FAFC] flex flex-col relative">
          <div className="px-6 md:px-8 py-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0 font-poppins">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <span className="text-blue-600">📄</span>
              Lampiran Pendukung
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 md:px-8 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center gap-4 bg-white shrink-0 font-poppins">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomOut size={16} />
              Perkecil
            </button>
            <span className="text-[13px] font-bold text-[#94A3B8] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomIn size={16} />
              Perbesar
            </button>
            <div className="w-px h-4 bg-[#E2E8F0]"></div>
            <button
              onClick={() => setRotation(r => r + 90)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <RotateCw size={16} />
              Putar
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center gap-8 bg-[#F1F5F9] min-h-[300px]">
            {item.certificate ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-gray-600 font-poppins">Sertifikat</p>
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
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3 p-6 bg-white shadow-sm">
                <FileText size={48} className="text-gray-300 stroke-[1.5]" />
                <p className="text-[13px] font-medium text-gray-500 font-poppins">
                  Belum ada berkas lampiran diunggah
                </p>
              </div>
            )}

            {item.kategori === "Lomba" && item.skFile && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-sm font-semibold text-gray-600 font-poppins">SK Pembimbing</p>
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

          {/* SISI KANAN FOOTER */}
          <div className="px-6 md:px-8 py-4 border-t border-[#E2E8F0] flex items-center justify-end bg-white shrink-0">
            <button
              disabled={!item.certificate}
              onClick={() => {
                if (item.certificate) {
                  const link = document.createElement("a");
                  link.href = item.certificate;
                  link.download = "sertifikat.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="flex items-center gap-2 text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
            >
              <Download size={16} />
              Unduh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MODAL TOLAK ATAU TANGGUHKAN KEGIATAN
// ======================================================

function ModalTolakDanTangguhkan({ item, onClose, onConfirm }) {
  const [type, setType] = useState("Ditangguhkan"); // Default: Ditangguhkan (Revisi)
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (type === "Ditangguhkan" && alasan.trim().length < 5) {
      setError("Silakan masukkan alasan ditangguhkan/catatan revisi (minimal 5 karakter).");
      return;
    }
    setError("");
    onConfirm(type, type === "Ditangguhkan" ? alasan.trim() : "");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A] text-[16px] font-poppins">Tolak / Tangguhkan Kegiatan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-4 font-poppins">
            Tentukan tindakan untuk kegiatan: <strong className="text-gray-700">{item?.kegiatan}</strong>
          </p>

          {/* Opsi Tipe */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => { setType("Ditangguhkan"); setError(""); }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${type === "Ditangguhkan"
                  ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mb-2.5">
                <Clock size={16} />
              </div>
              <p className="text-xs font-semibold text-[#0F172A] font-poppins">Ditangguhkan</p>
              <p className="text-[10px] text-gray-400 mt-1 font-poppins">Butuh revisi & dapat diedit ulang mahasiswa</p>
            </button>

            <button
              type="button"
              onClick={() => { setType("Ditolak"); setError(""); }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${type === "Ditolak"
                  ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 mb-2.5">
                <XCircle size={16} />
              </div>
              <p className="text-xs font-semibold text-[#0F172A] font-poppins">Tolak Permanen</p>
              <p className="text-[10px] text-gray-400 mt-1 font-poppins">Ditolak mutlak & tidak dapat diubah lagi</p>
            </button>
          </div>

          {/* Textarea Catatan */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 font-poppins">
              Catatan / Alasan {type === "Ditangguhkan" ? "Ditangguhkan" : "Penolakan"} {type === "Ditangguhkan" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder={
                type === "Ditangguhkan"
                  ? "Sebutkan bagian sertifikat yang harus direvisi (misal: 'Nama di sertifikat berbeda dengan NPM')"
                  : "Sebutkan alasan penolakan permanen (opsional)"
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 transition-colors font-poppins resize-none"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500 font-medium mt-2 font-poppins">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition font-poppins"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition font-poppins ${type === "Ditangguhkan"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-red-500 hover:bg-red-600"
              }`}
          >
            Konfirmasi {type}
          </button>
        </div>

      </div>
    </div>
  );
}

// ======================================================
// MODAL VALIDASI & BERI POIN
// ======================================================

function ModalValidasiPoin({ item, onClose, onConfirm }) {
  const defaultPoin = item?.kategori === "Lomba" ? 15 : item?.kategori === "Seminar" ? 10 : item?.kategori === "Organisasi" ? 20 : item?.kategori === "Pelatihan" ? 8 : 12;
  const [poin, setPoin] = useState(item?.poin && item.poin > 0 ? item.poin : defaultPoin);

  const kategoriTag = (kat) => {
    const map = {
      Seminar: "bg-purple-100 text-purple-700",
      Lomba: "bg-sky-100 text-sky-700",
      Organisasi: "bg-teal-100 text-teal-700",
      Kepanitiaan: "bg-green-100 text-green-700",
      Pelatihan: "bg-yellow-100 text-yellow-700",
    };
    return map[kat] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0F172A] text-[15px] font-poppins">Validasi Kegiatan</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-poppins">{item?.nama} · {item?.kegiatan}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags kategori */}
          <div className="flex gap-2 flex-wrap mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold font-poppins ${kategoriTag(item?.kategori)}`}>
              {item?.kategori}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold font-poppins bg-green-100 text-green-700">
              Nasional
            </span>
          </div>

          {/* Poin Input */}
          <div className="mb-2">
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
              Poin SKPI <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={poin}
              onChange={(e) => setPoin(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none focus:border-blue-400 transition-colors font-poppins text-[#0F172A]"
            />
          </div>
          <p className="text-[11px] text-gray-400 font-poppins">
            Saran otomatis berdasarkan tingkatan kegiatan. Sesuaikan bila perlu.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition font-poppins"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(poin)}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition font-poppins flex items-center gap-2"
          >
            <Check size={15} /> Validasi &amp; Beri Poin
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MODAL EDIT KEGIATAN
// ======================================================

// ======================================================
// MODAL EDIT KEGIATAN
// ======================================================

function ModalEdit({ item, onClose, onSave }) {
  const KATEGORI_LIST = ["Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi", "Karya", "PKKMB Universitas"];
  const TAHUN_LIST = ["2025", "2024", "2023", "2022", "2021"];
  const BENTUK_KARYA_LIST = ["Aplikasi / Software", "Karya Tulis / Jurnal", "Karya Seni / Desain", "Proyek Multimedia", "Lainnya"];
  const TINGKATAN_LIST = ["Internasional", "Nasional", "Regional", "Provinsi", "Universitas", "Fakultas", "Jurusan"];
  const DOSEN_LIST = [
    "Dr. Eng. Admi Syarif",
    "Prof. Dr. Ir. Suharno, M.S.",
    "Ahmad Zakaria, Ph.D.",
    "Dr. Ryan Randy Suryono"
  ];

  const getJabatanOpts = (kat) => {
    if (kat === "Lomba") return ["Peserta", "Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Harapan 3"];
    if (kat === "Organisasi" || kat === "Kepanitiaan") return ["Ketua", "Wakil Ketua", "Sekretaris", "Wakil Sekretaris", "Bendahara", "Wakil Bendahara", "Anggota", "Ketua Bidang / Koordinator / Departemen"];
    if (kat === "Pelatihan" || kat === "Seminar") return ["Narasumber / Pembicara", "Moderator", "Peserta"];
    if (kat === "Publikasi") return ["Ketua", "Anggota"];
    return ["Peserta", "Ketua", "Anggota", "Panitia", "Pembicara", "Juri"];
  };

  const [judul, setJudul] = useState(item?.kegiatan || item?.title || "");
  const [kategori, setKategori] = useState(item?.kategori || "Seminar");
  const [tahun, setTahun] = useState(item?.tanggal ? item.tanggal.slice(0, 4) : item?.date ? item.date.slice(0, 4) : "2025");
  const [bentukKarya, setBentukKarya] = useState(item?.bentukKarya || "");
  const [tingkatan, setTingkatan] = useState(item?.tingkatan || "");
  const [jabatan, setJabatan] = useState(item?.jabatan || "");
  const [pembimbing, setPembimbing] = useState(item?.pembimbing || "");
  const [anggotaTim, setAnggotaTim] = useState(
    Array.isArray(item?.anggotaTim) && item.anggotaTim.length > 0
      ? item.anggotaTim
      : [{ nama: "", npm: "" }]
  );
  const [skFile, setSkFile] = useState(item?.skFile || null);
  const [nomorSertifikat, setNomorSertifikat] = useState(item?.nomorSertifikat || "");
  const [tanggalSertifikat, setTanggalSertifikat] = useState(item?.tanggal || item?.date || "");
  const [tautanSertifikat, setTautanSertifikat] = useState(item?.tautanSertifikat || "");
  const [file, setFile] = useState(item?.certificate || null);
  const [error, setError] = useState("");

  const handleKategoriChange = (val) => {
    setKategori(val);
    if (val === "Karya") {
      setJabatan("");
      setTingkatan("");
      setPembimbing("");
      setNomorSertifikat("");
      setAnggotaTim([{ nama: "", npm: "" }]);
      setSkFile(null);
    } else if (val === "Lomba") {
      setBentukKarya("");
    } else {
      setBentukKarya("");
      setPembimbing("");
      setAnggotaTim([{ nama: "", npm: "" }]);
      setSkFile(null);
    }
  };

  const handleAddAnggota = () => setAnggotaTim([...anggotaTim, { nama: "", npm: "" }]);
  const handleRemoveAnggota = (idx) => setAnggotaTim(anggotaTim.filter((_, i) => i !== idx));
  const handleChangeAnggota = (idx, f, v) => {
    const next = [...anggotaTim];
    next[idx][f] = v;
    setAnggotaTim(next);
  };

  const handleSave = () => {
    if (!judul.trim()) {
      setError(kategori === "Karya" ? "Judul karya wajib diisi." : "Judul kegiatan wajib diisi.");
      return;
    }
    if (!kategori) { setError("Kategori wajib dipilih."); return; }
    if (!tahun) { setError("Tahun wajib dipilih."); return; }

    if (kategori === "Karya") {
      if (!bentukKarya) { setError("Bentuk karya wajib dipilih."); return; }
    } else if (kategori === "Lomba") {
      if (!jabatan) { setError("Prestasi / Pencapaian wajib dipilih."); return; }
      if (!tingkatan) { setError("Tingkatan wajib dipilih."); return; }
    } else {
      if (!jabatan) { setError("Jabatan / Peran wajib dipilih."); return; }
      if (!tingkatan) { setError("Tingkatan wajib dipilih."); return; }
    }

    setError("");
    const updated = {
      ...item,
      kegiatan: judul.trim(),
      title: judul.trim(),
      kategori,
      tanggal: tanggalSertifikat || `${tahun}-01-01`,
      date: tanggalSertifikat || `${tahun}-01-01`,
      bentukKarya: kategori === "Karya" ? bentukKarya : "",
      tingkatan: kategori === "Karya" ? "" : tingkatan,
      jabatan: kategori === "Karya" ? "" : jabatan,
      pembimbing: kategori === "Lomba" ? pembimbing : "",
      anggotaTim: kategori === "Lomba" ? anggotaTim.filter(a => a.nama.trim() || a.npm.trim()) : [],
      skFile: kategori === "Lomba" ? skFile : null,
      nomorSertifikat: kategori === "Karya" ? "" : nomorSertifikat,
      tautanSertifikat,
      certificate: file,
    };
    if (onSave) onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-[#0F172A] text-lg font-poppins">Edit Kegiatan &amp; Karya</h3>
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

          {/* Judul */}
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
              {kategori === "Karya" ? "Judul Karya" : "Judul Kegiatan"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
            />
          </div>

          {/* Kategori & Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                Kategori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => handleKategoriChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                >
                  {KATEGORI_LIST.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tahun <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                >
                  {TAHUN_LIST.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* KONDISI 1: KARYA */}
          {kategori === "Karya" && (
            <>
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                  Bentuk Karya <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={bentukKarya}
                    onChange={(e) => setBentukKarya(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="" disabled>Pilih Bentuk Karya</option>
                    {BENTUK_KARYA_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tanggal Karya / Pembuatan</label>
                <input
                  type="date"
                  value={tanggalSertifikat}
                  onChange={(e) => setTanggalSertifikat(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tautan Karya / Portofolio</label>
                <input
                  type="text"
                  value={tautanSertifikat}
                  onChange={(e) => setTautanSertifikat(e.target.value)}
                  placeholder="https://github.com/... atau link Drive"
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>
            </>
          )}

          {/* KONDISI 2: LOMBA */}
          {kategori === "Lomba" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                    Prestasi / Pencapaian <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="" disabled>Pilih Prestasi</option>
                      {getJabatanOpts("Lomba").map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                    Tingkatan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={tingkatan}
                      onChange={(e) => setTingkatan(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="" disabled>Pilih Tingkatan</option>
                      {TINGKATAN_LIST.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Dosen Pembimbing Lomba (Opsional)</label>
                <div className="relative">
                  <select
                    value={pembimbing}
                    onChange={(e) => setPembimbing(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="">Pilih Dosen Pembimbing</option>
                    {DOSEN_LIST.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Anggota Tim */}
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-2 font-poppins">Anggota Tim (Opsional)</label>
                {anggotaTim.map((anggota, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Nama"
                      value={anggota.nama}
                      onChange={(e) => handleChangeAnggota(idx, "nama", e.target.value)}
                      className="w-1/2 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] font-poppins"
                    />
                    <input
                      type="text"
                      placeholder="NPM"
                      value={anggota.npm}
                      onChange={(e) => handleChangeAnggota(idx, "npm", e.target.value)}
                      className="w-1/3 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] font-poppins"
                    />
                    {anggotaTim.length > 1 && (
                      <button type="button" onClick={() => handleRemoveAnggota(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddAnggota} className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition font-poppins">
                  <Plus size={16} /> Tambah Anggota
                </button>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Nomor Sertifikat</label>
                <input
                  type="text"
                  value={nomorSertifikat}
                  onChange={(e) => setNomorSertifikat(e.target.value)}
                  placeholder="Masukkan nomor sertifikat"
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tanggal Sertifikat</label>
                <input
                  type="date"
                  value={tanggalSertifikat}
                  onChange={(e) => setTanggalSertifikat(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tautan Sertifikat</label>
                <input
                  type="text"
                  value={tautanSertifikat}
                  onChange={(e) => setTautanSertifikat(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>
            </>
          )}

          {/* KONDISI 3: NON-KARYA BIASA */}
          {kategori && kategori !== "Karya" && kategori !== "Lomba" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                    Jabatan / Peran <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="" disabled>Pilih Jabatan</option>
                      {getJabatanOpts(kategori).map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">
                    Tingkatan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={tingkatan}
                      onChange={(e) => setTingkatan(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="" disabled>Pilih Tingkatan</option>
                      {TINGKATAN_LIST.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Nomor Sertifikat</label>
                <input
                  type="text"
                  value={nomorSertifikat}
                  onChange={(e) => setNomorSertifikat(e.target.value)}
                  placeholder="Masukkan nomor sertifikat"
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tanggal Sertifikat</label>
                <input
                  type="date"
                  value={tanggalSertifikat}
                  onChange={(e) => setTanggalSertifikat(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 font-poppins">Tautan Sertifikat</label>
                <input
                  type="text"
                  value={tautanSertifikat}
                  onChange={(e) => setTautanSertifikat(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-poppins"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-gray-50 transition font-poppins bg-white"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition active:scale-[0.98] font-poppins bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center gap-2 shadow-lg shadow-blue-600/10"
          >
            <Save size={16} className="text-white" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// TABEL KEGIATAN (digunakan di tampilan detail mahasiswa)
// ======================================================

const KATEGORI_CLASS_MAP = {
  Seminar: "border-[#D8B4FE] bg-[#F3E8FF] text-[#6D28D9]",
  Lomba: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0EA5E9]",
  Organisasi: "border-[#99F6E4] bg-[#E6F4F4] text-[#3AB8BA]",
  Kepanitiaan: "border-[#BBF7D0] bg-[#DCFCE7] text-[#10B981]",
  Pelatihan: "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
  Publikasi: "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
  Karya: "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
};

function TabelKegiatan({ data, onLihatSertifikat, onEdit, onApprove, onTolak, isLocked }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F8FAFC] border-b border-gray-100">
          <tr className="text-left text-[12px] text-[#64748B] font-semibold tracking-wide">
            <th className="px-6 py-4">KEGIATAN</th>
            <th className="px-6 py-4">KATEGORI</th>
            <th className="px-6 py-4">POIN</th>
            <th className="px-6 py-4">STATUS</th>
            <th className="px-6 py-4">DETAIL</th>
            <th className="px-6 py-4 text-center">AKSI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4">
                <p className="text-sm text-[#0F172A] font-medium">
                  {item.kegiatan}
                </p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{item.tanggal}</p>
                {item.catatanRevisi && item.statusValidasi === "Ditangguhkan" && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg mt-1 max-w-xs font-poppins">
                    Catatan: {item.catatanRevisi}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${KATEGORI_CLASS_MAP[item.kategori] || "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]"}`}>
                  {item.kategori}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-[#0F172A]">
                {item.statusValidasi === "Divalidasi" ? item.poin : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={item.statusValidasi} />
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onLihatSertifikat(item)}
                  className="flex items-center gap-1 text-[#2563EB] text-sm hover:underline font-poppins"
                >
                  <Eye size={15} />
                  Tampilkan
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Edit"))}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onApprove(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center hover:bg-[#059669] transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Validasi"))}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => onTolak(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center hover:bg-[#FCA5A5] hover:text-[#B91C1C] transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Tolak / Tangguhkan"))}
                  >
                    <X size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function Validasi() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [lockTrigger, setLockTrigger] = useState(0);

  // null = tampilan semua mahasiswa, object = tampilan detail mahasiswa
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);

  // Modals
  const [sertifikatItem, setSertifikatItem] = useState(null);
  const [tolakItem, setTolakItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [approveItem, setApproveItem] = useState(null);

  // Sync data dari localStorage & seed
  useEffect(() => {
    const stored = localStorage.getItem("skpi_kegiatan");
    let storedList = [];
    if (stored) {
      try {
        storedList = JSON.parse(stored);
      } catch {
        storedList = [];
      }
    }

    // Ubah ke format allValidasiData
    const normalizedStored = storedList.map((item) => ({
      id: item.id,
      nama: "Hanifa",
      npm: "2020021001",
      programStudi: "Teknik Elektro",
      statusMahasiswa: "Aktif",
      kegiatan: item.title,
      tanggal: item.date,
      kategori: item.kategori,
      poin: item.poin || 0,
      statusValidasi: item.status || "Menunggu",
      catatanRevisi: item.catatanRevisi || "",
      certificate: item.certificate,
      skFile: item.skFile,
    }));

    // Gabungkan dengan seed data default
    const merged = [...normalizedStored];
    allValidasiData.forEach((d) => {
      if (!merged.some((m) => m.id === d.id)) {
        merged.push({
          ...d,
          catatanRevisi: d.catatanRevisi || "",
        });
      }
    });

    setData(merged);
  }, []);

  // Update data & sync balik ke localStorage jika milik Hanifa
  const syncAndSetData = (newData) => {
    setData(newData);

    const stored = localStorage.getItem("skpi_kegiatan");
    if (stored) {
      try {
        let storedList = JSON.parse(stored);
        const updatedStoredList = storedList.map((sItem) => {
          const match = newData.find((u) => u.id === sItem.id);
          if (match) {
            return {
              ...sItem,
              status: match.statusValidasi,
              catatanRevisi: match.catatanRevisi || "",
              poin: match.poin,
            };
          }
          return sItem;
        });
        localStorage.setItem("skpi_kegiatan", JSON.stringify(updatedStoredList));
      } catch (e) {
        console.error("Gagal sinkronisasi data", e);
      }
    }
  };

  // ---- Handlers ----
  // Buka modal validasi poin
  const handleApprove = (item) => {
    setApproveItem(item);
  };

  // Konfirmasi setelah poin diisi
  const handleApproveConfirm = (poin) => {
    const updated = data.map((d) =>
      d.id === approveItem.id ? { ...d, statusValidasi: "Divalidasi", poin } : d
    );
    syncAndSetData(updated);
    setApproveItem(null);
  };

  const handleTolakConfirm = (type, catatanRevisi) => {
    const updated = data.map((d) =>
      d.id === tolakItem.id
        ? { ...d, statusValidasi: type === "Ditangguhkan" ? "Ditangguhkan" : "Ditolak", catatanRevisi }
        : d
    );
    syncAndSetData(updated);
    setTolakItem(null);
  };

  // ---- Filter data ----
  const filteredData = data.filter((item) => {
    if (item.kategori === "Karya") return false;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.npm.includes(q) ||
      item.kegiatan.toLowerCase().includes(q);
    const matchKategori =
      filterKategori === "Semua Kategori" || item.kategori === filterKategori;
    const matchStatus =
      filterStatus === "Semua Status" || item.statusValidasi === filterStatus;
    return matchSearch && matchKategori && matchStatus;
  });

  // ---- Hitung jumlah total kegiatan per mahasiswa (NPM) untuk info tambahan ----
  const totalKegiatanMap = {};
  filteredData.forEach((item) => {
    totalKegiatanMap[item.npm] = (totalKegiatanMap[item.npm] || 0) + 1;
  });

  // ---- Data kegiatan mahasiswa terpilih ----
  const dataPerMahasiswa = selectedMahasiswa
    ? data.filter((d) => d.npm === selectedMahasiswa.npm)
    : [];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <SidebarAdmin />

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6 overflow-y-auto">
        {/* HEADER — berubah sesuai konteks */}
        <div className="mt-7">
          {selectedMahasiswa ? (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[#0F172A] font-poppins">
                  Validasi Kegiatan Mahasiswa
                </h1>
                <span className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 font-poppins flex items-center gap-1.5">
                  <Clock size={14} />
                  {(() => {
                    const perlu = data.filter(d => d.npm === selectedMahasiswa.npm && d.statusValidasi !== "Divalidasi" && d.statusValidasi !== "Ditolak").length;
                    return `${perlu} menunggu tindakan`;
                  })()}
                </span>
              </div>
              <p className="text-[#64748B] mt-1 font-poppins">
                Tinjau dan tetapkan status kegiatan yang diajukan mahasiswa.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[#0F172A] font-poppins">
                Validasi Kegiatan Mahasiswa
              </h1>
              <p className="text-[#64748B] mt-1 font-poppins">
                Tinjau dan tetapkan status kegiatan yang diajukan mahasiswa.
              </p>
            </>
          )}
        </div>

        {/* ================================================
            TAMPILAN DETAIL PER MAHASISWA
        ================================================ */}
        {selectedMahasiswa ? (
          (() => {
            const isLocked = localStorage.getItem(`skpi_lock_${selectedMahasiswa.npm}`) === "true";
            const mhsData = data.filter((d) => d.npm === selectedMahasiswa.npm && d.kategori !== "Karya");
            const totalPoin = mhsData.filter((d) => d.statusValidasi === "Divalidasi").reduce((s, d) => s + (d.poin || 0), 0);
            const totalDivalidasi = mhsData.filter((d) => d.statusValidasi === "Divalidasi").length;
            const totalPerlu = mhsData.filter((d) => d.statusValidasi !== "Divalidasi" && d.statusValidasi !== "Ditolak").length;
            const totalKegiatan = mhsData.length;
            return (
              <>
                {/* Back link */}
                <button
                  onClick={() => setSelectedMahasiswa(null)}
                  className="mt-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-poppins"
                >
                  <ChevronLeft size={16} />
                  Kembali ke Validasi Kegiatan
                </button>

                {/* Kartu info mahasiswa (desain baru) */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-4 border border-gray-100 flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shrink-0 font-poppins">
                        <User size={22} />
                      </div>
                      <div>
                        <h2 className="text-[17px] font-bold text-[#0F172A] font-poppins">{selectedMahasiswa.nama}</h2>
                        <p className="text-xs text-[#64748B] mt-0.5 font-poppins">{selectedMahasiswa.npm} · {selectedMahasiswa.programStudi}</p>
                      </div>
                    </div>

                    {/* Tombol & Status kunci SKPI */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border font-poppins flex items-center gap-1.5 ${isLocked ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" : "bg-[#ECFDF5] text-[#049D71] border-[#A7F3D0]"
                        }`}>
                        {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                        {isLocked ? "SKPI final terkunci" : "SKPI final terbuka"}
                      </span>
                      <button
                        onClick={() => {
                          localStorage.setItem(`skpi_lock_${selectedMahasiswa.npm}`, String(!isLocked));
                          setLockTrigger((prev) => prev + 1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-200 active:scale-[0.98] font-poppins shadow-sm ${isLocked ? "bg-white hover:bg-gray-50 text-slate-700 border border-gray-200" : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                          }`}
                      >
                        {isLocked ? <><Unlock size={14} /> Buka kunci</> : <><Lock size={14} /> Kunci SKPI final</>}
                      </button>
                    </div>
                  </div>

                  {/* Keterangan status (di dalam card) */}
                  <p className="text-[13px] text-[#64748B] font-poppins">
                    {isLocked
                      ? "Transkrip terkunci — mahasiswa tidak dapat menambah atau mengubah kegiatan, dan validasi baru tidak diproses."
                      : "Transkrip terbuka — mahasiswa masih dapat mengajukan kegiatan baru."}
                  </p>
                </div>

                {/* 4 Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  {/* Total Poin */}
                  <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 font-poppins flex items-center gap-1">
                      <Award size={13} className="text-white" /> Total Poin
                    </p>
                    <p className="text-4xl font-extrabold mt-2 font-poppins">{totalPoin}</p>
                    <Award size={72} className="absolute -right-2 -bottom-2 text-white/10 pointer-events-none" />
                  </div>
                  {/* Divalidasi */}
                  <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 font-poppins flex items-center gap-1">
                      <CheckCircle size={13} className="text-white" /> Divalidasi
                    </p>
                    <p className="text-4xl font-extrabold mt-2 font-poppins">{totalDivalidasi}</p>
                    <CheckCircle size={72} className="absolute -right-2 -bottom-2 text-white/10 pointer-events-none" />
                  </div>
                  {/* Perlu Ditindaklanjuti */}
                  <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 font-poppins flex items-center gap-1">
                      <Clock size={13} className="text-white" /> Perlu Ditindaklanjuti
                    </p>
                    <p className="text-4xl font-extrabold mt-2 font-poppins">{totalPerlu}</p>
                    <Clock size={72} className="absolute -right-2 -bottom-2 text-white/10 pointer-events-none" />
                  </div>
                  {/* Total Kegiatan */}
                  <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 font-poppins flex items-center gap-1">
                      <FileText size={13} className="text-white" /> Total Kegiatan
                    </p>
                    <p className="text-4xl font-extrabold mt-2 font-poppins">{totalKegiatan}</p>
                    <FileText size={72} className="absolute -right-2 -bottom-2 text-white/10 pointer-events-none" />
                  </div>
                </div>

                {/* Tabel kegiatan */}
                <div className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#0F172A] text-[15px] font-poppins">Kegiatan</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-poppins">
                      {mhsData.length} kegiatan
                    </p>
                  </div>
                  <TabelKegiatan
                    data={mhsData}
                    onLihatSertifikat={setSertifikatItem}
                    onEdit={setEditItem}
                    onApprove={handleApprove}
                    onTolak={setTolakItem}
                    isLocked={isLocked}
                  />
                </div>
              </>
            );
          })()
        ) : (
          <>
            {/* ================================================
                TAMPILAN UTAMA — SEMUA MAHASISWA
            ================================================ */}

            {/* FILTER */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mt-6">
              <div className="flex items-center gap-2 text-sm text-[#475569] font-medium mb-4">
                <Filter size={16} />
                Filter &amp; Pencarian
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, NPM, atau kegiatan..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-[#2563EB] transition-colors placeholder:text-[#94A3B8]"
                  />
                </div>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm text-[#475569] focus:border-[#2563EB] cursor-pointer"
                >
                  <option>Semua Kategori</option>
                  <option>Lomba</option>
                  <option>Seminar</option>
                  <option>Organisasi</option>
                  <option>Pelatihan</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm text-[#475569] focus:border-[#2563EB] cursor-pointer"
                >
                  <option>Semua Status</option>
                  <option>Divalidasi</option>
                  <option>Ditangguhkan</option>
                  <option>Ditolak</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-gray-100">
                    <tr className="text-left text-[12px] text-[#64748B] font-semibold tracking-wide">
                      <th className="px-6 py-4">MAHASISWA</th>
                      <th className="px-6 py-4">KEGIATAN</th>
                      <th className="px-6 py-4">KATEGORI</th>
                      <th className="px-6 py-4">POIN</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4">DETAIL</th>
                      <th className="px-6 py-4 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-gray-400 text-sm"
                        >
                          Tidak ada data yang sesuai
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => {
                        const isRowLocked = localStorage.getItem(`skpi_lock_${item.npm}`) === "true";
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            {/* MAHASISWA — klik nama untuk lihat semua sertifikatnya */}
                            <td className="px-6 py-5">
                              <button
                                onClick={() =>
                                  setSelectedMahasiswa({
                                    npm: item.npm,
                                    nama: item.nama,
                                    programStudi: item.programStudi,
                                    statusMahasiswa: item.statusMahasiswa,
                                  })
                                }
                                className="text-left group"
                              >
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-[#0F172A] text-sm group-hover:text-blue-600 transition">
                                    {item.nama}
                                  </p>
                                  {isRowLocked && (
                                    <span className="text-red-500" title="SKPI Terkunci (Final)">
                                      <Lock size={12} />
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                  {item.npm}
                                </p>
                                {totalKegiatanMap[item.npm] > 1 && (
                                  <p className="text-[11px] text-blue-400 mt-0.5">
                                    {totalKegiatanMap[item.npm]} kegiatan
                                  </p>
                                )}
                              </button>
                            </td>

                            {/* KEGIATAN */}
                            <td className="px-6 py-5">
                              <p className="text-sm text-[#0F172A] font-medium">
                                {item.kegiatan}
                              </p>
                              <p className="text-xs text-[#94A3B8] mt-0.5">
                                {item.tanggal}
                              </p>
                              {item.catatanRevisi && item.statusValidasi === "Ditangguhkan" && (
                                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1 font-poppins inline-block">
                                  Revisi: {item.catatanRevisi}
                                </p>
                              )}
                            </td>

                            {/* KATEGORI */}
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${KATEGORI_CLASS_MAP[item.kategori] || "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]"}`}>
                                {item.kategori}
                              </span>
                            </td>

                            {/* POIN */}
                            <td className="px-6 py-5 text-sm text-[#0F172A]">
                              {item.poin}
                            </td>

                            {/* STATUS */}
                            <td className="px-6 py-5">
                              <StatusBadge status={item.statusValidasi} />
                            </td>

                            {/* SERTIFIKAT */}
                            <td className="px-6 py-5">
                              <button
                                onClick={() => setSertifikatItem(item)}
                                className="flex items-center gap-1 text-[#2563EB] text-sm hover:underline font-poppins"
                              >
                                <Eye size={15} />
                                Tampilkan
                              </button>
                            </td>

                            {/* AKSI */}
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditItem(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Edit"))}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleApprove(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center hover:bg-[#059669] transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Validasi"))}
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => setTolakItem(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center hover:bg-[#FCA5A5] hover:text-[#B91C1C] transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Tolak / Tangguhkan"))}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer tabel */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Menampilkan {filteredData.length} kegiatan dari{" "}
                  {allValidasiData.length} total kegiatan
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL SERTIFIKAT */}
      {sertifikatItem && (
        <ModalSertifikat item={sertifikatItem} onClose={() => setSertifikatItem(null)} />
      )}

      {/* MODAL VALIDASI POIN */}
      {approveItem && (
        <ModalValidasiPoin
          item={approveItem}
          onClose={() => setApproveItem(null)}
          onConfirm={handleApproveConfirm}
        />
      )}

      {/* MODAL TOLAK ATAU TANGGUHKAN */}
      {tolakItem && (
        <ModalTolakDanTangguhkan
          item={tolakItem}
          onClose={() => setTolakItem(null)}
          onConfirm={handleTolakConfirm}
        />
      )}

      {/* MODAL EDIT */}
      {editItem && (
        <ModalEdit item={editItem} onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}