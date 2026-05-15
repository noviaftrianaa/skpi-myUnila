import {
  FiBarChart2, FiUsers, FiUser, FiBook, FiGlobe, FiDollarSign, FiTrendingUp, FiMapPin, FiAward, FiUserCheck,
} from "react-icons/fi";
import { MdSchool, MdScience } from "react-icons/md";

export const dataUnilaMenuConfig = [
  {
    title: "Dashboard",
    href: "/dashboard/data-unila",
    icon: <FiBarChart2 className="w-4 h-4" />,
  },
  {
    title: "Data Mahasiswa",
    icon: <MdSchool className="w-4 h-4" />,
    children: [
      { title: "Daftar Mahasiswa", href: "/dashboard/data-unila/mahasiswa" },
      { title: "KTW", href: "/dashboard/data-unila/mahasiswa/ktw" },
      { title: "Aktivitas Mahasiswa", href: "/dashboard/data-unila/mahasiswa/aktivitas" },
      { title: "Ujian", href: "/dashboard/data-unila/mahasiswa/ujian" },
      { title: "Prestasi Mahasiswa", href: "/dashboard/data-unila/tridarma/prestasi" },
    ],
  },
  {
    title: "Data Dosen & Tendik",
    icon: <FiUsers className="w-4 h-4" />,
    children: [
      { title: "Daftar Dosen", href: "/dashboard/data-unila/dosen" },
      { title: "Jabatan Fungsional", href: "/dashboard/data-unila/dosen/jabfung" },
      { title: "Riwayat Pendidikan", href: "/dashboard/data-unila/dosen/pendidikan" },
      { title: "Riwayat Kepangkatan", href: "/dashboard/data-unila/dosen/kepangkatan" },
      { title: "Tugas Tambahan", href: "/dashboard/data-unila/dosen/tugas-tambahan" },
      { title: "Bimbingan Mahasiswa", href: "/dashboard/data-unila/dosen/bimbingan" },
      { title: "Riwayat Sertifikasi", href: "/dashboard/data-unila/dosen/sertifikasi" },
      { title: "Daftar Tendik", href: "/dashboard/data-unila/dosen/tendik" },
    ],
  },
  {
    title: "Data Tridarma",
    icon: <MdScience className="w-4 h-4" />,
    children: [
      { title: "Pengajaran", href: "/dashboard/data-unila/tridarma/pengajaran" },
      { title: "Penelitian", href: "/dashboard/data-unila/tridarma/penelitian" },
      { title: "Pengabdian", href: "/dashboard/data-unila/tridarma/pengabdian" },
      { title: "Publikasi", href: "/dashboard/data-unila/tridarma/publikasi" },
    ],
  },
  {
    title: "Data Akademik",
    icon: <FiBook className="w-4 h-4" />,
    children: [
      { title: "Program Studi", href: "/dashboard/data-unila/akademik/prodi" },
      { title: "Akreditasi", href: "/dashboard/data-unila/akademik/akreditasi" },
      { title: "Mata Kuliah", href: "/dashboard/data-unila/akademik/matkul" },
      { title: "Kurikulum", href: "/dashboard/data-unila/akademik/kurikulum" },
    ],
  },
  {
    title: "Data KKN",
    href: "/dashboard/data-unila/kkn",
    icon: <FiMapPin className="w-4 h-4" />,
  },
  {
    title: "Data Kerjasama",
    icon: <FiGlobe className="w-4 h-4" />,
    children: [
      { title: "Daftar MoU", href: "/dashboard/data-unila/kerjasama" },
      { title: "Mitra Riset & Industri", href: "/dashboard/data-unila/kerjasama/mitra" },
    ],
  },
  {
    title: "Data Keuangan",
    icon: <FiDollarSign className="w-4 h-4" />,
    children: [
      { title: "UKT", href: "/dashboard/data-unila/keuangan/ukt" },
      { title: "SPP", href: "/dashboard/data-unila/keuangan/spp" },
    ],
  },
  {
    title: "Data Lulusan",
    icon: <FiAward className="w-4 h-4" />,
    children: [
      { title: "Lulusan", href: "/dashboard/data-unila/mahasiswa/lulusan" },
      { title: "Tracer Study", href: "/dashboard/data-unila/tracer" },
      { title: "Survey Atasan", href: "/dashboard/data-unila/alumni/survey-atasan" },
    ],
  },
];
