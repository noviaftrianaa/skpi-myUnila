"use client";

import { Card, CardBody, Chip, Progress } from "./ui";
import { FiFolder, FiLayout, FiList, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import type { Project } from "@/lib/services/project/projectService";

interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
}

function VisibilityBadge({ visibility }: { visibility?: string }) {
  if (!visibility) return null;
  const map: Record<string, { icon: string; label: string; cls: string }> = {
    private: { icon: "🔒", label: "Private", cls: "text-gray-400" },
    unit: { icon: "🏢", label: "Unit", cls: "text-blue-500" },
    public: { icon: "🌐", label: "Public", cls: "text-green-500" },
  };
  const v = map[visibility];
  if (!v) return null;
  return <span className={`text-[10px] ${v.cls}`}>{v.icon} {v.label}</span>;
}

export default function ProjectCard({ project, viewMode = "grid" }: ProjectCardProps) {
  const progress = project.progress ?? (project.task_count && project.task_count > 0
    ? Math.round(((project.task_done ?? 0) / project.task_count) * 100)
    : 0);

  const statusColor = project.status === "active"
    ? "success"
    : project.status === "completed"
    ? "primary"
    : "default";

  const statusLabel = project.status === "active"
    ? "Aktif"
    : project.status === "completed"
    ? "Selesai"
    : "Arsip";

  const accentColor = project.warna || "#6366f1";
  const projectUrl = `/dashboard/project-management/${project.id}`;

  if (viewMode === "list") {
    return (
      <Link href={projectUrl}>
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer group">
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <FiFolder className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {project.nama}
                  </h3>
                  <span className="text-xs font-mono text-gray-400 flex-shrink-0">{project.kode}</span>
                  <Chip size="sm" color={statusColor}>{statusLabel}</Chip>
                  <VisibilityBadge visibility={project.visibility} />
                </div>
                {project.deskripsi && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.deskripsi}</p>
                )}
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{project.task_done ?? 0}</span>/{project.task_count ?? 0} task
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{project.module_count ?? 0}</span> modul
                  </span>
                </div>

                <div className="w-24 hidden md:block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
                  </div>
                  <Progress value={progress} color={progress === 100 ? "success" : "primary"} />
                </div>

                <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={projectUrl}>
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group overflow-hidden h-full">
        {/* Color accent */}
        <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

        <CardBody className="p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <FiFolder className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.nama}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-gray-400">{project.kode}</span>
                  <VisibilityBadge visibility={project.visibility} />
                </div>
              </div>
            </div>
            <Chip size="sm" color={statusColor}>{statusLabel}</Chip>
          </div>

          {/* Description */}
          {project.deskripsi && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
              {project.deskripsi}
            </p>
          )}

          {/* Progress */}
          <div className="mt-auto space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
              </div>
              <Progress value={progress} color={progress === 100 ? "success" : "primary"} />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{project.task_done ?? 0}</span>/{project.task_count ?? 0} task
              </span>
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{project.module_count ?? 0}</span> modul
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link href={`${projectUrl}/board`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                <button className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors">
                  <FiLayout className="w-3 h-3" />
                  Board
                </button>
              </Link>
              <Link href={`${projectUrl}/list`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                <button className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors">
                  <FiList className="w-3 h-3" />
                  List
                </button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
