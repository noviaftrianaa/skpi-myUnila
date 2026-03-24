"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "../../components/ui";
import { FiLayers, FiFolder } from "react-icons/fi";
import Link from "next/link";
import ModuleList from "../../components/ModuleList";
import {
  projectService,
  type Project,
  type ProjectModule,
} from "@/lib/services/project/projectService";

export default function ModulesPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [proj, mods] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getModules(projectId),
        ]);
        setProject(proj);
        setModules(mods);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        </>
);
  }

  return (
      <>
        <div className="space-y-4 max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/project-management"
              className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
            >
              Project Management
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/dashboard/project-management/${projectId}/board`}
              className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
            >
              {project?.nama ?? "..."}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <FiLayers className="w-3.5 h-3.5" />
              Modul
            </span>
          </div>

          <ModuleList
            projectId={projectId}
            modules={modules}
            onModulesChange={setModules}
          />
        </div>
      </>
);
}
