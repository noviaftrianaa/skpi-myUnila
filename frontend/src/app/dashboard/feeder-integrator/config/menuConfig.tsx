import { MenuItem } from "@/shared/components/dashboard/DashboardLayout";
import { MdDashboard } from "react-icons/md";
import { FiBookOpen, FiUsers, FiActivity, FiFileText, FiSettings } from "react-icons/fi";

export const feederIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard />,
    href: "/dashboard/feeder-integrator",
    roles: ["developer"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen />,
    href: "/dashboard/feeder-integrator/referensi",
    roles: ["developer"],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers />,
    roles: ["developer"],
    children: [
      {
        title: "Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/mahasiswa",
        roles: ["developer"],
      },
      {
        title: "Aktivitas Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/aktivitas-mahasiswa",
        roles: ["developer"],
      },
      {
        title: "Anggota Aktivitas",
        href: "/dashboard/feeder-integrator/pdrd/anggota-aktivitas",
        roles: ["developer"],
      },
      {
        title: "Nilai Kuliah",
        href: "/dashboard/feeder-integrator/pdrd/nilai-kuliah",
        roles: ["developer"],
      },
      {
        title: "Konversi",
        href: "/dashboard/feeder-integrator/pdrd/konversi",
        roles: ["developer"],
      },
      {
        title: "Nilai Transfer",
        href: "/dashboard/feeder-integrator/pdrd/nilai-transfer",
        roles: ["developer"],
      },
      {
        title: "Transkrip",
        href: "/dashboard/feeder-integrator/pdrd/transkrip",
        roles: ["developer"],
      },
      {
        title: "Matkul",
        href: "/dashboard/feeder-integrator/pdrd/matkul",
        roles: ["developer"],
      },
      {
        title: "Kurikulum",
        href: "/dashboard/feeder-integrator/pdrd/kurikulum",
        roles: ["developer"],
      },
      {
        title: "Rencana Ajar",
        href: "/dashboard/feeder-integrator/pdrd/rencana-ajar",
        roles: ["developer"],
      },
      {
        title: "Rencana Evaluasi",
        href: "/dashboard/feeder-integrator/pdrd/rencana-evaluasi",
        roles: ["developer"],
      },
      {
        title: "Prestasi Mahasiswa",
        href: "/dashboard/feeder-integrator/pdrd/prestasi-mahasiswa",
        roles: ["developer"],
      },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity />,
    href: "/dashboard/feeder-integrator/monitoring",
    roles: ["developer"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText />,
    href: "/dashboard/feeder-integrator/logs",
    roles: ["developer"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings />,
    href: "/dashboard/feeder-integrator/settings",
    roles: ["developer"],
  },
];
