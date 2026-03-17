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

// Roles that have access to this dashboard
// Note: Actual menu visibility is controlled by RBAC (menu_role table) in backend
// This frontend filter is for UI convenience - backend enforces actual permissions
const allowedRoles = ["developer", "admin", "mahasiswa"];

export const manajemenAksesMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/manajemen-akses",
    roles: allowedRoles,
  },
  {
    title: "Manajemen",
    icon: <FiGrid className="w-5 h-5" />,
    roles: allowedRoles,
    children: [
      {
        title: "Daftar Pengguna",
        href: "/dashboard/manajemen-akses/manajemen/pengguna",
        roles: allowedRoles,
      },
      {
        title: "Daftar Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/aplikasi",
        roles: allowedRoles,
      },
      {
        title: "Role Base Access",
        href: "/dashboard/manajemen-akses/manajemen/rbac",
        roles: allowedRoles,
      },
      {
        title: "Menu Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/menu",
        roles: allowedRoles,
      },
      {
        title: "Kategori Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/kategori-aplikasi",
        roles: allowedRoles,
      },
      {
        title: "Daftar Unit",
        href: "/dashboard/manajemen-akses/manajemen/unit",
        roles: allowedRoles,
      },
      {
        title: "Peran",
        href: "/dashboard/manajemen-akses/manajemen/peran",
        roles: allowedRoles,
      },
      {
        title: "PJ Aplikasi",
        href: "/dashboard/manajemen-akses/manajemen/pj-aplikasi",
        roles: allowedRoles,
      },
      {
        title: "WS Authorization",
        href: "/dashboard/manajemen-akses/manajemen/ws-authorization",
        roles: allowedRoles,
      },
      {
        title: "WS Endpoint",
        href: "/dashboard/manajemen-akses/manajemen/ws-endpoint",
        roles: allowedRoles,
      },
    ],
  },
  {
    title: "Logger",
    icon: <FiActivity className="w-5 h-5" />,
    roles: allowedRoles,
    children: [
      {
        title: "Log Login",
        href: "/dashboard/manajemen-akses/logger/log-login",
        roles: allowedRoles,
      },
      {
        title: "Log JWT",
        href: "/dashboard/manajemen-akses/logger/log-jwt",
        roles: allowedRoles,
      },
      {
        title: "Log Akses",
        href: "/dashboard/manajemen-akses/logger/log-akses",
        roles: allowedRoles,
      },
    ],
  },
];
