
import {
    FiShield,
    FiActivity,
    FiGlobe,
    FiAlertTriangle,
    FiList,
    FiSearch,
    FiSettings,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const monitoringMenuConfig: MenuItem[] = [
    {
        title: "Dashboard",
        icon: <MdDashboard className="w-5 h-5" />,
        href: "/dashboard/web-monitoring",
    },
    {
        title: "Situs Terdaftar",
        icon: <FiGlobe className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/sites",
    },
    {
        title: "Pemindaian",
        icon: <FiActivity className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/scanner",
    },
    {
        title: "Ancaman",
        icon: <FiAlertTriangle className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/threats",
    },
    {
        title: "Kata Kunci",
        icon: <FiList className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/keywords",
    },
    {
        title: "Google Search Console",
        icon: <FiSearch className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/gsc",
    },
    {
        title: "Pengaturan",
        icon: <FiSettings className="w-5 h-5" />,
        href: "/dashboard/web-monitoring/settings",
    },
];
