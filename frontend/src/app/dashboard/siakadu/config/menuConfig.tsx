/**
 * Menu Configuration untuk Siakadu
 *
 * Definisi menu berdasarkan role untuk aplikasi Siakadu
 */

import {
  FiUsers,
  FiBook,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiAward,
  FiMessageSquare,
  FiUser,
  FiClipboard,
} from "react-icons/fi";
import { MdDashboard, MdSchool } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const siakaduMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/siakadu",
    roles: ["admin", "mahasiswa", "dosen"],
  },
  // Menu khusus Admin
  {
    title: "Mahasiswa",
    icon: <FiUsers className="w-5 h-5" />,
    href: "/dashboard/siakadu/mahasiswa",
    roles: ["admin"],
  },
  {
    title: "Dosen Ajar",
    icon: <FiUser className="w-5 h-5" />,
    href: "/dashboard/siakadu/dosen-ajar",
    roles: ["admin"],
  },
  {
    title: "Kurikulum",
    icon: <FiBook className="w-5 h-5" />,
    href: "/dashboard/siakadu/kurikulum",
    roles: ["admin"],
  },
  {
    title: "Matakuliah",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/siakadu/matakuliah",
    roles: ["admin"],
  },
  {
    title: "Kelas Kuliah",
    icon: <MdSchool className="w-5 h-5" />,
    href: "/dashboard/siakadu/kelas-kuliah",
    roles: ["admin", "mahasiswa", "dosen"],
  },
  {
    title: "Status Mahasiswa",
    icon: <FiCheckCircle className="w-5 h-5" />,
    href: "/dashboard/siakadu/status-mahasiswa",
    roles: ["admin"],
  },
  {
    title: "Nilai Mahasiswa",
    icon: <FiClipboard className="w-5 h-5" />,
    href: "/dashboard/siakadu/nilai-mahasiswa",
    roles: ["admin"],
  },
  {
    title: "Mahasiswa Lulus",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/siakadu/mahasiswa-lulus",
    roles: ["admin"],
  },
  // Menu khusus Mahasiswa
  {
    title: "Chat Grup Kelas",
    icon: <FiMessageSquare className="w-5 h-5" />,
    href: "/dashboard/siakadu/chat-grup",
    roles: ["mahasiswa", "dosen"],
  },
  {
    title: "Biodata",
    icon: <FiUser className="w-5 h-5" />,
    href: "/dashboard/siakadu/biodata",
    roles: ["mahasiswa"],
  },
  {
    title: "Jadwal Kuliah",
    icon: <FiCalendar className="w-5 h-5" />,
    href: "/dashboard/siakadu/jadwal-kuliah",
    roles: ["mahasiswa"],
  },
  {
    title: "KRS/KHS/Transkrip",
    icon: <FiFileText className="w-5 h-5" />,
    roles: ["mahasiswa"],
    children: [
      {
        title: "KRS",
        icon: <FiFileText className="w-4 h-4" />,
        href: "/dashboard/siakadu/krs",
      },
      {
        title: "KHS",
        icon: <FiFileText className="w-4 h-4" />,
        href: "/dashboard/siakadu/khs",
      },
      {
        title: "Transkrip",
        icon: <FiFileText className="w-4 h-4" />,
        href: "/dashboard/siakadu/transkrip",
      },
    ],
  },
  {
    title: "Status Kuliah",
    icon: <FiCheckCircle className="w-5 h-5" />,
    href: "/dashboard/siakadu/status-kuliah",
    roles: ["mahasiswa"],
  },
  // Menu khusus Dosen
  {
    title: "Jadwal Kelas",
    icon: <FiCalendar className="w-5 h-5" />,
    href: "/dashboard/siakadu/jadwal-kelas",
    roles: ["dosen"],
  },
  {
    title: "Nilai Kuliah",
    icon: <FiClipboard className="w-5 h-5" />,
    href: "/dashboard/siakadu/nilai-kuliah",
    roles: ["dosen"],
  },
];
