"use client";

import { useState } from "react";
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
} from "@heroui/react";
import {
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
  FiRefreshCw,
  FiServer,
  FiZap,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdCloudDone, MdCloudOff } from "react-icons/md";
import { BsCloudUpload, BsCloudDownload } from "react-icons/bs";
import { feederIntegratorMenuConfig } from "./config/menuConfig";

export default function FeederIntegratorDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync statistics
  const syncStats = [
    {
      title: "Total Records Synced",
      value: "45,873",
      icon: <FiDatabase className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      change: "+2,341",
      trend: "up",
      subtitle: "records hari ini",
      progress: 92,
    },
    {
      title: "Success Rate",
      value: "98.7%",
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      change: "+0.5%",
      trend: "up",
      subtitle: "dari total sync",
      progress: 98.7,
    },
    {
      title: "Active Connections",
      value: "3/5",
      icon: <FiServer className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      change: "1 offline",
      trend: "down",
      subtitle: "PDDIKTI endpoints",
      progress: 60,
    },
    {
      title: "Pending Tasks",
      value: "12",
      icon: <FiClock className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      change: "-8",
      trend: "up",
      subtitle: "in queue",
      progress: 25,
    },
  ];

  // Recent sync activities
  const recentSyncs = [
    {
      entity: "Mahasiswa",
      status: "success",
      records: "2,547",
      time: "2 menit yang lalu",
      duration: "1.2s",
      icon: <BsCloudUpload className="w-4 h-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      entity: "Nilai Mahasiswa",
      status: "success",
      records: "8,923",
      time: "15 menit yang lalu",
      duration: "3.8s",
      icon: <BsCloudUpload className="w-4 h-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      entity: "Dosen",
      status: "running",
      records: "156/200",
      time: "Sedang berjalan",
      duration: "~30s",
      icon: <FiRefreshCw className="w-4 h-4 animate-spin" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      entity: "Kelas Kuliah",
      status: "failed",
      records: "0/342",
      time: "1 jam yang lalu",
      duration: "Failed",
      icon: <FiXCircle className="w-4 h-4" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  // Scheduled tasks
  const scheduledTasks = [
    {
      name: "Daily Sync - Mahasiswa",
      schedule: "Setiap hari 02:00 WIB",
      nextRun: "12 jam lagi",
      status: "active",
      lastRun: "Success",
    },
    {
      name: "Weekly Sync - Nilai",
      schedule: "Setiap Senin 00:00 WIB",
      nextRun: "3 hari lagi",
      status: "active",
      lastRun: "Success",
    },
    {
      name: "Monthly Sync - Dosen",
      schedule: "Tanggal 1 setiap bulan",
      nextRun: "15 hari lagi",
      status: "active",
      lastRun: "Success",
    },
    {
      name: "Hourly Health Check",
      schedule: "Setiap jam",
      nextRun: "23 menit lagi",
      status: "paused",
      lastRun: "Warning",
    },
  ];

  // System health metrics
  const systemHealth = [
    { name: "API Gateway", status: "healthy", latency: "45ms", uptime: "99.9%" },
    { name: "Database Pool", status: "healthy", latency: "12ms", uptime: "100%" },
    { name: "Redis Cache", status: "healthy", latency: "3ms", uptime: "99.8%" },
    { name: "PDDIKTI Endpoint", status: "degraded", latency: "1.2s", uptime: "95.4%" },
    { name: "Queue Worker", status: "healthy", latency: "89ms", uptime: "99.7%" },
  ];

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSync className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    PDDIKTI Feeder Integration System
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Selamat Datang, {user?.name || "Developer"}!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Monitor dan kelola sinkronisasi data dengan PDDIKTI secara real-time
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MdSync className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                color="default"
                variant="flat"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                startContent={<FiRefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
                onClick={handleQuickSync}
                isLoading={isSyncing}
              >
                Quick Sync All
              </Button>
              <Button
                color="default"
                variant="flat"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                startContent={<FiActivity className="w-4 h-4" />}
              >
                View Monitoring
              </Button>
              <Button
                color="default"
                variant="flat"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                startContent={<FiServer className="w-4 h-4" />}
              >
                Check Health
              </Button>
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
                      {stat.progress}%
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
            {/* Recent Sync Activities */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-indigo-600" />
                    Recent Sync Activities
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentSyncs.map((sync, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                    >
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
                                : "danger"
                            }
                            className="flex-shrink-0"
                          >
                            {sync.status === "success"
                              ? "Success"
                              : sync.status === "running"
                              ? "Running"
                              : "Failed"}
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
                          <span className="flex items-center gap-1">
                            <FiZap className="w-3 h-3" />
                            {sync.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* System Health */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiServer className="w-5 h-5 text-indigo-600" />
                    System Health
                  </h3>
                  <Chip size="sm" color="success" variant="flat">
                    4/5 Healthy
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
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Scheduled Tasks */}
            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-indigo-600" />
                  Scheduled Tasks
                </h3>
                <div className="space-y-3">
                  {scheduledTasks.map((task, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {task.name}
                        </h4>
                        <Chip
                          size="sm"
                          variant="dot"
                          color={task.status === "active" ? "success" : "default"}
                        >
                          {task.status}
                        </Chip>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {task.schedule}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Next: {task.nextRun}</span>
                        <span
                          className={`font-medium ${
                            task.lastRun === "Success"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {task.lastRun}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="w-full mt-3"
                  startContent={<FiClock className="w-4 h-4" />}
                >
                  Manage Schedules
                </Button>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Entities</span>
                    <span className="font-bold text-gray-900 dark:text-white">23</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Active Syncs</span>
                    <Badge content="1" color="primary" size="sm">
                      <span className="font-bold text-gray-900 dark:text-white">12</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Failed Today</span>
                    <span className="font-bold text-red-600">5</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Sync Time</span>
                    <span className="font-bold text-gray-900 dark:text-white">2.4s</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Queue Size</span>
                    <span className="font-bold text-gray-900 dark:text-white">47</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Alert Card */}
            <Card className="border-none shadow-md border-l-4 border-l-yellow-500">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                    <FiAlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Perhatian!
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      PDDIKTI endpoint mengalami peningkatan latency. Monitor sistem secara berkala.
                    </p>
                    <Button size="sm" color="warning" variant="flat" className="text-xs">
                      Check Details
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
