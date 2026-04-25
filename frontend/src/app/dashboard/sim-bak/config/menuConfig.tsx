/**
 * Menu Configuration untuk SIM-BAK (SIMBAK)
 *
 * Dashboard untuk layanan administrasi kemahasiswaan BAK
 * Untuk role: mahasiswa, admin_bak, admin_fakultas, pejabat
 */

import { FiFileText, FiGrid, FiSettings, FiBarChart2, FiUsers, FiLayers, FiCheckSquare, FiClipboard, FiList } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allRoles = ["mahasiswa", "admin_bak", "admin_fakultas", "pejabat", "developer", "admin"];
const adminRoles = ["admin_bak", "developer", "admin"];
const mahasiswaRoles = ["mahasiswa", "developer", "admin"];
const approverRoles = ["admin_fakultas", "pejabat", "developer", "admin"];

export const simBakMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/sim-bak",
    roles: allRoles,
  },
  {
    title: "Permohonan Surat",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/sim-bak/surat-mandiri",
    roles: mahasiswaRoles,
  },
  {
    title: "Permohonan Akademik",
    icon: <FiClipboard className="w-5 h-5" />,
    href: "/dashboard/sim-bak/permohonan",
    roles: mahasiswaRoles,
  },
  {
    title: "Riwayat Pengajuan",
    icon: <FiLayers className="w-5 h-5" />,
    href: "/dashboard/sim-bak/riwayat",
    roles: mahasiswaRoles,
  },
  {
    title: "Semua Pengajuan",
    icon: <FiList className="w-5 h-5" />,
    href: "/dashboard/sim-bak/admin/pengajuan",
    roles: adminRoles,
  },
  {
    title: "Verifikasi",
    icon: <FiCheckSquare className="w-5 h-5" />,
    href: "/dashboard/sim-bak/admin/verifikasi",
    roles: adminRoles,
  },
  {
    title: "Persetujuan",
    icon: <FiCheckSquare className="w-5 h-5" />,
    href: "/dashboard/sim-bak/admin/persetujuan",
    roles: approverRoles,
  },
  {
    title: "Evaluasi Studi",
    icon: <FiUsers className="w-5 h-5" />,
    href: "/dashboard/sim-bak/batch",
    roles: adminRoles,
  },
  {
    title: "Monitoring",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/sim-bak/monitoring",
    roles: adminRoles,
  },
  {
    title: "Master Data",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/dashboard/sim-bak/master-data",
    roles: adminRoles,
  },
];
