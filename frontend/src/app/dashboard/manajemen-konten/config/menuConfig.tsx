/**
 * Menu Configuration — Manajemen Konten
 *
 * RBAC: developer-only (sesuai Q9 design decision).
 * Path root: /dashboard/manajemen-konten/
 */

import { FiFileText, FiList, FiBookOpen, FiBell, FiTag, FiHome } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allowedRoles = ["developer"];

export const manajemenKontenMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten",
    roles: allowedRoles,
  },
  {
    title: "Pengumuman",
    icon: <FiBell className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten/konten?tipe=pengumuman",
    roles: allowedRoles,
  },
  {
    title: "Berita",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten/konten?tipe=berita",
    roles: allowedRoles,
  },
  {
    title: "Artikel",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten/konten?tipe=artikel",
    roles: allowedRoles,
  },
  {
    title: "Semua Konten",
    icon: <FiList className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten/konten",
    roles: allowedRoles,
  },
  {
    title: "Kategori",
    icon: <FiTag className="w-5 h-5" />,
    href: "/dashboard/manajemen-konten/kategori",
    roles: allowedRoles,
  },
];
