/**
 * Menu Configuration untuk Dashboard Pimpinan
 *
 * Dashboard BI untuk pengambilan keputusan pimpinan universitas
 * Untuk role: Rektor, Wakil Rektor 1-4, Dekan, Wakil Dekan
 */

import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiDollarSign,
  FiAward,
  FiBookOpen,
  FiFileText,
  FiTarget,
  FiMap,
  FiStar,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const defaultRoles = [
  "developer",
  "rektor",
  "wakilrektor1",
  "wakilrektor2",
  "wakilrektor3",
  "wakilrektor4",
  "dekan",
  "wakildekan1",
  "wakildekan2",
  "wakildekan3",
  "lp3m",
];

export const pimpinanMenuConfig: MenuItem[] = [
  {
    title: "Beranda",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/pimpinan",
    roles: defaultRoles,
  },
  {
    title: "Akreditasi",
    icon: <FiStar className="w-5 h-5" />,
    href: "/dashboard/pimpinan/akreditasi",
    roles: defaultRoles,
  },
  {
    title: "Monitoring IKU",
    icon: <FiTarget className="w-5 h-5" />,
    href: "/dashboard/pimpinan/iku",
    roles: defaultRoles,
  },
  {
    title: "Mahasiswa",
    icon: <FiUsers className="w-5 h-5" />,
    href: "/dashboard/pimpinan/mahasiswa",
    roles: defaultRoles,
  },
  {
    title: "Lulusan",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/pimpinan/lulusan",
    roles: defaultRoles,
  },
  {
    title: "Dosen",
    icon: <FiUserCheck className="w-5 h-5" />,
    href: "/dashboard/pimpinan/dosen",
    roles: defaultRoles,
  },
  {
    title: "Litabmas",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/pimpinan/litabmas",
    roles: defaultRoles,
  },
  {
    title: "Publikasi",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/pimpinan/publikasi",
    roles: defaultRoles,
  },
  {
    title: "Pegawai",
    icon: <FiBriefcase className="w-5 h-5" />,
    href: "/dashboard/pimpinan/pegawai",
    roles: defaultRoles,
  },
  {
    title: "Keuangan",
    icon: <FiDollarSign className="w-5 h-5" />,
    href: "/dashboard/pimpinan/keuangan",
    roles: defaultRoles,
  },
  {
    title: "Prestasi",
    icon: <FiAward className="w-5 h-5" />,
    href: "/dashboard/pimpinan/prestasi",
    roles: defaultRoles,
  },
  {
    title: "Kerjasama",
    icon: <FiMap className="w-5 h-5" />, // Or FiUsers if FiMap not available, checking imports
    href: "/dashboard/pimpinan/kerjasama",
    roles: defaultRoles,
  },
];
