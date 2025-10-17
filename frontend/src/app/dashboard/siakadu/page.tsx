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
  FiTrendingDown,
  FiActivity,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { siakaduMenuConfig } from "./config/menuConfig";

export default function SiakaduDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Detect user role
  const getUserRole = () => {
    if (!user?.role) return "user";
    const roleLower = user.role.toLowerCase();
    if (roleLower.includes("admin")) return "admin";
    if (roleLower.includes("mahasiswa")) return "mahasiswa";
    if (roleLower.includes("dosen")) return "dosen";
    return "user";
  };

  const role = getUserRole();

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
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date().getDay()];
  };

  // Stats configuration based on role
  const statsConfig = {
    admin: [
      {
        title: "Total Mahasiswa Aktif",
        value: "2,547",
        icon: <FiUsers className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
        change: "+12%",
        trend: "up",
        subtitle: "dari semester lalu",
      },
      {
        title: "Total Dosen",
        value: "156",
        icon: <FiUsers className="w-6 h-6" />,
        color: "from-green-500 to-green-600",
        change: "+5%",
        trend: "up",
        subtitle: "dosen aktif mengajar",
      },
      {
        title: "Kelas Kuliah Aktif",
        value: "342",
        icon: <FiBook className="w-6 h-6" />,
        color: "from-purple-500 to-purple-600",
        change: "+8%",
        trend: "up",
        subtitle: "semester ini",
      },
      {
        title: "Mahasiswa Lulus",
        value: "487",
        icon: <FiAward className="w-6 h-6" />,
        color: "from-orange-500 to-orange-600",
        change: "+15%",
        trend: "up",
        subtitle: "tahun ini",
      },
    ],
    mahasiswa: [
      {
        title: "Total SKS Diambil",
        value: "20",
        subtitle: "SKS",
        icon: <FiBook className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
        info: "dari 24 SKS maksimal",
      },
      {
        title: "Matakuliah Semester Ini",
        value: "8",
        subtitle: "Matakuliah",
        icon: <FiBook className="w-6 h-6" />,
        color: "from-green-500 to-green-600",
        info: "semester berjalan",
      },
      {
        title: "IPK Terakhir",
        value: "3.75",
        subtitle: "IPK",
        icon: <FiAward className="w-6 h-6" />,
        color: "from-purple-500 to-purple-600",
        info: "dengan predikat Cumlaude",
      },
      {
        title: "Semester",
        value: "5",
        subtitle: "Semester",
        icon: <FiCalendar className="w-6 h-6" />,
        color: "from-orange-500 to-orange-600",
        info: getCurrentSemester(),
      },
    ],
    dosen: [
      {
        title: "Total Kelas",
        value: "5",
        subtitle: "Kelas",
        icon: <FiBook className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
        info: "semester ini",
      },
      {
        title: "Total Mahasiswa",
        value: "187",
        subtitle: "Mahasiswa",
        icon: <FiUsers className="w-6 h-6" />,
        color: "from-green-500 to-green-600",
        info: "semua kelas",
      },
      {
        title: "Jadwal Minggu Ini",
        value: "12",
        subtitle: "Pertemuan",
        icon: <FiCalendar className="w-6 h-6" />,
        color: "from-purple-500 to-purple-600",
        info: "5 hari mengajar",
      },
      {
        title: "Nilai Tersubmit",
        value: "3/5",
        subtitle: "Kelas",
        icon: <FiAward className="w-6 h-6" />,
        color: "from-orange-500 to-orange-600",
        info: "2 kelas pending",
      },
    ],
  };

  // Recent activities based on role
  const activitiesConfig = {
    admin: [
      {
        title: "20 Mahasiswa baru mendaftar",
        desc: "Pendaftaran mahasiswa baru semester ganjil 2024/2025",
        time: "2 jam yang lalu",
        icon: <FiUsers className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "5 Dosen mengupdate nilai",
        desc: "Nilai UTS telah diinput untuk kelas Algoritma dan Pemrograman",
        time: "4 jam yang lalu",
        icon: <FiCheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Jadwal kuliah diperbarui",
        desc: "Perubahan jadwal untuk 3 kelas karena cuti dosen",
        time: "6 jam yang lalu",
        icon: <FiCalendar className="w-4 h-4" />,
        color: "bg-orange-100 text-orange-600",
      },
      {
        title: "Backup database berhasil",
        desc: "Backup otomatis database akademik telah selesai",
        time: "8 jam yang lalu",
        icon: <FiCheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-600",
      },
    ],
    mahasiswa: [
      {
        title: "Pengumuman UTS",
        desc: "UTS akan dilaksanakan pada tanggal 15-20 November 2024",
        time: "1 jam yang lalu",
        icon: <FiAlertCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-600",
      },
      {
        title: "Nilai Quiz tersedia",
        desc: "Nilai quiz Basis Data telah diupload oleh dosen",
        time: "3 jam yang lalu",
        icon: <FiCheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Perubahan jadwal kuliah",
        desc: "Kuliah Pemrograman Web dipindah ke ruang IF-301",
        time: "5 jam yang lalu",
        icon: <FiCalendar className="w-4 h-4" />,
        color: "bg-orange-100 text-orange-600",
      },
      {
        title: "Pengingat tugas",
        desc: "Deadline tugas Struktur Data H-2 hari lagi",
        time: "1 hari yang lalu",
        icon: <FiClock className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-600",
      },
    ],
    dosen: [
      {
        title: "Reminder: Input Nilai",
        desc: "2 kelas masih menunggu input nilai UTS",
        time: "1 jam yang lalu",
        icon: <FiAlertCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-600",
      },
      {
        title: "Mahasiswa mengajukan bimbingan",
        desc: "5 mahasiswa mengajukan jadwal bimbingan TA",
        time: "2 jam yang lalu",
        icon: <FiUsers className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Perubahan ruang kuliah",
        desc: "Kuliah hari Kamis dipindah ke ruang IF-402",
        time: "4 jam yang lalu",
        icon: <FiCalendar className="w-4 h-4" />,
        color: "bg-orange-100 text-orange-600",
      },
      {
        title: "Absensi mahasiswa",
        desc: "15 mahasiswa belum absen pada pertemuan terakhir",
        time: "1 hari yang lalu",
        icon: <FiCheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-600",
      },
    ],
  };

  // Schedule dummy data based on role
  const scheduleConfig = {
    mahasiswa: [
      {
        time: "08:00 - 09:40",
        course: "Algoritma dan Pemrograman",
        room: "IF-201",
        lecturer: "Dr. Ahmad Fauzi, M.Kom",
        type: "Kuliah",
      },
      {
        time: "10:00 - 11:40",
        course: "Basis Data",
        room: "IF-203",
        lecturer: "Dr. Siti Rahmah, M.T",
        type: "Praktikum",
      },
      {
        time: "13:00 - 14:40",
        course: "Pemrograman Web",
        room: "LAB-1",
        lecturer: "Ir. Budi Santoso, M.Kom",
        type: "Kuliah",
      },
    ],
    dosen: [
      {
        time: "08:00 - 09:40",
        course: "Algoritma dan Pemrograman - Kelas A",
        room: "IF-201",
        students: "45 mahasiswa",
        type: "Kuliah",
      },
      {
        time: "10:00 - 11:40",
        course: "Struktur Data - Kelas B",
        room: "IF-202",
        students: "38 mahasiswa",
        type: "Kuliah",
      },
      {
        time: "13:00 - 15:30",
        course: "Bimbingan Tugas Akhir",
        room: "Ruang Dosen",
        students: "5 mahasiswa",
        type: "Bimbingan",
      },
    ],
  };

  const stats = statsConfig[role as keyof typeof statsConfig] || statsConfig.mahasiswa;
  const activities = activitiesConfig[role as keyof typeof activitiesConfig] || activitiesConfig.mahasiswa;
  const todaySchedule = role === "admin" ? [] : scheduleConfig[role as keyof typeof scheduleConfig] || [];

  return (
    <DashboardLayout
      appName="Siakadu"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={siakaduMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FiActivity className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">
                {getCurrentDay()}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Selamat Datang, {user?.name || "User"}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {role === "admin"
                ? "Kelola data akademik dengan mudah dan efisien"
                : role === "mahasiswa"
                ? `NPM: ${user?.id_pd_pengguna || "-"} • Semester ${getCurrentSemester()}`
                : `NIP: ${user?.id_sdm_pengguna || "-"} • ${getCurrentSemester()}`}
            </p>

            {role === "mahasiswa" && (
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="text-xs text-blue-100 mb-1">Progress SKS</p>
                  <Progress
                    value={83}
                    className="max-w-xs"
                    classNames={{
                      indicator: "bg-white",
                      track: "bg-white/20",
                    }}
                    size="sm"
                  />
                  <p className="text-xs text-blue-100 mt-1">100 SKS dari 120 SKS</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
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
                  {stat.change && (
                    <div className="flex flex-col items-end gap-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={stat.trend === "up" ? "success" : "danger"}
                        startContent={
                          stat.trend === "up" ? (
                            <FiTrendingUp className="w-3 h-3" />
                          ) : (
                            <FiTrendingDown className="w-3 h-3" />
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
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </h3>
                    {(stat as any).subtitle && (
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {(stat as any).subtitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {(stat as any).info || (stat as any).subtitle || ""}
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
            {/* Schedule for Mahasiswa & Dosen */}
            {role !== "admin" && todaySchedule.length > 0 && (
              <Card className="border-none shadow-md">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                      Jadwal Hari Ini - {getCurrentDay()}
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
                    {todaySchedule.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <div className="text-center">
                              <p className="text-xs font-medium">
                                {schedule.time.split(" - ")[0]}
                              </p>
                              <p className="text-[10px] opacity-80">
                                {schedule.time.split(" - ")[1]}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {schedule.course}
                            </h4>
                            <Chip size="sm" variant="flat" color="primary" className="flex-shrink-0">
                              {schedule.type}
                            </Chip>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            📍 {schedule.room}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {(schedule as any).lecturer || (schedule as any).students}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Activities */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-blue-600" />
                    {role === "admin" ? "Aktivitas Terbaru" : "Pengumuman & Notifikasi"}
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
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {activity.desc}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
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
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {role === "admin" ? (
                    <>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiUsers className="w-4 h-4" />}
                      >
                        Tambah Mahasiswa Baru
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiBook className="w-4 h-4" />}
                      >
                        Kelola Kelas Kuliah
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiCalendar className="w-4 h-4" />}
                      >
                        Atur Jadwal Kuliah
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiAward className="w-4 h-4" />}
                      >
                        Lihat Laporan Nilai
                      </Button>
                    </>
                  ) : role === "mahasiswa" ? (
                    <>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiCalendar className="w-4 h-4" />}
                      >
                        Lihat Jadwal Kuliah
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiBook className="w-4 h-4" />}
                      >
                        Isi KRS
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiAward className="w-4 h-4" />}
                      >
                        Lihat Nilai & Transkrip
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiCheckCircle className="w-4 h-4" />}
                      >
                        Status Kuliah
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiCalendar className="w-4 h-4" />}
                      >
                        Lihat Jadwal Mengajar
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiAward className="w-4 h-4" />}
                      >
                        Input Nilai
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiUsers className="w-4 h-4" />}
                      >
                        Daftar Mahasiswa
                      </Button>
                      <Button
                        className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
                        variant="flat"
                        startContent={<FiCheckCircle className="w-4 h-4" />}
                      >
                        Absensi Mahasiswa
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                    <FiAlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Pengingat Penting
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {role === "admin"
                        ? "5 kelas belum memiliki jadwal untuk minggu depan"
                        : role === "mahasiswa"
                        ? "Batas akhir pembayaran UKT: 25 November 2024"
                        : "Deadline input nilai UTS: 20 November 2024"}
                    </p>
                  </div>
                </div>
                <Button size="sm" color="warning" variant="flat" className="w-full">
                  Lihat Detail
                </Button>
              </CardBody>
            </Card>

            {/* Semester Info */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Informasi Semester
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Semester Aktif</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {getCurrentSemester()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tahun Akademik</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      2024/2025
                    </span>
                  </div>
                  {role === "mahasiswa" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Status Mahasiswa</span>
                        <Chip size="sm" color="success" variant="flat">
                          Aktif
                        </Chip>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Pembimbing Akademik</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Dr. Ahmad, M.Kom
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
