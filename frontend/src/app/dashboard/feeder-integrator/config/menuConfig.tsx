/**
 * Menu Configuration untuk Feeder Integrator
 *
 * Dashboard untuk sinkronisasi data dengan PDDIKTI Feeder
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
} from "react-icons/fi";
import { MdDashboard, MdSync } from "react-icons/md";
import { BsCloudUpload, BsCloudDownload } from "react-icons/bs";
import { RiDashboardFill } from "react-icons/ri";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const feederIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator",
    roles: ["developer"],
  },
  {
    title: "Sync Management",
    icon: <MdSync className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/sync",
    roles: ["developer"],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/monitoring",
    roles: ["developer"],
  },
  {
    title: "Scheduler",
    icon: <FiClock className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/scheduler",
    roles: ["developer"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/logs",
    roles: ["developer"],
  },
  {
    title: "Data Entities",
    icon: <FiDatabase className="w-5 h-5" />,
    roles: ["developer"],
    children: [
      {
        title: "Mahasiswa",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/feeder-integrator/entities/mahasiswa",
      },
      {
        title: "Dosen",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/feeder-integrator/entities/dosen",
      },
      {
        title: "Mata Kuliah",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/feeder-integrator/entities/matakuliah",
      },
      {
        title: "Kelas Kuliah",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/feeder-integrator/entities/kelas",
      },
      {
        title: "Nilai",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/feeder-integrator/entities/nilai",
      },
    ],
  },
  {
    title: "Statistics",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/statistics",
    roles: ["developer"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/settings",
    roles: ["developer"],
  },
  {
    title: "Error Handling",
    icon: <FiAlertCircle className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/errors",
    roles: ["developer"],
  },
];
