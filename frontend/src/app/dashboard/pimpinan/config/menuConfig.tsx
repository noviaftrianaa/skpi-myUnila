/**
 * Menu Configuration untuk Pimpinan
 *
 * Definisi menu berdasarkan role untuk dashboard Pimpinan
 * (Rektor, Warek, Dekan, Wakil Dekan, Ketua Lembaga)
 */

import {
  FiTrendingUp,
  FiUsers,
  FiBook,
  FiAward,
  FiBarChart,
  FiFileText,
  FiTarget,
  FiCheckCircle,
  FiGrid,
  FiMap,
  FiDatabase,
  FiSettings,
} from "react-icons/fi";
import { MdDashboard, MdBusiness } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const pimpinanMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/pimpinan",
    roles: ["pimpinan", "rektor", "warek", "dekan", "wadek", "ketua_lembaga"],
  },
  {
    title: "Akreditasi",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/pimpinan/akreditasi",
    roles: ["pimpinan", "rektor", "warek", "dekan", "wadek"],
  },
  // // Statistik & Analitik
  {
    title: "Rasio Unila",
    icon: <FiTrendingUp className="w-5 h-5" />,
    href: "/dashboard/pimpinan/rasio",
    roles: ["pimpinan", "rektor", "warek", "dekan", "wadek", "ketua_lembaga"],
  },
  // {
  //   title: "Peringkat Universitas",
  //   icon: <FiAward className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/peringkat-universitas",
  //   roles: ["pimpinan", "rektor", "warek"],
  // },
  // {
  //   title: "Tracer Study",
  //   icon: <FiTarget className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/tracer-study",
  //   roles: ["pimpinan", "rektor", "warek", "dekan", "wadek"],
  // },
  // // Akademik
  // {
  //   title: "Data Akademik",
  //   icon: <FiBook className="w-5 h-5" />,
  //   roles: ["pimpinan", "rektor", "warek", "dekan", "wadek"],
  //   children: [
  //     {
  //       title: "Statistik Mahasiswa",
  //       icon: <FiUsers className="w-4 h-4" />,
  //       href: "/dashboard/pimpinan/statistik-mahasiswa",
  //     },
  //     {
  //       title: "Statistik Dosen",
  //       icon: <FiUsers className="w-4 h-4" />,
  //       href: "/dashboard/pimpinan/statistik-dosen",
  //     },
  //     {
  //       title: "Program Studi",
  //       icon: <FiBook className="w-4 h-4" />,
  //       href: "/dashboard/pimpinan/program-studi",
  //     },
  //     {
  //       title: "Sebaran Prodi",
  //       icon: <FiMap className="w-4 h-4" />,
  //       href: "/dashboard/pimpinan/sebaran-prodi",
  //     },
  //   ],
  // },
  // // Laporan
  // {
  //   title: "Laporan",
  //   icon: <FiFileText className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/laporan",
  //   roles: ["pimpinan", "rektor", "warek", "dekan", "wadek"],
  // },
  // // Fakultas & Unit
  // {
  //   title: "Fakultas & Unit",
  //   icon: <MdBusiness className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/fakultas-unit",
  //   roles: ["pimpinan", "rektor", "warek"],
  // },
  // // Database Integrator
  // {
  //   title: "Database Feeder",
  //   icon: <FiDatabase className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/database-feeder",
  //   roles: ["pimpinan", "rektor", "warek"],
  // },
  // {
  //   title: "Database Sister",
  //   icon: <FiDatabase className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/database-sister",
  //   roles: ["pimpinan", "rektor", "warek"],
  // },
  // // Monitoring
  // {
  //   title: "Monitoring",
  //   icon: <FiBarChart className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/monitoring",
  //   roles: ["pimpinan", "rektor", "warek", "dekan", "wadek"],
  // },
  // // Quick Access
  // {
  //   title: "Aplikasi Terintegrasi",
  //   icon: <FiGrid className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/aplikasi-terintegrasi",
  //   roles: ["pimpinan", "rektor", "warek", "dekan", "wadek", "ketua_lembaga"],
  // },
  // // Settings (khusus pimpinan tertentu)
  // {
  //   title: "Pengaturan",
  //   icon: <FiSettings className="w-5 h-5" />,
  //   href: "/dashboard/pimpinan/pengaturan",
  //   roles: ["rektor", "warek"],
  // },
];
