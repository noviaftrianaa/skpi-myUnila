import {
  FiBarChart2, FiUsers, FiUser, FiBook, FiGlobe, FiDollarSign, FiTrendingUp,
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
      { title: "Lulusan", href: "/dashboard/data-unila/mahasiswa/lulusan" },
      { title: "Aktivitas Mahasiswa", href: "/dashboard/data-unila/mahasiswa/aktivitas" },
    ],
  },
  {
    title: "Data Dosen & SDM",
    icon: <FiUsers className="w-4 h-4" />,
    children: [
      { title: "Daftar Dosen", href: "/dashboard/data-unila/dosen" },
      { title: "Jabatan Fungsional", href: "/dashboard/data-unila/dosen/jabfung" },
      { title: "Sertifikasi", href: "/dashboard/data-unila/dosen/sertifikasi" },
    ],
  },
  {
    title: "Data Tridarma",
    icon: <MdScience className="w-4 h-4" />,
    children: [
      { title: "Penelitian", href: "/dashboard/data-unila/tridarma/penelitian" },
      { title: "Pengabdian", href: "/dashboard/data-unila/tridarma/pengabdian" },
      { title: "Publikasi", href: "/dashboard/data-unila/tridarma/publikasi" },
      { title: "Prestasi", href: "/dashboard/data-unila/tridarma/prestasi" },
    ],
  },
  {
    title: "Data Akademik",
    icon: <FiBook className="w-4 h-4" />,
    children: [
      { title: "Program Studi", href: "/dashboard/data-unila/akademik/prodi" },
      { title: "Akreditasi", href: "/dashboard/data-unila/akademik/akreditasi" },
      { title: "Mata Kuliah", href: "/dashboard/data-unila/akademik/matkul" },
    ],
  },
  {
    title: "Data Kerjasama",
    href: "/dashboard/data-unila/kerjasama",
    icon: <FiGlobe className="w-4 h-4" />,
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
    title: "Tracer Study",
    href: "/dashboard/data-unila/tracer",
    icon: <FiTrendingUp className="w-4 h-4" />,
  },
];
