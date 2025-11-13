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
    roles: ["developer"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/referensi",
    roles: ["developer"],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["developer"],
    children: [
      {
        title: "Dosen",
        href: "/dashboard/sister-integrator/pdrd/dosen",
        roles: ["developer"],
      },
      {
        title: "Penugasan PTK",
        href: "/dashboard/sister-integrator/pdrd/penugasan",
        roles: ["developer"],
      },
      {
        title: "Penelitian",
        href: "/dashboard/sister-integrator/pdrd/penelitian",
        roles: ["developer"],
      },
      {
        title: "Pengabdian",
        href: "/dashboard/sister-integrator/pdrd/pengabdian",
        roles: ["developer"],
      },
      {
        title: "Publikasi",
        href: "/dashboard/sister-integrator/pdrd/publikasi",
        roles: ["developer"],
      },
      {
        title: "Pendidikan Formal",
        href: "/dashboard/sister-integrator/pdrd/pendidikan-formal",
        roles: ["developer"],
      },
      {
        title: "Riwayat Pekerjaan",
        href: "/dashboard/sister-integrator/pdrd/riwayat-pekerjaan",
        roles: ["developer"],
      },
      {
        title: "Jabatan Fungsional",
        href: "/dashboard/sister-integrator/pdrd/jabatan-fungsional",
        roles: ["developer"],
      },
      {
        title: "Jabatan Struktural",
        href: "/dashboard/sister-integrator/pdrd/jabatan-struktural",
        roles: ["developer"],
      },
      {
        title: "Tugas Tambahan",
        href: "/dashboard/sister-integrator/pdrd/tugas-tambahan",
        roles: ["developer"],
      },
      {
        title: "Sertifikasi Dosen",
        href: "/dashboard/sister-integrator/pdrd/sertifikasi-dosen",
        roles: ["developer"],
      },
      {
        title: "Bidang Ilmu",
        href: "/dashboard/sister-integrator/pdrd/bidang-ilmu",
        roles: ["developer"],
      },
    ],
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
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/settings",
    roles: ["developer"],
  },
];
