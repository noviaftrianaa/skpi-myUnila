// src/pages/admin/Validasi.jsx

import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import {
  Search,
  Eye,
  Check,
  CheckCircle,
  X,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Pencil,
  Upload,
  Lock,
  Unlock,
  Clock,
  XCircle,
  Filter,
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
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
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
              Lampiran Dokumen
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
              className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20"
              style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
            >
              <Download size={16} />
              Unduh
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8 bg-[#F1F5F9]">
            {item.certificate ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-gray-600">Sertifikat</p>
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
                <p>Gambar / PDF Sertifikat ({item.kegiatan})</p>
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
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                type === "Ditangguhkan"
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
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                type === "Ditolak"
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
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition font-poppins ${
              type === "Ditangguhkan"
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
// MODAL EDIT KEGIATAN
// ======================================================

function ModalEdit({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-[#0F172A]">Ubah Kegiatan</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Perbarui detail kegiatan
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Judul Kegiatan
            </label>
            <input
              defaultValue={item?.kegiatan}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Tautan Sertifikat
            </label>
            <input
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Kategori
            </label>
            <select
              defaultValue={item?.kategori}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option>Lomba</option>
              <option>Seminar</option>
              <option>Organisasi</option>
              <option>Pelatihan</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Dokumen Pendukung
            </label>
            <div className="w-full h-[42px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-xs text-blue-500 cursor-pointer hover:bg-gray-50">
              <Upload size={14} />
              Klik untuk unggah atau tarik file ke sini
            </div>
            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Tingkatan
            </label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none">
              <option>Nasional</option>
              <option>Internasional</option>
              <option>Regional</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Nomor Sertifikat
            </label>
            <input
              placeholder="Nomor sertifikat..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Tahun
            </label>
            <input
              defaultValue={item?.tanggal?.slice(0, 4)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Tanggal Sertifikat
            </label>
            <input
              type="date"
              defaultValue={item?.tanggal}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            className="px-5 py-2.5 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90 shadow-sm"
            style={{ background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" }}
          >
            Simpan Perubahan
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
  Seminar:     "border-[#D8B4FE] bg-[#F3E8FF] text-[#6D28D9]",
  Lomba:       "border-[#BAE6FD] bg-[#E0F2FE] text-[#0EA5E9]",
  Organisasi:  "border-[#99F6E4] bg-[#E6F4F4] text-[#3AB8BA]",
  Kepanitiaan: "border-[#BBF7D0] bg-[#DCFCE7] text-[#10B981]",
  Pelatihan:   "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
  Publikasi:   "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
  Karya:       "border-[#FDE68A] bg-[#FEF3C7] text-[#F59E0B]",
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
            <th className="px-6 py-4">DETAIL</th>
            <th className="px-6 py-4">STATUS</th>
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
              <td className="px-6 py-4 text-sm text-[#0F172A]">{item.poin}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onLihatSertifikat(item)}
                  className="flex items-center gap-1 text-sky-500 text-sm hover:underline"
                >
                  <Eye size={15} />
                  Tampilkan
                </button>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={item.statusValidasi} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onApprove(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Validasi"))}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => onTolak(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Tolak / Tangguhkan"))}
                  >
                    <X size={15} />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    disabled={isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                    className={`w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition ${isLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={isLocked ? "SKPI Mahasiswa Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Edit"))}
                  >
                    <Pencil size={14} />
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
  const handleApprove = (item) => {
    const updated = data.map((d) =>
      d.id === item.id ? { ...d, statusValidasi: "Divalidasi", poin: item.poin || 15 } : d
    );
    syncAndSetData(updated);
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
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TOPBAR */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMahasiswa(null); // reset ke tampilan semua saat search
              }}
              placeholder="Cari Kegiatan atau Mahasiswa..."
              className="bg-transparent outline-none w-full ml-3 text-sm"
            />
          </div>
        </div>

        {/* HEADER */}
        <div className="mt-7">
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Validasi Kegiatan Mahasiswa
          </h1>
          <p className="text-[#64748B] mt-1">
            Pantau dan validasi aktivitas mahasiswa.
          </p>
        </div>

        {/* ================================================
            TAMPILAN DETAIL PER MAHASISWA
        ================================================ */}
        {selectedMahasiswa ? (
          (() => {
            const isLocked = localStorage.getItem(`skpi_lock_${selectedMahasiswa.npm}`) === "true";
            return (
              <>
                <button
                  onClick={() => setSelectedMahasiswa(null)}
                  className="mt-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <ChevronLeft size={16} />
                  Kembali ke semua mahasiswa
                </button>

                {/* Kartu info mahasiswa */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
                    {[
                      ["Nama", selectedMahasiswa.nama],
                      ["NPM", selectedMahasiswa.npm],
                      ["Program Studi", selectedMahasiswa.programStudi],
                      ["Status", selectedMahasiswa.statusMahasiswa],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-gray-500 w-32 flex-shrink-0">
                          {label}
                        </span>
                        <span className="text-[#0F172A] font-medium">
                          : {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* PANEL KUNCI / UNLOCK SKPI */}
                  <div className="p-4 rounded-xl flex items-center gap-4 bg-gray-50 border border-gray-200 shrink-0">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {isLocked ? (
                          <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                            <Lock size={14} /> Terkunci (Final)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                            <Unlock size={14} /> Draf (Terbuka)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                        {isLocked
                          ? "Transkrip SKPI final diterbitkan. Mahasiswa tidak dapat mengubah data."
                          : "Mahasiswa masih diperbolehkan menambah dan mengedit kegiatan."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const nextLockState = !isLocked;
                        localStorage.setItem(`skpi_lock_${selectedMahasiswa.npm}`, String(nextLockState));
                        setLockTrigger((prev) => prev + 1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition active:scale-[0.98] text-white ${
                        isLocked ? "bg-amber-500 hover:bg-amber-600" : "hover:opacity-90 shadow-sm"
                      }`}
                      style={!isLocked ? { background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)" } : {}}
                    >
                      {isLocked ? (
                        <>
                          <Unlock size={14} /> Buka Kunci
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Kunci &amp; Terbitkan
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tabel semua kegiatan mahasiswa tersebut */}
                <div className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden">
                  <TabelKegiatan
                    data={dataPerMahasiswa}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NPM atau kegiatan..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm"
                />
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm text-gray-500"
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
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm text-gray-500"
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
                      <th className="px-6 py-4">DETAIL</th>
                      <th className="px-6 py-4">STATUS</th>
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

                            {/* SERTIFIKAT */}
                            <td className="px-6 py-5">
                              <button
                                onClick={() => setSertifikatItem(item)}
                                className="flex items-center gap-1 text-sky-500 text-sm hover:underline"
                              >
                                <Eye size={15} />
                                Tampilkan
                              </button>
                            </td>

                            {/* STATUS */}
                            <td className="px-6 py-5">
                              <StatusBadge status={item.statusValidasi} />
                            </td>

                            {/* AKSI */}
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleApprove(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Validasi"))}
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => setTolakItem(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Tolak / Tangguhkan"))}
                                >
                                  <X size={15} />
                                </button>
                                <button
                                  onClick={() => setEditItem(item)}
                                  disabled={isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan"}
                                  className={`w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition ${isRowLocked || item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" || item.statusValidasi === "Diarsipkan" ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  title={isRowLocked ? "SKPI Terkunci (Final)" : (item.statusValidasi === "Divalidasi" || item.statusValidasi === "Ditolak" ? "Tidak dapat diubah (Sudah Final)" : (item.statusValidasi === "Diarsipkan" ? "Tidak perlu divalidasi" : "Edit"))}
                                >
                                  <Pencil size={14} />
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