/**
 * Menu Configuration untuk SI Prestasi.
 * Fallback frontend; sumber utama dari auth-service (portal_menus/si-prestasi.json).
 */
import { FiAward, FiBookmark, FiClock, FiGrid, FiStar, FiTrophy, FiBarChart2 } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allRoles = ["admin", "developer", "admin_kemahasiswaan", "admin_fakultas", "operator_fakultas"];
const adminRoles = ["admin", "developer", "admin_kemahasiswaan"];

export const simPrestasiMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/si-prestasi",
    roles: allRoles,
  },
  {
    title: "Prestasi Mandiri",
    icon: <FiTrophy className="w-5 h-5" />,
    href: "/dashboard/si-prestasi/prestasi-mandiri",
    roles: allRoles,
  },
  {
    title: "Sertifikasi",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/si-prestasi/sertifikasi",
    roles: allRoles,
  },
  {
    title: "Rekognisi",
    icon: <FiStar className="w-5 h-5" />,
    href: "/dashboard/si-prestasi/rekognisi",
    roles: allRoles,
  },
  {
    title: "Master Data",
    icon: <FiBookmark className="w-5 h-5" />,
    children: [
      { title: "Referensi SIMKATMAWA", href: "/dashboard/si-prestasi/master-data" },
      { title: "API Configuration", href: "/dashboard/si-prestasi/master-data/api-config" },
    ],
    roles: adminRoles,
  },
  {
    title: "Sync Log",
    icon: <FiClock className="w-5 h-5" />,
    href: "/dashboard/si-prestasi/sync-log",
    roles: adminRoles,
  },
  {
    title: "Analytics Pimpinan",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/si-prestasi/analytics",
    roles: adminRoles,
  },
];
