/**
 * Menu Configuration untuk SISTER Integrator
 *
 * Dashboard untuk sinkronisasi data dengan SISTER API Kemdikbud
 * Hanya untuk role: Developer
 */

import {
  FiDatabase,
  FiActivity,
  FiClock,
  FiFileText,
  FiSettings,
  FiRefreshCw,
  FiBarChart2,
  FiServer,
  FiAlertCircle,
  FiBookOpen,
} from "react-icons/fi";
import { MdDashboard, MdSync } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const sisterIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/sister-integrator",
    roles: ["developer"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/referensi",
    roles: ["developer"],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/monitoring",
    roles: ["developer"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/logs",
    roles: ["developer"],
  },
  {
    title: "Statistics",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/statistics",
    roles: ["developer"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/settings",
    roles: ["developer"],
  },
];
