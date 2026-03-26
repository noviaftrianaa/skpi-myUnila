"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, Spinner } from "../../components/ui";
import { FiActivity, FiFolder } from "react-icons/fi";
import Link from "next/link";
import ActivityFeed from "../../components/ActivityFeed";
import {
  projectService,
  type Project,
  type Activity,
} from "@/lib/services/project/projectService";

export default function ActivityPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [proj, acts] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getActivity(projectId, { per_page: 50 }),
        ]);
        setProject(proj);
        setActivities(acts?.data ?? []);
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
        <div className="space-y-4 max-w-4xl mx-auto">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardBody className="p-5">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <FiActivity className="w-4 h-4 text-[#0B5EA8]" />
                Riwayat Aktivitas
              </h2>
              <ActivityFeed activities={activities} loading={isLoading} />
            </CardBody>
          </Card>
        </div>
      </>
);
}
