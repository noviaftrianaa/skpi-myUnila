
import {
    FiShield,
    FiActivity,
    FiGlobe,
    FiAlertTriangle,
    FiSettings,
    FiList
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

export const monitoringMenuConfig: MenuItem[] = [
    {
        title: "Dashboard",
        icon: <MdDashboard className="w-5 h-5" />,
        href: "/dashboard/monitoring",
    },
    {
        title: "Situs Terdaftar",
        icon: <FiGlobe className="w-5 h-5" />,
        href: "/dashboard/monitoring/sites",
    },
    {
        title: "Pemindaian",
        icon: <FiActivity className="w-5 h-5" />,
        href: "/dashboard/monitoring/scanner",
    },
    {
        title: "Ancaman",
        icon: <FiAlertTriangle className="w-5 h-5" />,
        href: "/dashboard/monitoring/threats",
    },
    {
        title: "Kata Kunci",
        icon: <FiList className="w-5 h-5" />,
        href: "/dashboard/monitoring/keywords",
    },
];
