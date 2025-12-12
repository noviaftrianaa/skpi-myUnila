/**
 * Menu Configuration untuk Manajemen Akses
 *
 * Dashboard untuk pengelolaan akses dan autentikasi user
 * Untuk role: Developer
 */

import {
  FiUsers,
  FiGrid,
  FiHome,
  FiFileText,
  FiKey,
  FiShield,
  FiServer,
  FiActivity,
  FiClock,
  FiLock,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const manajemenAksesMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/manajemen-akses",
    roles: ["developer"],
  },
  {
    title: "Manajemen",
    icon: <FiGrid className="w-5 h-5" />,
    roles: ["developer"],
    children: [
      {
        title: "Daftar Pengguna",
        href: "/dashboard/manajemen-akses/manajemen/pengguna",
        roles: ["developer"],
      },
      {
        title: "Daftar Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/aplikasi",
        roles: ["developer"],
      },
      {
        title: "Kategori Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/kategori-aplikasi",
        roles: ["developer"],
      },
      {
        title: "Daftar Unit",
        href: "/dashboard/manajemen-akses/manajemen/unit",
        roles: ["developer"],
      },
      {
        title: "Peran",
        href: "/dashboard/manajemen-akses/manajemen/peran",
        roles: ["developer"],
      },
      {
        title: "Role Base Access",
        href: "/dashboard/manajemen-akses/manajemen/rbac",
        roles: ["developer"],
      },
      {
        title: "WS Endpoint",
        href: "/dashboard/manajemen-akses/manajemen/ws-endpoint",
        roles: ["developer"],
      },
    ],
  },
  {
    title: "Logger",
    icon: <FiActivity className="w-5 h-5" />,
    roles: ["developer"],
    children: [
      {
        title: "Log Login",
        href: "/dashboard/manajemen-akses/logger/log-login",
        roles: ["developer"],
      },
      {
        title: "Log JWT",
        href: "/dashboard/manajemen-akses/logger/log-jwt",
        roles: ["developer"],
      },
      {
        title: "Log Akses",
        href: "/dashboard/manajemen-akses/logger/log-akses",
        roles: ["developer"],
      },
    ],
  },
];
