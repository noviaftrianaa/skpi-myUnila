"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiGrid,
  FiLayout,
  FiList,
  FiClock,
  FiLayers,
  FiFileText,
  FiActivity,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

const NAV_TABS = [
  { label: "Overview", icon: <FiGrid className="w-3.5 h-3.5" />, href: "" },
  { label: "Board", icon: <FiLayout className="w-3.5 h-3.5" />, href: "/board" },
  { label: "List", icon: <FiList className="w-3.5 h-3.5" />, href: "/list" },
  { label: "Timeline", icon: <FiClock className="w-3.5 h-3.5" />, href: "/timeline" },
  { label: "Modul", icon: <FiLayers className="w-3.5 h-3.5" />, href: "/modules" },
  { label: "Dokumen", icon: <FiFileText className="w-3.5 h-3.5" />, href: "/documents" },
  { label: "Aktivitas", icon: <FiActivity className="w-3.5 h-3.5" />, href: "/activity" },
  { label: "Analytics", icon: <FiBarChart2 className="w-3.5 h-3.5" />, href: "/analytics" },
  { label: "Pengaturan", icon: <FiSettings className="w-3.5 h-3.5" />, href: "/settings" },
];

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const base = `/dashboard/project-management/${projectId}`;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/project-management"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Project
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex items-center gap-0.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 min-w-max">
          {NAV_TABS.map((tab) => {
            const href = `${base}${tab.href}`;
            const isActive = tab.href === ""
              ? pathname === base
              : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
