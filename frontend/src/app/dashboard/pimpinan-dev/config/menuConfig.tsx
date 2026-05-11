/**
 * Menu Configuration untuk Dashboard Pimpinan (Dev) — versi pengembangan
 *
 * Fallback menu kalau API /user-context/app-menus gagal load.
 * Sumber utama menu = man_akses.menu (app_slug='dashboard-pimpinan-dev').
 */

import { FiAward, FiUserCheck, FiTrendingUp } from "react-icons/fi";
import { MdDashboard, MdScience } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const pimpinanDevMenuConfig: MenuItem[] = [
  {
    title: "Beranda",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/pimpinan-dev",
    roles: ["developer", "administrator", "rektor", "warek", "dekan"],
  },
  {
    title: "Akreditasi",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/pimpinan-dev/akreditasi",
    roles: ["developer", "administrator", "rektor", "warek", "dekan"],
  },
  {
    title: "Dosen",
    icon: <FiUserCheck className="w-5 h-5" />,
    href: "/dashboard/pimpinan-dev/dosen",
    roles: ["developer", "administrator", "rektor", "warek", "dekan"],
  },
  {
    title: "Rasio",
    icon: <FiTrendingUp className="w-5 h-5" />,
    href: "/dashboard/pimpinan-dev/rasio",
    roles: ["developer", "administrator", "rektor", "warek", "dekan"],
  },
];

// Legacy export (utk backward-compat kalau ada page lama yang import nama lama)
export const pimpinanMenuConfig = pimpinanDevMenuConfig;
