"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Progress,
  Chip,
  Button,
  Badge,
  Spinner,
} from "@heroui/react";
import {
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
  FiRefreshCw,
  FiServer,
  FiAlertTriangle,
  FiBookOpen,
} from "react-icons/fi";
import { BsCloudUpload } from "react-icons/bs";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "./config/menuConfig";
import Link from "next/link";
import { referensiService, type ReferensiMetadata } from "@/lib/services/referensiService";
import { toast } from "react-hot-toast";

export default function SisterIntegratorDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [metadata, setMetadata] = useState<ReferensiMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setIsLoading(true);
      const data = await referensiService.getMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Gagal memuat metadata referensi");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate real statistics from metadata
  const totalRecords = metadata.reduce((sum, m) => sum + m.total_records, 0);
  const syncedCount = metadata.filter((m) => m.total_records > 0).length;
  const successRate = metadata.length > 0 ? ((syncedCount / metadata.length) * 100).toFixed(1) : 0;
  const pendingCount = metadata.length - syncedCount;

  // Sync statistics - using real data
  const syncStats = [
    {
      title: "Total Records Synced",
      value: totalRecords.toLocaleString(),
      icon: <FiDatabase className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      change: `${metadata.length} endpoints`,
      trend: "up",
      subtitle: "total data referensi",
      progress: 85,
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      change: `${syncedCount}/${metadata.length}`,
      trend: "up",
      subtitle: "endpoints synced",
      progress: parseFloat(successRate.toString()),
    },
    {
      title: "API Connection",
      value: "Healthy",
      icon: <FiServer className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      change: "Active",
      trend: "up",
      subtitle: "SISTER endpoint",
      progress: 100,
    },
    {
      title: "Pending Tasks",
      value: pendingCount.toString(),
      icon: <FiClock className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      change: `${pendingCount} belum sync`,
      trend: "up",
      subtitle: "in queue",
      progress: pendingCount > 0 ? 50 : 0,
    },
  ];

  // Recent sync activities - from real data (top 3 latest)
  const recentSyncs = metadata
    .filter(m => m.last_sync)
    .sort((a, b) => {
      const dateA = a.last_sync ? new Date(a.last_sync).getTime() : 0;
      const dateB = b.last_sync ? new Date(b.last_sync).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3)
    .map(m => ({
      entity: m.name,
      status: m.total_records > 0 ? "success" : "pending",
      records: m.total_records > 0 ? m.total_records.toString() : "0",
      time: formatTimeAgo(m.last_sync),
      duration: "-",
      icon: <BsCloudUpload className="w-4 h-4" />,
      color: m.total_records > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600",
      href: `/dashboard/sister-integrator/referensi`,
    }));

  // Referensi data modules - from real data (top 3)
  const referensiModules = metadata.slice(0, 3).map(m => ({
    name: m.name,
    description: m.description,
    icon: <FiBookOpen className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    status: m.total_records > 0 ? "active" : "inactive",
    recordCount: m.total_records,
    lastSync: formatTimeAgo(m.last_sync),
    href: `/dashboard/sister-integrator/referensi`,
  }));

  // System health metrics
  const systemHealth = [
    { name: "SISTER API", status: "healthy", latency: "124ms", uptime: "99.8%" },
    { name: "Database Pool", status: "healthy", latency: "8ms", uptime: "100%" },
    { name: "API Gateway", status: "healthy", latency: "35ms", uptime: "99.9%" },
  ];

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  function formatTimeAgo(dateString?: string | null): string {
    if (!dateString) return "Belum pernah sync";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 30) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  if (isLoading) {
    return (
      <DashboardLayout
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        menuConfig={sisterIntegratorMenuConfig}
        pageTitle="Dashboard"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RiGovernmentFill className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    SISTER API Integration System - Kemenristekdikti
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Selamat Datang, {user?.name || "Developer"}!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Monitor dan kelola sinkronisasi data referensi dengan SISTER API secara real-time
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <RiGovernmentFill className="w-12 h-12" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {syncStats.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group relative"
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${stat.color}`}></div>
                <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color}`}></div>
              </div>

              <CardBody className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                    {/* Decorative ring */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-20 blur-lg group-hover:opacity-30 transition-opacity`}></div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={stat.trend === "up" ? "success" : "warning"}
                      startContent={
                        stat.trend === "up" ? (
                          <FiTrendingUp className="w-3 h-3" />
                        ) : (
                          <FiAlertTriangle className="w-3 h-3" />
                        )
                      }
                      classNames={{
                        base: "px-2 py-1",
                        content: "font-bold text-xs",
                      }}
                    >
                      {stat.change}
                    </Chip>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={stat.progress}
                      className="flex-1"
                      classNames={{
                        indicator: `bg-gradient-to-r ${stat.color}`,
                        track: "bg-gray-100 dark:bg-gray-800",
                      }}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      {stat.progress.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {stat.subtitle}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referensi Modules */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-purple-600" />
                    Data Referensi
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                    as={Link}
                    href="/dashboard/sister-integrator/referensi"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {referensiModules.map((module, index) => (
                    <Link key={index} href={module.href}>
                      <Card
                        isPressable
                        className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg`}
                            >
                              {module.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                {module.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                {module.description}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={module.status === "active" ? "success" : "default"}
                                >
                                  {module.recordCount} records
                                </Chip>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {module.lastSync}
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
                    <FiActivity className="w-5 h-5 text-purple-600" />
                    Recent Sync Activities
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                    as={Link}
                    href="/dashboard/sister-integrator/referensi"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentSyncs.map((sync, index) => (
                    <Link key={index} href={sync.href}>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg ${sync.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          {sync.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {sync.entity}
                            </h4>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                sync.status === "success"
                                  ? "success"
                                  : sync.status === "running"
                                  ? "primary"
                                  : "default"
                              }
                              className="flex-shrink-0"
                            >
                              {sync.status === "success"
                                ? "Success"
                                : sync.status === "running"
                                ? "Running"
                                : "Pending"}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiDatabase className="w-3 h-3" />
                              {sync.records} records
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {sync.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
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
                    <FiServer className="w-5 h-5 text-purple-600" />
                    System Health
                  </h3>
                  <Chip size="sm" color="success" variant="flat">
                    All Healthy
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
            <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Referensi</span>
                    <span className="font-bold text-gray-900 dark:text-white">{metadata.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Active Syncs</span>
                    <Badge content={syncedCount.toString()} color="success" size="sm">
                      <span className="font-bold text-gray-900 dark:text-white">{syncedCount}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Failed Today</span>
                    <span className="font-bold text-green-600">0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Sync Time</span>
                    <span className="font-bold text-gray-900 dark:text-white">0.8s</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-md border-l-4 border-l-purple-500">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                    <RiGovernmentFill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      SISTER Integration
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Sistem terintegrasi dengan SISTER API Kemenristekdikti untuk sinkronisasi data referensi secara otomatis.
                    </p>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="text-xs"
                      as={Link}
                      href="/dashboard/sister-integrator/referensi"
                    >
                      View Referensi
                    </Button>
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
