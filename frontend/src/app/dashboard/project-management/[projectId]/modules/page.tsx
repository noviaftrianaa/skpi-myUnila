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
        <div className="space-y-4 max-w-5xl mx-auto">
          <ModuleList
            projectId={projectId}
            modules={modules}
            onModulesChange={setModules}
          />
        </div>
      </>
);
}
