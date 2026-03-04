/**
 * Menu Configuration untuk SISTER Integrator
 *
 * Dashboard untuk sinkronisasi data dengan SISTER API Kemdikbud
 * Untuk role: Developer, Rektor, Wakil Rektor 1-4, dan LP3M UNILA
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
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/referensi",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Data PDRD",
    icon: <FiDatabase className="w-5 h-5" />,
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
    children: [
      {
        title: "Dosen",
        href: "/dashboard/sister-integrator/pdrd/dosen",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Foto Dosen",
        href: "/dashboard/sister-integrator/pdrd/dosen-foto",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Dokumen Dosen",
        href: "/dashboard/sister-integrator/pdrd/dosen-dokumen",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Penugasan PTK",
        href: "/dashboard/sister-integrator/pdrd/penugasan",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Penelitian",
        href: "/dashboard/sister-integrator/pdrd/penelitian",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Pengabdian",
        href: "/dashboard/sister-integrator/pdrd/pengabdian",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Publikasi",
        href: "/dashboard/sister-integrator/pdrd/publikasi",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Pendidikan Formal",
        href: "/dashboard/sister-integrator/pdrd/pendidikan-formal",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Riwayat Pekerjaan",
        href: "/dashboard/sister-integrator/pdrd/riwayat-pekerjaan",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Jabatan Fungsional",
        href: "/dashboard/sister-integrator/pdrd/jabatan-fungsional",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Jabatan Struktural",
        href: "/dashboard/sister-integrator/pdrd/jabatan-struktural",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Tugas Tambahan",
        href: "/dashboard/sister-integrator/pdrd/tugas-tambahan",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Sertifikasi Dosen",
        href: "/dashboard/sister-integrator/pdrd/sertifikasi-dosen",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Bidang Ilmu",
        href: "/dashboard/sister-integrator/pdrd/bidang-ilmu",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/monitoring",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/logs",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/sister-integrator/settings",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
];
