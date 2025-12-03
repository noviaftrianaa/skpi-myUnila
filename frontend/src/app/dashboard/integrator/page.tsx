"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Chip,
  Skeleton,
} from "@heroui/react";
import {
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiServer,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiKey,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { BsCloudUpload } from "react-icons/bs";
import Link from "next/link";
import { myunilaIntegratorMenuConfig } from "./config/menuConfig";

// Interface untuk dashboard stats
interface ModuleStat {
  name: string;
  key: string;
  description: string;
  total_count: number;
  last_sync: string | null;
  status: string;
  href: string;
}

interface QuickStats {
  total_pegawai: number;
  total_mahasiswa: number;
  total_kelas: number;
  total_presensi: number;
}

interface DashboardStats {
  module_stats: ModuleStat[];
  quick_stats: QuickStats;
  total_records_synced: number;
  total_endpoints: number;
  synced_endpoints: number;
  success_rate: number;
  api_status: string;
  last_sync_time: string | null;
}

export default function MyUnilaIntegratorDashboard() {
  useRequireAuth();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for now - akan diganti dengan real API call nanti
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Stats cards data (placeholder)
  const statsCards = [
    {
      title: "Total Pegawai",
      value: "0",
      subtitle: "Data SIKEP",
      icon: <FiUsers className="w-7 h-7 text-white" />,
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
    },
    {
      title: "Total Mahasiswa",
      value: "0",
      subtitle: "Data Siakadu",
      icon: <FiBookOpen className="w-7 h-7 text-white" />,
      gradient: "from-green-500 via-green-600 to-teal-600",
    },
    {
      title: "Total Kelas",
      value: "0",
      subtitle: "Aktif Semester Ini",
      icon: <FiCalendar className="w-7 h-7 text-white" />,
      gradient: "from-purple-500 via-purple-600 to-indigo-600",
    },
    {
      title: "Integrasi Aktif",
      value: "4",
      subtitle: "SIKEP, Siakadu, Sirandu, ManAkses",
      icon: <FiServer className="w-7 h-7 text-white" />,
      gradient: "from-orange-500 via-orange-600 to-amber-600",
    },
  ];

  // Module data for overview
  const moduleData = [
    {
      name: "SIKEP - Pegawai",
      key: "sikep_pegawai",
      description: "Data pegawai dari sistem SIKEP",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/sikep/pegawai",
      icon: <FiUsers className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "SIKEP - Unit Orga",
      key: "sikep_unit",
      description: "Data unit organisasi SIKEP",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/sikep/unit-orga",
      icon: <FiDatabase className="w-6 h-6" />,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "Siakadu - Mahasiswa",
      key: "siakadu_mhs",
      description: "Data mahasiswa dari Siakadu",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/siakadu/mahasiswa",
      icon: <FiBookOpen className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Siakadu - Mata Kuliah",
      key: "siakadu_mk",
      description: "Data mata kuliah dari Siakadu",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/siakadu/mata-kuliah",
      icon: <FiBookOpen className="w-6 h-6" />,
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      name: "Sirandu - Presensi",
      key: "sirandu_presensi",
      description: "Data presensi dari Sirandu",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/sirandu/presensi-mahasiswa",
      icon: <FiCalendar className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      name: "ManAkses - SSO",
      key: "manakses_sso",
      description: "Data SSO dari ManAkses",
      count: 0,
      status: "pending",
      href: "/dashboard/integrator/manakses/sso-radius",
      icon: <FiKey className="w-6 h-6" />,
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  // System health metrics
  const systemHealth = [
    { name: "SIKEP API", status: "pending" as const, latency: "-", uptime: "-" },
    { name: "Siakadu API", status: "pending" as const, latency: "-", uptime: "-" },
    { name: "Sirandu API", status: "pending" as const, latency: "-", uptime: "-" },
    { name: "ManAkses API", status: "pending" as const, latency: "-", uptime: "-" },
  ];

  // Skeleton Loading Component
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl">
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
          <Card className="border-none shadow-md">
            <CardBody className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardBody className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
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
        appName="MyUnila Integrator"
        appIcon={<MdSchool className="w-6 h-6 text-white" />}
        menuConfig={myunilaIntegratorMenuConfig}
        pageTitle="Dashboard"
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={myunilaIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Selamat Datang, {user?.name || "Admin"}!
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
                  MyUnila Integrator - Platform integrasi data internal sistem MyUnila (SIKEP, Siakadu, Sirandu, ManAkses)
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <BsCloudUpload className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Chip
                color="warning"
                variant="flat"
                className="bg-amber-500/20 text-white border-amber-400/30"
                startContent={<FiClock className="w-3 h-3" />}
              >
                Coming Soon
              </Chip>
              <Chip
                color="default"
                variant="flat"
                className="bg-white/20 text-white border-white/30"
                startContent={<FiServer className="w-3 h-3" />}
              >
                4 Sistem Terintegrasi
              </Chip>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${card.gradient} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80">{card.title}</p>
                    <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                    <p className="text-[10px] text-white/60 truncate">{card.subtitle}</p>
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
            {/* Data Modules Overview */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiDatabase className="w-5 h-5 text-emerald-600" />
                    Data Overview
                  </h3>
                  <Chip size="sm" color="warning" variant="flat">
                    Coming Soon
                  </Chip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moduleData.map((module, index) => (
                    <Link key={index} href={module.href}>
                      <Card
                        isPressable
                        className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center text-white shadow-lg`}
                            >
                              {module.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {module.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {module.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                >
                                  Pending
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiActivity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Tentang MyUnila Integrator
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      MyUnila Integrator adalah platform untuk mengintegrasikan dan mensinkronisasi data
                      dari berbagai sistem internal UNILA seperti SIKEP (kepegawaian), Siakadu (akademik),
                      Sirandu (presensi), dan ManAkses (manajemen akses). Fitur-fitur ini sedang dalam
                      tahap pengembangan.
                    </p>
                  </div>
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
                    <FiServer className="w-5 h-5 text-emerald-600" />
                    System Health
                  </h3>
                  <Chip size="sm" color="warning" variant="flat">
                    Pending
                  </Chip>
                </div>

                <div className="space-y-3">
                  {systemHealth.map((system, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {system.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Latency: {system.latency} • Uptime: {system.uptime}
                          </p>
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                      >
                        Pending
                      </Chip>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">SIKEP Endpoints</span>
                    <span className="text-sm font-bold text-emerald-600">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Siakadu Endpoints</span>
                    <span className="text-sm font-bold text-emerald-600">9</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sirandu Endpoints</span>
                    <span className="text-sm font-bold text-emerald-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ManAkses Endpoints</span>
                    <span className="text-sm font-bold text-emerald-600">2</span>
                  </div>
                  <div className="border-t border-emerald-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Endpoints</span>
                      <span className="text-lg font-bold text-emerald-600">19</span>
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
