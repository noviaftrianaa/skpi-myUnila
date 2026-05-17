/**
 * Menu Configuration — Manajemen Apps
 *
 * Parent shell untuk sub-modul manajemen ekosistem MyUnila secara keseluruhan.
 * Sub-modul saat ini:
 *  - Manajemen Konten (refactor dari /dashboard/manajemen-konten/)
 *
 * Future sub-modul: manajemen pengguna, aplikasi, notifikasi broadcast.
 *
 * NOTE: Blog Platform berada di /dashboard/blog-platform/ (modul parallel,
 * BUKAN sub-modul Manajemen Apps) karena scope-nya jauh lebih luas.
 */

import { FiBell, FiBookOpen, FiFileText, FiGrid, FiHome, FiList, FiSend, FiTag, FiUsers } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allowedRoles = ["developer", "admin"];

export const manajemenAppsMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/manajemen-apps",
    roles: allowedRoles,
  },
  {
    title: "Manajemen Konten",
    icon: <FiFileText className="w-5 h-5" />,
    children: [
      { title: "Overview",            icon: <FiHome      className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten" },
      { title: "Pengumuman",          icon: <FiBell      className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=pengumuman" },
      { title: "Berita",              icon: <FiFileText  className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=berita" },
      { title: "Artikel",             icon: <FiBookOpen  className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=artikel", isMaintenance: true },
      { title: "Semua Konten",        icon: <FiList      className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/konten" },
      { title: "Kategori",            icon: <FiTag       className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/kategori" },
      { title: "Broadcast Notifikasi",icon: <FiSend      className="w-4 h-4" />, href: "/dashboard/manajemen-apps/manajemen-konten/notifikasi" },
    ],
    roles: allowedRoles,
  },
  {
    title: "Manajemen Pengguna",
    icon: <FiUsers className="w-5 h-5" />,
    href: "#",
    isMaintenance: true,
    roles: allowedRoles,
  },
  {
    title: "Manajemen Aplikasi",
    icon: <FiGrid className="w-5 h-5" />,
    href: "#",
    isMaintenance: true,
    roles: allowedRoles,
  },
];
