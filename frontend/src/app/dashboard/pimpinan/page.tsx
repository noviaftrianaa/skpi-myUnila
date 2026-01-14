"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Progress, Chip, Button } from "@heroui/react";
import {
  FiUsers,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiActivity,
  FiTarget,
  FiBarChart,
  FiFileText,
} from "react-icons/fi";
import { MdBusiness } from "react-icons/md";
import { pimpinanMenuConfig } from "./config/menuConfig";

export default function PimpinanDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Detect pimpinan role
  const getPimpinanRole = () => {
    if (!user?.role) return "Pimpinan";
    const roleLower = user.role.toLowerCase();
    if (roleLower.includes("rektor")) return "Rektor";
    if (roleLower.includes("warek")) return "Wakil Rektor";
    if (roleLower.includes("dekan")) return "Dekan";
    if (roleLower.includes("wadek")) return "Wakil Dekan";
    if (roleLower.includes("ketua")) return "Ketua Lembaga";
    return "Pimpinan";
  };

  const role = getPimpinanRole();

  // Get current date info
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (month >= 8 && month <= 12) {
      return `Ganjil ${year}/${year + 1}`;
    } else {
      return `Genap ${year - 1}/${year}`;
    }
  };

  const getCurrentDay = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date().getDay()];
  };

  // Stats configuration for Pimpinan
  const statsConfig = [
    {
      title: "Total Mahasiswa Aktif",
      value: "25,847",
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      change: "+5.2%",
      trend: "up",
      subtitle: "dari semester lalu",
    },
    {
      title: "Total Dosen",
      value: "1,256",
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      change: "+3.1%",
      trend: "up",
      subtitle: "dosen aktif",
    },
    {
      title: "Program Studi",
      value: "145",
      icon: <FiBook className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      change: "2 A",
      trend: "stable",
      subtitle: "prodi terakreditasi Ungul",
    },
    {
      title: "Ranking Unila",
      value: "#15",
      icon: <FiAward className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      change: "+3",
      trend: "up",
      subtitle: "Nasional Webometrics 2024",
    },
  ];

  // Recent activities for Pimpinan
  const activitiesConfig = [
    {
      title: "Laporan Akreditasi Internasional",
      desc: "5 Program Studi telah mendapatkan akreditasi internasional dari AUN-QA",
      time: "2 jam yang lalu",
      icon: <FiAward className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Update Peringkat Universitas",
      desc: "Unila naik 3 peringkat di Webometrics edisi Juli 2024",
      time: "5 jam yang lalu",
      icon: <FiTrendingUp className="w-4 h-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Rapat Senat Universitas",
      desc: "Rapat evaluasi kinerja akademik semester genap 2023/2024",
      time: "1 hari yang lalu",
      icon: <FiCalendar className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Visitasi Akreditasi",
      desc: "3 Program Studi akan di visitasi oleh BAN-PT minggu depan",
      time: "2 hari yang lalu",
      icon: <FiCheckCircle className="w-4 h-4" />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  // Upcoming events
  const upcomingEvents = [
    {
      date: "15 Juli 2024",
      title: "Wisuda Periode III Tahun 2024",
      location: "Gelora Sabha Pratama",
      type: "Wisuda",
    },
    {
      date: "20 Juli 2024",
      title: "Rapat Senat Terbuka",
      location: "Ruang Sidang Utama",
      type: "Rapat",
    },
    {
      date: "25 Juli 2024",
      title: "Visitasi BAN-PT Prodi Teknik Sipil",
      location: "Fakultas Teknik",
      type: "Visitasi",
    },
  ];

  // Performance indicators
  const performanceIndicators = [
    {
      title: "IPK Rata-rata",
      value: "3.65",
      target: "3.75",
      progress: 85,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Kelulusan Tepat Waktu",
      value: "78%",
      target: "85%",
      progress: 78,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Dosen dengan Kualifikasi S3",
      value: "42%",
      target: "50%",
      progress: 42,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Penelitian Terpublikasi",
      value: "356",
      target: "400",
      progress: 89,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <DashboardLayout
      appName="Dashboard Pimpinan"
      appIcon={<MdBusiness className="w-6 h-6 text-white" />}
      menuConfig={pimpinanMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative p-6 overflow-hidden text-white shadow-xl rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 sm:p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute w-64 h-64 rounded-full -right-20 -top-20 bg-white/10 blur-3xl"></div>
          <div className="absolute w-64 h-64 rounded-full -left-20 -bottom-20 bg-white/10 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FiActivity className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">
                {getCurrentDay()},{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
              Selamat Datang, {role}!
            </h1>
            <p className="text-sm text-purple-100 sm:text-base">
              {user?.name || "User"} • Universitas Lampung
            </p>
            <p className="mt-2 text-xs text-purple-200 sm:text-sm">
              Semester Akademik {getCurrentSemester()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {statsConfig.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden transition-all duration-300 border-none shadow-lg hover:shadow-2xl hover:-translate-y-2 group"
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${stat.color}`}
                ></div>
                <div
                  className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color}`}
                ></div>
              </div>

              <CardBody className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                    {/* Decorative ring */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-20 blur-lg group-hover:opacity-30 transition-opacity`}
                    ></div>
                  </div>
                  {stat.change && (
                    <div className="flex flex-col items-end gap-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          stat.trend === "up"
                            ? "success"
                            : stat.trend === "down"
                            ? "danger"
                            : "default"
                        }
                        startContent={
                          stat.trend === "up" ? (
                            <FiTrendingUp className="w-3 h-3" />
                          ) : stat.trend === "down" ? (
                            <FiTrendingUp className="w-3 h-3 rotate-180" />
                          ) : null
                        }
                        classNames={{
                          base: "px-2 py-1",
                          content: "font-bold text-xs",
                        }}
                      >
                        {stat.change}
                      </Chip>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text">
                      {stat.value}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {stat.subtitle}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            {/* Performance Indicators */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <FiBarChart className="w-5 h-5 text-blue-600" />
                    Indikator Kinerja Utama
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                  >
                    Lihat Detail
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {performanceIndicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {indicator.title}
                        </h4>
                        <Chip size="sm" variant="flat" color="primary">
                          {indicator.value}
                        </Chip>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Target: {indicator.target}</span>
                          <span>{indicator.progress}%</span>
                        </div>
                        <Progress
                          value={indicator.progress}
                          className="max-w-full"
                          classNames={{
                            indicator: `bg-gradient-to-r ${indicator.color}`,
                            track: "bg-gray-200 dark:bg-gray-700",
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Activities */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <FiActivity className="w-5 h-5 text-blue-600" />
                    Aktivitas Terbaru
                  </h3>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight className="w-4 h-4" />}
                  >
                    Lihat Semua
                  </Button>
                </div>
                <div className="space-y-3">
                  {activitiesConfig.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 transition-colors border border-transparent rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                          {activity.desc}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <FiClock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    className="justify-start w-full bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    variant="flat"
                    startContent={<FiBarChart className="w-4 h-4" />}
                  >
                    Lihat Statistik
                  </Button>
                  <Button
                    className="justify-start w-full bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    variant="flat"
                    startContent={<FiTarget className="w-4 h-4" />}
                  >
                    Tracer Study
                  </Button>
                  <Button
                    className="justify-start w-full bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    variant="flat"
                    startContent={<FiFileText className="w-4 h-4" />}
                  >
                    Laporan Kinerja
                  </Button>
                  <Button
                    className="justify-start w-full bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    variant="flat"
                    startContent={<FiBook className="w-4 h-4" />}
                  >
                    Data Prodi
                  </Button>
                  <Button
                    className="justify-start w-full bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    variant="flat"
                    startContent={<FiAward className="w-4 h-4" />}
                  >
                    Peringkat Unila
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  <FiCalendar className="w-5 h-5 text-blue-600" />
                  Agenda Mendatang
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 border border-gray-100 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 dark:border-gray-700"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                          <div className="text-center">
                            <p className="text-[10px] font-medium">
                              {event.date.split(" ")[0]}
                            </p>
                            <p className="text-xs font-bold">
                              {event.date.split(" ")[1]}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                          📍 {event.location}
                        </p>
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          className="text-[10px]"
                        >
                          {event.type}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white rounded-lg shadow-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <FiAlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      Perhatian
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      3 Program Studi akan menjalani visitasi akreditasi minggu
                      depan
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="w-full"
                >
                  Lihat Detail
                </Button>
              </CardBody>
            </Card>

            {/* Semester Info */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Informasi Akademik
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Semester Aktif
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {getCurrentSemester()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tahun Akademik
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      2024/2025
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Role Anda
                    </span>
                    <Chip size="sm" color="primary" variant="flat">
                      {role}
                    </Chip>
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
