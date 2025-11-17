/**
 * Menu Configuration untuk Feeder Integrator
 *
 * Dashboard untuk sinkronisasi data dengan Neo Feeder PDDIKTI API
 * Untuk role: Developer dan Rektor
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
    roles: ["developer", "rektor"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/referensi",
    roles: ["developer", "rektor"],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["developer", "rektor"],
    children: [
      {
        title: "Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/mahasiswa",
        roles: ["developer", "rektor"],
      },
      {
        title: "Aktivitas Kuliah Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/aktivitas-kuliah",
        roles: ["developer", "rektor"],
      },
      {
        title: "Nilai Perkuliahan",
        href: "/dashboard/feeder-integrator/pdrd/nilai-perkuliahan",
        roles: ["developer", "rektor"],
      },
      {
        title: "Aktivitas Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/aktivitas-mahasiswa",
        roles: ["developer", "rektor"],
      },
      {
        title: "Anggota Aktivitas Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/anggota-aktivitas",
        roles: ["developer", "rektor"],
      },
      {
        title: "Bimbingan Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/bimbingan",
        roles: ["developer", "rektor"],
      },
      {
        title: "Prestasi Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/prestasi",
        roles: ["developer", "rektor"],
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/monitoring",
    roles: ["developer", "rektor"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/logs",
    roles: ["developer", "rektor"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/feeder-integrator/settings",
    roles: ["developer", "rektor"],
  },
];
