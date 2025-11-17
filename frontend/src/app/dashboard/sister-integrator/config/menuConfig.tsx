/**
 * Menu Configuration untuk SISTER Integrator
 *
 * Dashboard untuk sinkronisasi data dengan SISTER API Kemdikbud
 * Untuk role: Developer dan Rektor
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
  FiUsers,
} from "react-icons/fi";
import { MdDashboard, MdSync } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const sisterIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/sister-integrator",
    roles: ["developer", "rektor"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/referensi",
    roles: ["developer", "rektor"],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["developer", "rektor"],
    children: [
      {
        title: "Dosen",
        href: "/dashboard/sister-integrator/pdrd/dosen",
        roles: ["developer", "rektor"],
      },
      {
        title: "Penugasan PTK",
        href: "/dashboard/sister-integrator/pdrd/penugasan",
        roles: ["developer", "rektor"],
      },
      {
        title: "Penelitian",
        href: "/dashboard/sister-integrator/pdrd/penelitian",
        roles: ["developer", "rektor"],
      },
      {
        title: "Pengabdian",
        href: "/dashboard/sister-integrator/pdrd/pengabdian",
        roles: ["developer", "rektor"],
      },
      {
        title: "Publikasi",
        href: "/dashboard/sister-integrator/pdrd/publikasi",
        roles: ["developer", "rektor"],
      },
      {
        title: "Pendidikan Formal",
        href: "/dashboard/sister-integrator/pdrd/pendidikan-formal",
        roles: ["developer", "rektor"],
      },
      {
        title: "Riwayat Pekerjaan",
        href: "/dashboard/sister-integrator/pdrd/riwayat-pekerjaan",
        roles: ["developer", "rektor"],
      },
      {
        title: "Jabatan Fungsional",
        href: "/dashboard/sister-integrator/pdrd/jabatan-fungsional",
        roles: ["developer", "rektor"],
      },
      {
        title: "Jabatan Struktural",
        href: "/dashboard/sister-integrator/pdrd/jabatan-struktural",
        roles: ["developer", "rektor"],
      },
      {
        title: "Tugas Tambahan",
        href: "/dashboard/sister-integrator/pdrd/tugas-tambahan",
        roles: ["developer", "rektor"],
      },
      {
        title: "Sertifikasi Dosen",
        href: "/dashboard/sister-integrator/pdrd/sertifikasi-dosen",
        roles: ["developer", "rektor"],
      },
      {
        title: "Bidang Ilmu",
        href: "/dashboard/sister-integrator/pdrd/bidang-ilmu",
        roles: ["developer", "rektor"],
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/monitoring",
    roles: ["developer", "rektor"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/logs",
    roles: ["developer", "rektor"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/settings",
    roles: ["developer", "rektor"],
  },
];
