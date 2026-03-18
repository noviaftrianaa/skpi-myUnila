"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FiLayout, FiList, FiFolder } from "react-icons/fi";
import Link from "next/link";
import type { Project } from "@/lib/services/project/projectService";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  showVisibility?: boolean;
}

function VisibilityBadge({ visibility }: { visibility?: string }) {
  if (!visibility) return null;
  if (visibility === 'private') return <span className="text-[10px] text-gray-400">🔒 Private</span>;
  if (visibility === 'unit') return <span className="text-[10px] text-blue-500">🏢 Unit</span>;
  if (visibility === 'public') return <span className="text-[10px] text-green-500">🌐 Public</span>;
  return null;
}

export default function ProjectCard({ project, onEdit, showVisibility }: ProjectCardProps) {
  const progress = project.progress ?? (project.task_count && project.task_count > 0
    ? Math.round(((project.task_done ?? 0) / project.task_count) * 100)
    : 0);

  const statusColor = project.status === 'active'
    ? 'success'
    : project.status === 'completed'
    ? 'primary'
    : 'default';

  const statusLabel = project.status === 'active'
    ? 'Aktif'
    : project.status === 'completed'
    ? 'Selesai'
    : 'Arsip';

  const accentColor = project.warna || '#0B5EA8';

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Color accent strip */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: accentColor }}
      />
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <FiFolder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                {project.nama}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">{project.kode}</span>
                {showVisibility && <VisibilityBadge visibility={project.visibility} />}
              </div>
            </div>
          </div>
          <Chip size="sm" color={statusColor} variant="flat" className="text-[10px]">
            {statusLabel}
          </Chip>
        </div>

        {/* Description */}
        {project.deskripsi && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {project.deskripsi}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Task & Module count */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {project.task_done ?? 0}/{project.task_count ?? 0}
            </span> task selesai
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {project.module_count ?? 0}
            </span> modul
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/dashboard/project-management/${project.id}/board`} className="flex-1">
            <Button
              size="sm"
              variant="flat"
              color="primary"
              className="w-full text-xs"
              startContent={<FiLayout className="w-3 h-3" />}
            >
              Board
            </Button>
          </Link>
          <Link href={`/dashboard/project-management/${project.id}/list`} className="flex-1">
            <Button
              size="sm"
              variant="bordered"
              className="w-full text-xs"
              startContent={<FiList className="w-3 h-3" />}
            >
              List
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
