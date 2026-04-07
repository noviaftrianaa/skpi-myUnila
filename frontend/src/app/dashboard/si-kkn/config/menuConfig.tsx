/**
 * Menu Configuration untuk SI KKN (SIKNILA)
 *
 * Dashboard untuk layanan Kuliah Kerja Nyata
 * Untuk role: mahasiswa, dosen, admin_kkn, admin_lppm, pejabat
 */

import {
  FiClipboard,
  FiUsers,
  FiBookOpen,
  FiTarget,
  FiCalendar,
  FiMessageSquare,
  FiStar,
  FiAward,
  FiThumbsUp,
  FiGrid,
  FiMapPin,
  FiUser,
  FiCheckSquare,
  FiFile,
  FiSettings,
  FiBarChart2,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allRoles = ["mahasiswa", "dosen", "admin_kkn", "admin_lppm", "pejabat", "developer", "admin"];
const adminRoles = ["admin_kkn", "admin_lppm", "developer", "admin"];
const mahasiswaRoles = ["mahasiswa"];
const dosenRoles = ["dosen"];

export const siKknMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/si-kkn",
    roles: allRoles,
  },
  {
    title: "Pendaftaran KKN",
    icon: <FiClipboard className="w-5 h-5" />,
    href: "/dashboard/si-kkn/pendaftaran",
    roles: [...mahasiswaRoles, ...adminRoles],
  },
  {
    title: "Kelompok Saya",
    icon: <FiUsers className="w-5 h-5" />,
    href: "/dashboard/si-kkn/kelompok-saya",
    roles: [...mahasiswaRoles, ...dosenRoles],
  },
  {
    title: "Logbook & Kegiatan",
    icon: <FiBookOpen className="w-5 h-5" />,
    roles: [...mahasiswaRoles, ...dosenRoles, ...adminRoles],
    children: [
      {
        title: "Logbook Harian",
        icon: <FiBookOpen className="w-5 h-5" />,
        href: "/dashboard/si-kkn/logbook",
        roles: [...mahasiswaRoles, ...dosenRoles, ...adminRoles],
      },
      {
        title: "Program Kerja",
        icon: <FiTarget className="w-5 h-5" />,
        href: "/dashboard/si-kkn/program-kerja",
        roles: [...mahasiswaRoles, ...dosenRoles, ...adminRoles],
      },
      {
        title: "Absensi",
        icon: <FiCalendar className="w-5 h-5" />,
        href: "/dashboard/si-kkn/absensi",
        roles: [...mahasiswaRoles, ...dosenRoles, ...adminRoles],
      },
    ],
  },
  {
    title: "Bimbingan DPL",
    icon: <FiMessageSquare className="w-5 h-5" />,
    href: "/dashboard/si-kkn/bimbingan",
    roles: [...mahasiswaRoles, ...dosenRoles],
  },
  {
    title: "Penilaian",
    icon: <FiStar className="w-5 h-5" />,
    roles: [...dosenRoles, ...adminRoles],
    children: [
      {
        title: "Nilai Komponen",
        icon: <FiStar className="w-5 h-5" />,
        href: "/dashboard/si-kkn/penilaian/komponen",
        roles: [...dosenRoles, ...adminRoles],
      },
      {
        title: "Nilai Akhir",
        icon: <FiAward className="w-5 h-5" />,
        href: "/dashboard/si-kkn/penilaian/akhir",
        roles: [...dosenRoles, ...adminRoles],
      },
      {
        title: "Penilaian Pamong",
        icon: <FiThumbsUp className="w-5 h-5" />,
        href: "/dashboard/si-kkn/penilaian/pamong",
        roles: adminRoles,
      },
    ],
  },
  {
    title: "Manajemen",
    icon: <FiGrid className="w-5 h-5" />,
    roles: adminRoles,
    children: [
      {
        title: "Kelompok",
        icon: <FiGrid className="w-5 h-5" />,
        href: "/dashboard/si-kkn/manajemen/kelompok",
        roles: adminRoles,
      },
      {
        title: "Penempatan",
        icon: <FiMapPin className="w-5 h-5" />,
        href: "/dashboard/si-kkn/manajemen/penempatan",
        roles: adminRoles,
      },
      {
        title: "DPL",
        icon: <FiUser className="w-5 h-5" />,
        href: "/dashboard/si-kkn/manajemen/dpl",
        roles: adminRoles,
      },
      {
        title: "Verifikasi",
        icon: <FiCheckSquare className="w-5 h-5" />,
        href: "/dashboard/si-kkn/manajemen/verifikasi",
        roles: adminRoles,
      },
    ],
  },
  {
    title: "Dokumen & Sertifikat",
    icon: <FiFile className="w-5 h-5" />,
    href: "/dashboard/si-kkn/dokumen",
    roles: allRoles,
  },
  {
    title: "Master Data",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/si-kkn/master-data",
    roles: adminRoles,
  },
  {
    title: "Monitoring",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/si-kkn/monitoring",
    roles: adminRoles,
  },
];
