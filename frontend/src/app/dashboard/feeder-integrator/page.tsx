"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Spinner,
} from "@heroui/react";
import {
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiServer,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi";
import { BsCloudUpload } from "react-icons/bs";
import { MdSchool } from "react-icons/md";
import { feederIntegratorMenuConfig } from "./config/menuConfig";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface MahasiswaStats {
  total_mahasiswa: number;
  total_aktif: number;
  total_tidak_aktif: number;
}

export default function FeederIntegratorDashboard() {
  useRequireAuth();
  const { user } = useAuth();

  const [mahasiswaStats, setMahasiswaStats] = useState<MahasiswaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call when backend is ready
      // const data = await feederMahasiswaService.getStats();
      // setMahasiswaStats(data);

      // Mock data for now
      setMahasiswaStats({
        total_mahasiswa: 0,
        total_aktif: 0,
        total_tidak_aktif: 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalMahasiswaRecords = mahasiswaStats ? mahasiswaStats.total_mahasiswa : 0;
  const syncedCount = totalMahasiswaRecords > 0 ? 1 : 0;
  const totalEndpoints = 1;
  const successRate = totalEndpoints > 0 ? ((syncedCount / totalEndpoints) * 100).toFixed(1) : 0;
  const pendingCount = totalEndpoints - syncedCount;

  // Sync statistics
  const syncStats = [
    {
      title: "Total Records Synced",
      value: totalMahasiswaRecords.toLocaleString(),
      icon: <FiDatabase className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      change: `${totalEndpoints} endpoints`,
      trend: "up",
      subtitle: "mahasiswa",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      change: `${syncedCount}/${totalEndpoints}`,
      trend: "up",
      subtitle: "endpoints synced",
    },
    {
      title: "API Connection",
      value: "Healthy",
      icon: <FiServer className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      change: "Active",
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

  // Recent sync activities
  const recentSyncs = [
    {
      entity: "Mahasiswa",
      status: "pending" as const,
      records: "0",
      time: "Belum pernah sync",
      duration: "-",
      icon: <BsCloudUpload className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-600",
      href: `/dashboard/feeder-integrator/pdrd/mahasiswa`,
    },
  ];

  // Data modules
  const dataModules = [
    {
      name: "Data Mahasiswa",
      description: "Sinkronisasi data mahasiswa dari Neo Feeder PDDIKTI API",
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      status: mahasiswaStats && mahasiswaStats.total_mahasiswa > 0 ? "active" : "inactive",
      recordCount: mahasiswaStats ? mahasiswaStats.total_mahasiswa : 0,
      lastSync: "Belum pernah sync",
      href: `/dashboard/feeder-integrator/pdrd/mahasiswa`,
    },
    {
      name: "Referensi",
      description: "Data referensi sistem feeder (jalur masuk, jenis evaluasi, dll)",
      icon: <FiBookOpen className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      status: "inactive" as const,
      recordCount: 0,
      lastSync: "Belum pernah sync",
      href: `/dashboard/feeder-integrator/referensi/jalur-masuk`,
    },
  ];

  // System health metrics
  const systemHealth = [
    { name: "Neo Feeder API", status: "healthy" as const, latency: "145ms", uptime: "99.5%" },
    { name: "Database Pool", status: "healthy" as const, latency: "12ms", uptime: "100%" },
    { name: "API Gateway", status: "healthy" as const, latency: "28ms", uptime: "99.9%" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout
        appName="Feeder Integrator"
        appIcon={<MdSchool className="w-6 h-6 text-white" />}
        menuConfig={feederIntegratorMenuConfig}
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
            {/* Data Modules */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiDatabase className="w-5 h-5 text-blue-600" />
                    Data Overview
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataModules.map((module, index) => (
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
                  {recentSyncs.map((sync, index) => (
                    <Link key={index} href={sync.href}>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
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
                              color="default"
                              className="flex-shrink-0"
                            >
                              Pending
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
                    <FiServer className="w-5 h-5 text-blue-600" />
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
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Mahasiswa</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {mahasiswaStats ? mahasiswaStats.total_mahasiswa.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mahasiswa Aktif</span>
                    <span className="font-bold text-green-600">
                      {mahasiswaStats ? mahasiswaStats.total_aktif.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mahasiswa Tidak Aktif</span>
                    <span className="font-bold text-orange-600">
                      {mahasiswaStats ? mahasiswaStats.total_tidak_aktif.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sync Success Rate</span>
                    <span className="font-bold text-gray-900 dark:text-white">{successRate}%</span>
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
