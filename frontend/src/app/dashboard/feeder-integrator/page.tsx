"use client";

import { useState, useEffect, useRef } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Skeleton,
} from "@heroui/react";
import {
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiArrowLeft,
  FiServer,
  FiUsers,
  FiAward,
  FiBook,
  FiFileText,
  FiLayers,
} from "react-icons/fi";
import { BsCloudUpload } from "react-icons/bs";
import { MdSchool } from "react-icons/md";
import { feederIntegratorMenuConfig } from "./config/menuConfig";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { feederClient } from "@/lib/api/feederClient";

interface ModuleStat {
  name: string;
  key: string;
  description: string;
  total_count: number;
  last_sync: string | null;
  status: string;
  href: string;
}

interface RecentSync {
  id: number;
  endpoint_name: string;
  endpoint_key: string;
  status: string;
  total_records: number;
  synced_count: number;
  failed_count: number;
  duration_ms: number;
  synced_by: string;
  synced_at: string;
}

interface QuickStats {
  total_mahasiswa: number;
  total_mahasiswa_aktif: number;
  total_kelas_kuliah: number;
  total_nilai_perkuliahan: number;
  total_transkrip_nilai: number;
  total_prestasi: number;
  total_aktivitas: number;
  total_matkul: number;
}

interface DashboardStats {
  total_records_synced: number;
  total_endpoints: number;
  synced_endpoints: number;
  success_rate: number;
  last_sync_time: string | null;
  api_status: string;
  module_stats: ModuleStat[];
  recent_syncs: RecentSync[];
  quick_stats: QuickStats;
}

export default function FeederIntegratorDashboard() {
  useRequireAuth();
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Check scroll position when data is loaded
  useEffect(() => {
    if (!isLoading && dashboardStats) {
      // Small delay to ensure DOM is updated
      setTimeout(checkScrollPosition, 100);
    }
  }, [isLoading, dashboardStats]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await feederClient.get("/dashboard/stats");
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  // Scroll handler
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // Card width + gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Calculate statistics from API response
  const totalRecords = dashboardStats?.total_records_synced || 0;
  const totalEndpoints = dashboardStats?.total_endpoints || 0;
  const syncedEndpoints = dashboardStats?.synced_endpoints || 0;
  const successRate = dashboardStats?.success_rate || 0;
  const pendingCount = totalEndpoints - syncedEndpoints;
  const apiStatus = dashboardStats?.api_status || "unknown";

  // Sync statistics cards
  const syncStats = [
    {
      title: "Total Records Synced",
      value: totalRecords.toLocaleString(),
      icon: <FiDatabase className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      change: `${totalEndpoints} endpoints`,
      trend: "up",
      subtitle: "all modules",
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      change: `${syncedEndpoints}/${totalEndpoints}`,
      trend: "up",
      subtitle: "endpoints synced",
    },
    {
      title: "API Connection",
      value: apiStatus === "healthy" ? "Healthy" : "Unknown",
      icon: <FiServer className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      change: apiStatus === "healthy" ? "Active" : "Check",
      trend: "up",
      subtitle: "Neo Feeder endpoint",
    },
    {
      title: "Pending Tasks",
      value: pendingCount.toString(),
      icon: <FiClock className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      change: `${pendingCount} belum sync`,
      trend: "up",
      subtitle: "in queue",
    },
  ];

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Belum pernah sync";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon for module
  const getModuleIcon = (key: string) => {
    const icons: Record<string, JSX.Element> = {
      mahasiswa: <FiUsers className="w-6 h-6" />,
      aktivitas_mahasiswa: <FiActivity className="w-6 h-6" />,
      kelas_kuliah: <FiLayers className="w-6 h-6" />,
      nilai_perkuliahan: <FiFileText className="w-6 h-6" />,
      transkrip_nilai: <FiBook className="w-6 h-6" />,
      prestasi: <FiAward className="w-6 h-6" />,
      matkul_kurikulum: <FiBook className="w-6 h-6" />,
    };
    return icons[key] || <FiDatabase className="w-6 h-6" />;
  };

  // Get color for module
  const getModuleColor = (key: string) => {
    const colors: Record<string, string> = {
      mahasiswa: "from-blue-500 to-indigo-600",
      aktivitas_mahasiswa: "from-green-500 to-emerald-600",
      kelas_kuliah: "from-purple-500 to-violet-600",
      nilai_perkuliahan: "from-orange-500 to-amber-600",
      transkrip_nilai: "from-cyan-500 to-teal-600",
      prestasi: "from-pink-500 to-rose-600",
      matkul_kurikulum: "from-indigo-500 to-blue-600",
    };
    return colors[key] || "from-gray-500 to-gray-600";
  };

  // System health metrics
  const systemHealth = [
    { name: "Neo Feeder API", status: apiStatus as "healthy" | "degraded" | "error", latency: "145ms", uptime: "99.5%" },
    { name: "Database Pool", status: "healthy" as const, latency: "12ms", uptime: "100%" },
    { name: "API Gateway", status: "healthy" as const, latency: "28ms", uptime: "99.9%" },
  ];

  // Skeleton Loading Component
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-3 bg-white/20" />
              <Skeleton className="h-8 w-72 mb-2 bg-white/20" />
              <Skeleton className="h-4 w-96 bg-white/20" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="w-20 h-20 rounded-2xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border-none shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Modules Skeleton with Horizontal Scroll */}
          <Card className="border-none shadow-md">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-none shadow-sm flex-shrink-0 w-[280px]">
                    <CardBody className="p-4">
                      <div className="flex flex-col gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-full mb-1" />
                          <Skeleton className="h-3 w-3/4 mb-2" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-3 w-28 mt-2" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Sync Skeleton */}
          <Card className="border-none shadow-md">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="flex gap-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health Skeleton */}
          <Card className="border-none shadow-md">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats Skeleton */}
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <CardBody className="p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout
        appName="Feeder Integrator"
        appIcon={<MdSchool className="w-6 h-6 text-white" />}
        menuConfig={feederIntegratorMenuConfig}
        pageTitle="Dashboard"
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MdSchool className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    Neo Feeder PDDIKTI Integration System
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Selamat Datang, {user?.name || "Developer"}!
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Monitor dan kelola sinkronisasi data mahasiswa dengan Neo Feeder PDDIKTI API secara real-time
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MdSchool className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {syncStats.map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-white/90">{stat.title}</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] text-white/80 flex items-center gap-1">
                      {stat.trend === "up" && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Modules with Horizontal Scroll */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiDatabase className="w-5 h-5 text-blue-600" />
                    Data Overview
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className={`${!canScrollLeft ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100 dark:hover:bg-blue-900/30"}`}
                      onClick={() => scroll("left")}
                      isDisabled={!canScrollLeft}
                    >
                      <FiArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className={`${!canScrollRight ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100 dark:hover:bg-blue-900/30"}`}
                      onClick={() => scroll("right")}
                      isDisabled={!canScrollRight}
                    >
                      <FiArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div
                  ref={scrollContainerRef}
                  onScroll={checkScrollPosition}
                  className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {dashboardStats?.module_stats?.map((module, index) => (
                    <Link key={index} href={module.href} className="flex-shrink-0">
                      <Card
                        isPressable
                        className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-[280px]"
                      >
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getModuleColor(module.key)} flex items-center justify-center text-white shadow-lg`}
                            >
                              {getModuleIcon(module.key)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                {module.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 h-8">
                                {module.description}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={module.status === "active" ? "success" : "default"}
                                >
                                  {module.total_count.toLocaleString()} records
                                </Chip>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(module.last_sync)}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Recent Sync Activities */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-blue-600" />
                    Recent Sync Activities
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                    as={Link}
                    href="/dashboard/feeder-integrator/logs"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {dashboardStats?.recent_syncs && dashboardStats.recent_syncs.length > 0 ? (
                    dashboardStats.recent_syncs.slice(0, 5).map((sync, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                          sync.status === "success" ? "bg-green-100 text-green-600" :
                          sync.status === "partial" ? "bg-yellow-100 text-yellow-600" :
                          sync.status === "failed" ? "bg-red-100 text-red-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          <BsCloudUpload className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm capitalize">
                              {sync.endpoint_name.replace(/_/g, " ")}
                            </h4>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                sync.status === "success" ? "success" :
                                sync.status === "partial" ? "warning" :
                                sync.status === "failed" ? "danger" :
                                "default"
                              }
                              className="flex-shrink-0"
                            >
                              {sync.status}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiDatabase className="w-3 h-3" />
                              {sync.synced_count.toLocaleString()} synced
                            </span>
                            {sync.failed_count > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                {sync.failed_count} failed
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {formatDate(sync.synced_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FiActivity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada aktivitas sync</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* System Health */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiServer className="w-5 h-5 text-blue-600" />
                    System Health
                  </h3>
                  <Chip size="sm" color={apiStatus === "healthy" ? "success" : "warning"} variant="flat">
                    {apiStatus === "healthy" ? "All Healthy" : "Check Status"}
                  </Chip>
                </div>
                <div className="space-y-3">
                  {systemHealth.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            service.status === "healthy"
                              ? "bg-green-500 animate-pulse"
                              : service.status === "degraded"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Latency: {service.latency} • Uptime: {service.uptime}
                          </p>
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          service.status === "healthy"
                            ? "success"
                            : service.status === "degraded"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {service.status}
                      </Chip>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Mahasiswa</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {dashboardStats?.quick_stats?.total_mahasiswa?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mahasiswa Aktif</span>
                    <span className="font-bold text-green-600">
                      {dashboardStats?.quick_stats?.total_mahasiswa_aktif?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Kelas Kuliah</span>
                    <span className="font-bold text-blue-600">
                      {dashboardStats?.quick_stats?.total_kelas_kuliah?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Nilai Perkuliahan</span>
                    <span className="font-bold text-orange-600">
                      {dashboardStats?.quick_stats?.total_nilai_perkuliahan?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Transkrip Nilai</span>
                    <span className="font-bold text-cyan-600">
                      {dashboardStats?.quick_stats?.total_transkrip_nilai?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Prestasi</span>
                    <span className="font-bold text-pink-600">
                      {dashboardStats?.quick_stats?.total_prestasi?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Aktivitas Mahasiswa</span>
                    <span className="font-bold text-emerald-600">
                      {dashboardStats?.quick_stats?.total_aktivitas?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mata Kuliah</span>
                    <span className="font-bold text-indigo-600">
                      {dashboardStats?.quick_stats?.total_matkul?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sync Success Rate</span>
                      <span className="font-bold text-gray-900 dark:text-white">{successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
