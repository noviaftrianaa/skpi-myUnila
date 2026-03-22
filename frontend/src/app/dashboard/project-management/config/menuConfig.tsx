/**
 * Menu Configuration untuk Project Management
 *
 * Dashboard untuk pengelolaan project development
 * Untuk role: Developer, Admin
 */

import { FiFolder, FiGrid, FiSettings, FiBarChart2 } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const allowedRoles = ["developer", "admin"];

export const projectManagementMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/project-management",
    roles: allowedRoles,
  },
  {
    title: "Projects",
    icon: <FiFolder className="w-5 h-5" />,
    roles: allowedRoles,
    children: [
      {
        title: "Semua Project",
        href: "/dashboard/project-management",
        roles: allowedRoles,
      },
    ],
  },
  {
    title: "Analytics",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/project-management",
    roles: allowedRoles,
  },
];
