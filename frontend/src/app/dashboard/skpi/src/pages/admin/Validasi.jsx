// src/pages/admin/Validasi.jsx

import { useState } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import {
  Search,
  Bell,
  Filter,
  Eye,
  Check,
  X,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Pencil,
  Upload,
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
  const style =
    status === "Divalidasi"
      ? "bg-green-100 text-green-600"
      : status === "Ditangguhkan"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-red-100 text-red-600";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

// ======================================================
// MODAL PRATINJAU SERTIFIKAT
// ======================================================

function ModalSertifikat({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[16px] font-semibold text-[#0F172A]">
            Pratinjau Sertifikat
          </h3>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0F172A]"
          >
            <X size={20} />
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[#E5E7EB]">
          <button className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8]">
            <ZoomOut size={15} />
            Perkecil
          </button>

          <span className="text-[13px] text-[#94A3B8]">100%</span>

          <button className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8]">
            <ZoomIn size={15} />
            Perbesar
          </button>

          <button className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#1D4ED8]">
            <RotateCw size={15} />
            Rotate
          </button>

          <div className="flex-1" />

          <button
            className="
              flex items-center gap-2
              text-white px-4 py-1.5
              rounded-lg text-[13px] font-medium
            "
            style={{
              background:
                "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)",
            }}
          >
            <Download size={14} />
            Unduh
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-80 flex items-center justify-center bg-[#F8FAFC] m-4 rounded-xl border border-[#E2E8F0]">
          <p className="text-[#94A3B8] text-[14px]">
            Tidak ada sertifikat yang diunggah
          </p>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MODAL TOLAK KEGIATAN
// ======================================================

function ModalTolak({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0F172A] text-sm">
              Tolak Kegiatan
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Apakah Anda yakin ingin menolak aktivitas ini?
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Batalkan
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Tolak Kegiatan
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
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700">
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

function TabelKegiatan({ data, onLihatSertifikat, onEdit, onApprove, onTolak }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F8FAFC] border-b border-gray-100">
          <tr className="text-left text-[12px] text-[#64748B] font-semibold tracking-wide">
            <th className="px-6 py-4">KEGIATAN</th>
            <th className="px-6 py-4">KATEGORI</th>
            <th className="px-6 py-4">POIN</th>
            <th className="px-6 py-4">SERTIFIKAT</th>
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
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs">
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
                    className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                    title="Validasi"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => onTolak(item)}
                    className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition"
                    title="Tolak"
                  >
                    <X size={15} />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition"
                    title="Edit"
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
  const [data, setData] = useState(allValidasiData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  // null = tampilan semua mahasiswa, object = tampilan detail mahasiswa
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);

  // Modals
  const [sertifikatItem, setSertifikatItem] = useState(null);
  const [tolakItem, setTolakItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // ---- Handlers ----
  const handleApprove = (item) => {
    setData((prev) =>
      prev.map((d) =>
        d.id === item.id ? { ...d, statusValidasi: "Divalidasi" } : d
      )
    );
  };

  const handleTolakConfirm = () => {
    setData((prev) =>
      prev.map((d) =>
        d.id === tolakItem.id ? { ...d, statusValidasi: "Ditolak" } : d
      )
    );
    setTolakItem(null);
  };

  // ---- Filter data ----
  const filteredData = data.filter((item) => {
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

  // ---- Kelompokkan per mahasiswa untuk tabel utama ----
  // Ambil 1 baris per NPM (kegiatan pertama/terlama), tambah info totalKegiatan
  const mahasiswaMap = {};
  filteredData.forEach((item) => {
    if (!mahasiswaMap[item.npm]) {
      mahasiswaMap[item.npm] = { ...item, totalKegiatan: 0 };
    }
    mahasiswaMap[item.npm].totalKegiatan++;
  });
  const mahasiswaRows = Object.values(mahasiswaMap);

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
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full max-w-3xl">
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
          <>
            <button
              onClick={() => setSelectedMahasiswa(null)}
              className="mt-6 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ChevronLeft size={16} />
              Kembali ke semua mahasiswa
            </button>

            {/* Kartu info mahasiswa */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
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
            </div>

            {/* Tabel semua kegiatan mahasiswa tersebut */}
            <div className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden">
              <TabelKegiatan
                data={dataPerMahasiswa}
                onLihatSertifikat={setSertifikatItem}
                onEdit={setEditItem}
                onApprove={handleApprove}
                onTolak={setTolakItem}
              />
            </div>
          </>
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
                      <th className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-6 py-4">MAHASISWA</th>
                      <th className="px-6 py-4">KEGIATAN</th>
                      <th className="px-6 py-4">KATEGORI</th>
                      <th className="px-6 py-4">POIN</th>
                      <th className="px-6 py-4">SERTIFIKAT</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mahasiswaRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-12 text-gray-400 text-sm"
                        >
                          Tidak ada data yang sesuai
                        </td>
                      </tr>
                    ) : (
                      mahasiswaRows.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          {/* CHECKBOX */}
                          <td className="px-6 py-5">
                            <input type="checkbox" className="rounded" />
                          </td>

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
                              <p className="font-semibold text-[#0F172A] text-sm group-hover:text-blue-600 transition">
                                {item.nama}
                              </p>
                              <p className="text-xs text-[#94A3B8] mt-0.5">
                                {item.npm}
                              </p>
                              {item.totalKegiatan > 1 && (
                                <p className="text-[11px] text-blue-400 mt-0.5">
                                  {item.totalKegiatan} kegiatan
                                </p>
                              )}
                            </button>
                          </td>

                          {/* KEGIATAN */}
                          <td className="px-6 py-5">
                            <p className="text-sm text-[#0F172A]">
                              {item.kegiatan}
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">
                              {item.tanggal}
                            </p>
                          </td>

                          {/* KATEGORI */}
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs">
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
                                className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                                title="Validasi"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setTolakItem(item)}
                                className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition"
                                title="Tolak"
                              >
                                <X size={15} />
                              </button>
                              <button
                                onClick={() => setEditItem(item)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer tabel */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Menampilkan {mahasiswaRows.length} mahasiswa dari{" "}
                  {allValidasiData.length} total kegiatan
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL SERTIFIKAT */}
      {sertifikatItem && (
        <ModalSertifikat onClose={() => setSertifikatItem(null)} />
      )}

      {/* MODAL TOLAK */}
      {tolakItem && (
        <ModalTolak
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