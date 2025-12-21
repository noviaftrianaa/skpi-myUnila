"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  FiUsers,
  FiGrid,
  FiShield,
  FiServer,
  FiActivity,
  FiKey,
  FiHome,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { manajemenAksesMenuConfig } from "./config/menuConfig";
import Link from "next/link";

const APP_KEY = "manajemen-akses";

export default function ManajemenAksesDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Stats cards
  const statsCards = [
    {
      title: "Total Pengguna",
      value: "1,234",
      icon: <FiUsers className="w-7 h-7 text-white" />,
      color: "from-blue-500 to-blue-600",
      change: "+12",
      subtitle: "pengguna aktif",
    },
    {
      title: "Total Aplikasi",
      value: "45",
      icon: <FiGrid className="w-7 h-7 text-white" />,
      color: "from-green-500 to-green-600",
      change: "Aktif",
      subtitle: "terdaftar",
    },
    {
      title: "Total Peran",
      value: "28",
      icon: <FiShield className="w-7 h-7 text-white" />,
      color: "from-purple-500 to-purple-600",
      change: "Aktif",
      subtitle: "roles",
    },
    {
      title: "Endpoint API",
      value: "156",
      icon: <FiServer className="w-7 h-7 text-white" />,
      color: "from-orange-500 to-orange-600",
      change: "Protected",
      subtitle: "endpoints",
    },
  ];

  // Quick links
  const quickLinks = [
    {
      title: "Daftar Pengguna",
      description: "Kelola daftar pengguna sistem",
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard/manajemen-akses/manajemen/pengguna",
    },
    {
      title: "Daftar Aplikasi",
      description: "Kelola aplikasi yang terdaftar",
      icon: <FiGrid className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      href: "/dashboard/manajemen-akses/manajemen/aplikasi",
    },
    {
      title: "Daftar Unit",
      description: "Kelola unit organisasi",
      icon: <FiHome className="w-6 h-6" />,
      color: "from-teal-500 to-teal-600",
      href: "/dashboard/manajemen-akses/manajemen/unit",
    },
    {
      title: "Peran",
      description: "Kelola peran dan permission",
      icon: <FiShield className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      href: "/dashboard/manajemen-akses/manajemen/peran",
    },
    {
      title: "Role Base Access",
      description: "Konfigurasi RBAC",
      icon: <FiKey className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
      href: "/dashboard/manajemen-akses/manajemen/rbac",
    },
    {
      title: "WS Endpoint",
      description: "Kelola web service endpoint",
      icon: <FiServer className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      href: "/dashboard/manajemen-akses/manajemen/ws-endpoint",
    },
  ];

  // Recent activities (dummy data)
  const recentActivities = [
    {
      action: "Login Success",
      user: "john.doe@unila.ac.id",
      time: "2 menit yang lalu",
      status: "success",
    },
    {
      action: "New User Created",
      user: "admin@unila.ac.id",
      time: "15 menit yang lalu",
      status: "success",
    },
    {
      action: "Role Updated",
      user: "superadmin@unila.ac.id",
      time: "1 jam yang lalu",
      status: "info",
    },
    {
      action: "Failed Login Attempt",
      user: "unknown@mail.com",
      time: "2 jam yang lalu",
      status: "warning",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="Manajemen Akses"
        appIcon={<MdSecurity className="w-6 h-6 text-white" />}
        appKey={APP_KEY}
        fallbackMenus={manajemenAksesMenuConfig}
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
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MdSecurity className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    Identity & Access Management System
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Selamat Datang, {user?.name || "Developer"}!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Kelola pengguna, peran, dan akses aplikasi secara terpusat
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MdSecurity className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${stat.color} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {stat.icon}
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
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
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
          {/* Left Column - Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiGrid className="w-5 h-5 text-purple-600" />
                    Quick Access
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickLinks.map((link, index) => (
                    <Link key={index} href={link.href}>
                      <Card
                        isPressable
                        className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <CardBody className="p-4">
                          <div className="flex flex-col gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-lg`}
                            >
                              {link.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                {link.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {link.description}
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
          </div>

          {/* Right Column - Recent Activities */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-purple-600" />
                    Recent Activities
                  </h3>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.user}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Auth Service</span>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">JWT Service</span>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">RBAC Service</span>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Logger Service</span>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
