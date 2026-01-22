/**
 * Menu Configuration untuk MyUnila Integrator
 *
 * Dashboard untuk sinkronisasi data internal sistem MyUnila
 * Untuk role: Developer, Rektor, Wakil Rektor 1-4, dan LP3M UNILA
 */

import {
  FiActivity,
  FiFileText,
  FiSettings,
  FiDatabase,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiKey,
  FiDollarSign,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const defaultRoles = ["developer", "rektor", "wakilrektor1", "wakilrektor2", "wakilrektor3", "wakilrektor4", "lp3m"];

export const myunilaIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/integrator",
    roles: defaultRoles,
  },
  {
    title: "Data SIKEP",
    icon: <FiUsers className="w-5 h-5" />,
    roles: defaultRoles,
    children: [
      {
        title: "Referensi",
        href: "/dashboard/integrator/sikep/referensi",
        roles: defaultRoles,
      },
      {
        title: "Pegawai",
        href: "/dashboard/integrator/sikep/pegawai",
        roles: defaultRoles,
      },
    ],
  },
  {
    title: "Data Siakadu",
    icon: <FiBookOpen className="w-5 h-5" />,
    roles: defaultRoles,
    children: [
      {
        title: "Mahasiswa",
        href: "/dashboard/integrator/siakadu/mahasiswa",
        roles: defaultRoles,
      },
      {
        title: "Pegawai",
        href: "/dashboard/integrator/siakadu/pegawai",
        roles: defaultRoles,
      },
      {
        title: "Kurikulum",
        href: "/dashboard/integrator/siakadu/kurikulum",
        roles: defaultRoles,
      },
      {
        title: "Mata Kuliah",
        href: "/dashboard/integrator/siakadu/mata-kuliah",
        roles: defaultRoles,
      },
      {
        title: "Kelas",
        href: "/dashboard/integrator/siakadu/kelas",
        roles: defaultRoles,
      },
      {
        title: "KRS/KHS",
        href: "/dashboard/integrator/siakadu/krs-khs",
        roles: defaultRoles,
      },
      {
        title: "Transkrip",
        href: "/dashboard/integrator/siakadu/transkrip",
        roles: defaultRoles,
      },
      {
        title: "Status Kuliah",
        href: "/dashboard/integrator/siakadu/status-kuliah",
        roles: defaultRoles,
      },
      {
        title: "Wisuda",
        href: "/dashboard/integrator/siakadu/wisuda",
        roles: defaultRoles,
      },
    ],
  },
  {
    title: "Sirandu",
    icon: <FiCalendar className="w-5 h-5" />,
    roles: defaultRoles,
    children: [
      {
        title: "Presensi Mahasiswa",
        href: "/dashboard/integrator/sirandu/presensi-mahasiswa",
        roles: defaultRoles,
      },
      {
        title: "Presensi Dosen",
        href: "/dashboard/integrator/sirandu/presensi-dosen",
        roles: defaultRoles,
      },
    ],
  },
  {
    title: "ManAkses",
    icon: <FiKey className="w-5 h-5" />,
    roles: defaultRoles,
    children: [
      {
        title: "Unit Organisasi",
        href: "/dashboard/integrator/manakses/unit-organisasi",
        roles: defaultRoles,
      },
      {
        title: "SSO Radius",
        href: "/dashboard/integrator/manakses/sso-radius",
        roles: defaultRoles,
      },
    ],
  },
  {
    title: "Keuangan (SIMPEDAM)",
    icon: <FiDollarSign className="w-5 h-5" />,
    roles: defaultRoles,
    children: [
      {
        title: "Daftar UKT",
        href: "/dashboard/integrator/keuangan/daftar-ukt",
        roles: defaultRoles,
      },
      {
        title: "SPP Mahasiswa",
        href: "/dashboard/integrator/keuangan/spp-mhs",
        roles: defaultRoles,
      },
      {
        title: "Mapping Prodi",
        href: "/dashboard/integrator/keuangan/mapping-prodi",
        roles: defaultRoles,
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity className="w-5 h-5" />,
    href: "/dashboard/integrator/monitoring",
    roles: defaultRoles,
  },
  {
    title: "Sync Logs",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/integrator/logs",
    roles: defaultRoles,
  },
  {
    title: "API Configuration",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/integrator/settings",
    roles: defaultRoles,
  },
];
