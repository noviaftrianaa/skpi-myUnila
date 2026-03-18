"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Input,
} from "@heroui/react";
import {
  FiFolder,
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { motion } from "framer-motion";
import { projectManagementMenuConfig } from "./config/menuConfig";
import ProjectCard from "./components/ProjectCard";
import ProjectCreateModal from "./components/ProjectCreateModal";
import { projectService, type Project, type ProjectStats } from "@/lib/services/project/projectService";

const APP_KEY = "project-management";

export default function ProjectManagementDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, projectsData] = await Promise.all([
          projectService.getStats().catch(() => null),
          projectService.getProjects({ per_page: 50 }).catch(() => ({ data: [], meta: { total: 0, page: 1, per_page: 50, total_pages: 0 } })),
        ]);
        if (isMounted) {
          setStats(statsData);
          setProjects(projectsData.data);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const statsCards = [
    {
      title: "Total Project",
      value: stats?.total_project ?? 0,
      icon: <FiFolder className="w-7 h-7 text-white" />,
      color: "from-indigo-500 to-indigo-600",
      subtitle: "project terdaftar",
    },
    {
      title: "Project Aktif",
      value: stats?.project_aktif ?? 0,
      icon: <FiActivity className="w-7 h-7 text-white" />,
      color: "from-emerald-500 to-emerald-600",
      subtitle: "sedang berjalan",
    },
    {
      title: "Task Selesai",
      value: stats?.task_done ?? 0,
      icon: <FiCheckCircle className="w-7 h-7 text-white" />,
      color: "from-blue-500 to-blue-600",
      subtitle: "task telah selesai",
    },
    {
      title: "Task Overdue",
      value: stats?.task_overdue ?? 0,
      icon: <FiAlertTriangle className="w-7 h-7 text-white" />,
      color: "from-orange-500 to-orange-600",
      subtitle: "melewati deadline",
    },
  ];

  const filteredProjects = projects.filter(p =>
    !search || p.nama.toLowerCase().includes(search.toLowerCase()) || p.kode.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  if (isLoading) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="Project Management"
        appIcon={<FiFolder className="w-6 h-6 text-white" />}
        appKey={APP_KEY}
        fallbackMenus={projectManagementMenuConfig}
        pageTitle="Dashboard"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Project Management"
      appIcon={<FiFolder className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={projectManagementMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B5EA8] via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiFolder className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Project Management System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                🎯 Selamat Datang, {user?.name?.split(" ")[0] ?? "Developer"}!
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Kelola dan pantau progress semua project development secara terpusat.
              </p>
            </div>
            <Button
              size="md"
              className="bg-white text-[#0B5EA8] font-semibold shrink-0 hover:bg-blue-50 transition-colors"
              startContent={<FiPlus className="w-4 h-4" />}
              onPress={() => setIsCreateOpen(true)}
            >
              + Project
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`bg-gradient-to-br ${stat.color} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <CardBody className="p-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/90 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-[10px] text-white/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Projects section */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFolder className="w-5 h-5 text-[#0B5EA8]" />
              Semua Project
              <span className="text-sm font-normal text-gray-400">({filteredProjects.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onValueChange={setSearch}
                placeholder="Cari project..."
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="sm"
                className="w-64"
              />
              <Button
                color="primary"
                className="bg-[#0B5EA8] text-white"
                size="sm"
                startContent={<FiPlus className="w-4 h-4" />}
                onPress={() => setIsCreateOpen(true)}
              >
                Buat Project
              </Button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
              <CardBody className="flex flex-col items-center justify-center py-16">
                <FiFolder className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {search ? "Tidak ada project yang cocok" : "Belum ada project"}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {search ? "Coba kata kunci lain" : "Mulai dengan membuat project pertama Anda!"}
                </p>
                {!search && (
                  <Button
                    color="primary"
                    className="bg-[#0B5EA8]"
                    size="sm"
                    startContent={<FiPlus className="w-4 h-4" />}
                    onPress={() => setIsCreateOpen(true)}
                  >
                    Buat Project Pertama
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </DashboardLayoutWithDynamicMenu>
  );
}
