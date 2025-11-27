/**
 * Menu Configuration untuk Feeder Integrator
 *
 * Dashboard untuk sinkronisasi data dengan Neo Feeder PDDIKTI API
 * Untuk role: Developer, Rektor, Wakil Rektor 1-4, dan LP3M UNILA
 */

import {
  FiActivity,
  FiFileText,
  FiSettings,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const feederIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/referensi",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
    children: [
      {
        title: "Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/mahasiswa",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Aktivitas Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/aktivitas-mahasiswa",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Matkul Kurikulum",
        href: "/dashboard/feeder-integrator/pdrd/matkul-kurikulum",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Rencana Evaluasi MK",
        href: "/dashboard/feeder-integrator/pdrd/rencana-evaluasi",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Kelas Pengajaran",
        href: "/dashboard/feeder-integrator/pdrd/kelas-kuliah",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Nilai Perkuliahan",
        href: "/dashboard/feeder-integrator/pdrd/nilai-perkuliahan",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Konversi/Transfer",
        href: "/dashboard/feeder-integrator/pdrd/konversi-transfer",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Transkrip Nilai",
        href: "/dashboard/feeder-integrator/pdrd/transkrip-nilai",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
      {
        title: "Prestasi Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/prestasi",
        roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/monitoring",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/logs",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/settings",
    roles: ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"],
  },
];
