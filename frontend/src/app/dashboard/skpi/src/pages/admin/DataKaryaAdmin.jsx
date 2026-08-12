// src/pages/dosen/DashboardDosen.jsx

import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import {
  Search,
  Eye,
  Award,
  Users,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  GraduationCap,
  MapPin,
  FileText
} from "lucide-react";

// ============================================================================
// DATA MAHASISWA & KEGIATAN SIMULASI (SEED DATA)
// ============================================================================
const DEFAULT_BIMBINGAN = [
  {
    id: 999,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "Desain UI/UX Aplikasi Akademik MyUnila",
    date: "2025-11-20",
    location: "-",
    kategori: "Karya",
    bentukKarya: "Karya Seni / Desain",
    tautanSertifikat: "https://dribbble.com/contoh-karya",
    status: "Menunggu",
    poin: null,
    certificate: null,
  },
  {
    id: 101,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "National Hackathon 2025",
    date: "2025-10-15",
    location: "Institut Teknologi Bandung",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Ditangguhkan",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 102,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "International Robotics Competition 2025",
    date: "2025-11-05",
    location: "Singapore Exhibition Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Menunggu",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 103,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    title: "National Game Dev Contest",
    date: "2025-10-20",
    location: "Universitas Indonesia",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 20,
    certificate: "/Sertifikat.png",
  },
  {
    id: 104,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    title: "Regional Line Follower Competition",
    date: "2025-10-25",
    location: "Universitas Lampung",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Peserta",
    pembimbing: "Prof. Dr. Ir. Suharno, M.S.",
    status: "Menunggu",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 105,
    nama: "Eko Prasetyo",
    npm: "202110005",
    programStudi: "Sistem Informasi",
    title: "Competitive Programming Unila",
    date: "2025-10-10",
    location: "FMIPA Unila",
    kategori: "Lomba",
    tingkatan: "Jurusan",
    jabatan: "Peserta",
    pembimbing: "Dr. Ryan Randy Suryono",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 5,
    certificate: null,
  },
  {
    id: 106,
    nama: "Dewi Lestari",
    npm: "202110004",
    programStudi: "Teknik Informatika",
    title: "National Smart City Competition",
    date: "2025-09-18",
    location: "Institut Teknologi Sepuluh Nopember",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Anggota",
    pembimbing: "Ahmad Zakaria, Ph.D.",
    status: "Ditolak",
    statusColor: "text-[#DC2626] bg-[#FEE2E2]",
    dot: "bg-[#DC2626]",
    poin: null,
    certificate: null,
  },
  {
    id: 107,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    title: "International Web Design Competition",
    date: "2025-11-12",
    location: "Online",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 25,
    certificate: null,
  },
  {
    id: 108,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    title: "National Business Plan Competition",
    date: "2025-08-15",
    location: "Universitas Gadjah Mada",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 20,
    certificate: null,
  },
  {
    id: 109,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "International IoT Challenge",
    date: "2025-07-20",
    location: "Kuala Lumpur Convention Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 25,
    certificate: null,
  },
  {
    id: 110,
    nama: "Dai Hakiki",
    npm: "202110011",
    programStudi: "Teknik Informatika",
    title: "National Cyber Security CTF",
    date: "2025-09-05",
    location: "Universitas Brawijaya",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Anggota",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 15,
    certificate: null,
  },
  {
    id: 111,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    title: "Regional UI/UX Design Competition",
    date: "2025-06-12",
    location: "Universitas Padjadjaran",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 10,
    certificate: null,
  }
];

const LIST_DOSEN = [
  "Dr. Eng. Admi Syarif",
  "Prof. Dr. Ir. Suharno, M.S.",
  "Ahmad Zakaria, Ph.D.",
  "Dr. Ryan Randy Suryono"
];

// ============================================================================
// MODAL DETAIL PRESTASI (BIMBINGAN DETAIL)
// ============================================================================
function DetailBimbinganModal({ student, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeActivity, setActiveActivity] = useState(student.kegiatanList[0]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* SISI KIRI: DATA DETAIL */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-[#E5E7EB]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Detail Karya Mahasiswa
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-2 font-poppins">
                {student.nama}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 md:hidden bg-gray-100 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profil Mahasiswa */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] mb-6">
            <h3 className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wide font-poppins flex items-center gap-2">
              <GraduationCap size={16} className="text-[#1D4ED8]" />
              Profil Mahasiswa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-[#94A3B8] text-xs font-medium font-poppins">NPM</p>
                <p className="font-semibold text-[#0F172A] font-poppins">{student.npm}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs font-medium font-poppins">Program Studi</p>
                <p className="font-semibold text-[#0F172A] font-poppins">{student.programStudi}</p>
              </div>
            </div>
          </div>

          {/* Detail Aktivitas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#374151] uppercase tracking-wide font-poppins flex items-center gap-2 border-b pb-2">
              <Award size={16} className="text-[#1D4ED8]" />
              Daftar Karya Mahasiswa
            </h3>
            
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Judul Karya</th>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Bentuk Karya</th>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Tautan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {student.kegiatanList.map(keg => (
                    <tr 
                      key={keg.id} 
                      onClick={() => setActiveActivity(keg)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${activeActivity.id === keg.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}
                    >
                      <td className="p-3 font-medium text-[#0F172A] max-w-[200px] truncate">{keg.title}</td>
                      <td className="p-3 text-xs">{keg.bentukKarya || '-'}</td>
                      <td className="p-3 font-semibold max-w-[100px] truncate">
                        <a href={keg.tautanSertifikat || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          Link
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Detail Ekstra untuk Kegiatan Aktif */}
          <div className="mt-6 bg-[#F1F5F9] rounded-2xl p-4 border border-[#E2E8F0]">
            <h4 className="text-xs font-bold text-[#475569] uppercase mb-2 font-poppins">
              Info Karya: {activeActivity.title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#64748B] text-xs">Kategori</p>
                <p className="font-medium text-[#0F172A]">{activeActivity.kategori || "-"}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-xs">Bentuk Karya</p>
                <p className="font-medium text-[#0F172A]">{activeActivity.bentukKarya || "Aplikasi / Perangkat Lunak"}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-xs">Tanggal Pembuatan</p>
                <p className="font-medium text-[#0F172A]">{activeActivity.date || "-"}</p>
              </div>
              <div className="col-span-2 mt-2 pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#64748B] text-xs">Tautan Karya / Portofolio</p>
                <a href={activeActivity.tautanSertifikat || "#"} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline break-all">
                  {activeActivity.tautanSertifikat || "-"}
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* SISI KANAN: PREVIEW DOKUMEN / SERTIFIKAT */}
        <div className="flex-1 bg-[#F8FAFC] flex flex-col relative">
          <div className="px-6 md:px-8 py-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0 font-poppins">
            <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
              <span className="text-blue-600">📄</span>
              Lampiran Pendukung ({activeActivity.title})
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 md:px-8 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center gap-4 bg-white shrink-0 font-poppins">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomOut size={16} />
              Perkecil
            </button>
            <span className="text-[13px] font-bold text-[#94A3B8] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ZoomIn size={16} />
              Perbesar
            </button>
            <div className="w-px h-4 bg-[#E2E8F0]"></div>
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <RotateCw size={16} />
              Putar
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center gap-8 bg-[#F1F5F9] min-h-[300px]">
            {activeActivity.certificate ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-gray-600 font-poppins">
                  Lampiran Pendukung
                </p>
                {activeActivity.certificate.startsWith("data:application/pdf") ? (
                  <iframe
                    src={activeActivity.certificate}
                    style={{
                      width: "100%",
                      height: "400px",
                      transform: `scale(${zoom})`,
                      transformOrigin: "top center",
                    }}
                    className="shadow-sm border border-gray-200 bg-white"
                  />
                ) : (
                  <img
                    src={activeActivity.certificate}
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
          </div>

          {/* SISI KANAN FOOTER */}
          <div className="px-6 md:px-8 py-4 border-t border-[#E2E8F0] flex items-center justify-end bg-white shrink-0">
            <button
              disabled={!activeActivity.certificate}
              onClick={() => {
                if (activeActivity.certificate) {
                  const link = document.createElement("a");
                  link.href = activeActivity.certificate;
                  link.download = `${student.nama}.png`;
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

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function DataKaryaAdmin() {
  const [bimbinganList, setBimbinganList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBimbingan, setSelectedBimbingan] = useState(null);

  useEffect(() => {
    let allData = [...DEFAULT_BIMBINGAN];
    
    try {
      const raw = localStorage.getItem("skpi_kegiatan");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Tambahkan identitas mahasiswa karena data localStorage tidak memiliki field ini
        const studentData = parsed.map(item => ({
          ...item,
          nama: "Hanifa Sophia",
          npm: "2020021001",
          programStudi: "Teknik Elektro",
        }));
        
        // Gantikan data default milik Hanifa dengan data aktual dari localStorage
        allData = [
          ...DEFAULT_BIMBINGAN.filter(d => d.npm !== "2020021001"),
          ...studentData
        ];
      }
    } catch (e) {
      console.error("Gagal memuat data dari localStorage", e);
    }

    const filtered = allData.filter(
      (item) => item.kategori === "Karya"
    );

    setBimbinganList(filtered);
  }, []);

  // Filter Data
  const groupedBimbinganMap = bimbinganList.reduce((acc, item) => {
    const query = (search || "").toLowerCase();
    const match = 
      (item.nama || "").toLowerCase().includes(query) ||
      (item.npm || "").toLowerCase().includes(query) ||
      (item.title || "").toLowerCase().includes(query);

    if (match) {
      if (!acc[item.npm]) {
        acc[item.npm] = {
          nama: item.nama,
          npm: item.npm,
          programStudi: item.programStudi,
          kegiatanList: [],
          totalPoin: 0,
        };
      }
      acc[item.npm].kegiatanList.push(item);
      acc[item.npm].totalPoin += (item.poin || 0);
    }
    return acc;
  }, {});

  const groupedBimbinganList = Object.values(groupedBimbinganMap);

  // Hitung stats — dosen hanya melihat yang sudah divalidasi
  const totalMahasiswa = groupedBimbinganList.length;
  const totalKegiatan = groupedBimbinganList.reduce((sum, m) => sum + m.kegiatanList.length, 0);

  const statCards = [
    {
      label: "TOTAL MAHASISWA",
      value: totalMahasiswa,
      icon: <Users size={16} />,
      bgGradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      shadow: "shadow-blue-500/20",
      watermarkIcon: <Users size={76} />,
    },
    {
      label: "TOTAL KARYA",
      value: totalKegiatan,
      icon: <FileText size={16} />,
      bgGradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
      shadow: "shadow-purple-500/20",
      watermarkIcon: <FileText size={76} />,
    },
  ];

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <SidebarAdmin />

      {/* DETAIL MODAL OVERLAY */}
      {selectedBimbingan && (
        <DetailBimbinganModal
          student={selectedBimbingan}
          onClose={() => setSelectedBimbingan(null)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">

        <div className="mb-8">
          <h1 className="font-poppins font-bold text-[26px] leading-[38px] text-[#0F172A]">
            Data Karya Mahasiswa
          </h1>
          <p className="mt-1 font-poppins font-normal text-[15px] leading-[22px] text-[#94A3B8]">
            Lihat dan telusuri karya dan portofolio yang diunggah mahasiswa.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${card.shadow} transition-all duration-300 hover:scale-[1.02] text-white flex flex-col justify-between min-h-[110px]`}
              style={{ background: card.bgGradient }}
            >
              {/* Header Icon + Label */}
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-white/90 uppercase font-poppins z-10">
                {card.icon}
                <span>{card.label}</span>
              </div>

              {/* Value */}
              <div className="mt-3 z-10">
                <div className="font-poppins font-black text-[32px] leading-none text-white tracking-tight">
                  {card.value}
                </div>
              </div>

              {/* Watermark Icon (Top Right) */}
              <div className="absolute -right-3 -top-3 text-white/20 pointer-events-none select-none z-0">
                {card.watermarkIcon}
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FCFDFE]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#374151] font-poppins">
              <Search size={16} className="text-[#1D4ED8]" />
              Cari Mahasiswa
            </div>
            
            <div className="relative w-full md:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NPM, atau karya..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8] transition-colors font-poppins text-[#0F172A]"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins border-b border-[#F1F5F9]">
                  <th className="py-4 px-6 text-center w-12">No</th>
                  <th className="py-4 px-6">Mahasiswa</th>
                  <th className="py-4 px-6">Program Studi</th>
                  <th className="py-4 px-6 text-center">Jumlah Kegiatan</th>
                  <th className="py-4 px-6 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {groupedBimbinganList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[#94A3B8] font-poppins text-sm bg-white">
                      Belum ada mahasiswa yang mengajukan karya.
                    </td>
                  </tr>
                ) : (
                  groupedBimbinganList.map((student, idx) => (
                    <tr key={student.npm} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 text-center text-xs font-semibold text-gray-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-[#0F172A] font-poppins">
                            {student.nama}
                          </span>
                          <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5 mb-1">
                            {student.npm}
                          </span>
                          <span className="text-[13px] font-medium text-[#60A5FA]">
                            {student.kegiatanList.length} kegiatan
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-sm text-gray-800 font-poppins">
                          {student.programStudi}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-poppins">
                          {student.kegiatanList.length} Karya
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedBimbingan(student)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98] font-poppins"
                        >
                          <Eye size={14} />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-6 border-t border-[#F1F5F9] flex justify-between items-center text-xs text-[#94A3B8] font-poppins bg-[#FCFDFE]">
            <div>
              Menampilkan {groupedBimbinganList.length} mahasiswa.
            </div>
            <div className="font-semibold text-gray-500">
              Sistem Validasi SKPI Universitas Lampung
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
