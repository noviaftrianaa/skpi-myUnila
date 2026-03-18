"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiBarChart2, FiActivity, FiCheckCircle, FiMessageCircle, FiFile } from "react-icons/fi";
import Link from "next/link";
import { projectManagementMenuConfig } from "../../config/menuConfig";
import {
  projectService,
  type Project,
  type ContributionData,
  type Sprint,
} from "@/lib/services/project/projectService";
import { ContributionHeatmap } from "@/shared/components/project/ContributionHeatmap";
import { ProjectCharts } from "@/shared/components/project/ProjectCharts";

// Nav tabs (match [projectId]/page.tsx)
const NAV_TABS = [
  { label: "Overview", href: "" },
  { label: "Board", href: "/board" },
  { label: "List", href: "/list" },
  { label: "Timeline", href: "/timeline" },
  { label: "Modul", href: "/modules" },
  { label: "Dokumen", href: "/documents" },
  { label: "Aktivitas", href: "/activity" },
  { label: "Analytics", href: "/analytics" },
  { label: "Pengaturan", href: "/settings" },
];

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  useRequireAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, year]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proj, contrib, sprintsData] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectContributions(projectId, year),
        projectService.getSprints(projectId).catch(() => []),
      ]);
      setProject(proj);
      setContributions(contrib);
      setSprints(sprintsData);
      // Select first active sprint by default
      const activeSprint = sprintsData.find((s) => s.status === "active") ?? sprintsData[0];
      if (activeSprint && !selectedSprintId) {
        setSelectedSprintId(activeSprint.id_sprint);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCard[] = contributions
    ? [
        {
          label: "Total Aktivitas",
          value: contributions.total,
          icon: <FiActivity className="w-5 h-5" />,
          color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        },
        {
          label: "Tugas Selesai",
          value: contributions.by_type["task_completed"] ?? 0,
          icon: <FiCheckCircle className="w-5 h-5" />,
          color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        },
        {
          label: "Komentar",
          value: Object.entries(contributions.by_type)
            .filter(([k]) => k.includes("comment"))
            .reduce((sum, [, v]) => sum + v, 0),
          icon: <FiMessageCircle className="w-5 h-5" />,
          color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20",
        },
        {
          label: "Dokumen",
          value: Object.entries(contributions.by_type)
            .filter(([k]) => k.includes("document"))
            .reduce((sum, [, v]) => sum + v, 0),
          icon: <FiFile className="w-5 h-5" />,
          color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
        },
      ]
    : [];

  const currentYear = new Date().getFullYear();

  return (
    <DashboardLayoutWithDynamicMenu menuConfig={projectManagementMenuConfig}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FiBarChart2 className="w-6 h-6 text-blue-600" />
              Analytics{project ? ` — ${project.nm_project ?? project.nama ?? ""}` : ""}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualisasi aktivitas dan performa tim
            </p>
          </div>

          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 pb-0">
          {NAV_TABS.map((tab) => {
            const href = `/dashboard/project-management/${projectId}${tab.href}`;
            const isActive = tab.href === "/analytics";
            return (
              <Link
                key={tab.label}
                href={href}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Contribution Heatmap */}
            {contributions && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Heatmap Aktivitas Project
                </h2>
                <ContributionHeatmap
                  data={contributions.data}
                  year={contributions.year}
                  total={contributions.total}
                  streak={contributions.current_streak}
                  longestStreak={contributions.longest_streak}
                />
              </div>
            )}

            {/* Stat Cards */}
            {statCards.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                      {card.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{card.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            <ProjectCharts
              projectId={projectId}
              sprintId={selectedSprintId}
              sprints={sprints}
            />
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
