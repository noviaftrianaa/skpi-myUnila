"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Spinner } from "../components/ui";
import { FiSettings } from "react-icons/fi";
import { projectService, type Project } from "@/lib/services/project/projectService";
import Link from "next/link";

export default function GlobalSettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    projectService
      .getProjects({ per_page: 50 })
      .then((res) => setProjects(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings className="w-6 h-6 text-[#0B5EA8]" />
          Pengaturan
        </h1>
        <p className="text-sm text-gray-500 mt-1">Pilih project untuk mengelola pengaturan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link key={p.id} href={`/dashboard/project-management/${p.id}/settings`}>
            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5">
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">{p.nama}</h3>
                <p className="text-xs text-gray-400 font-mono">{p.kode}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
