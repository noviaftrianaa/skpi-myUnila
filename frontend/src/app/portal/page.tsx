"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Input,
  Button,
  Card,
  CardBody,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  FiSearch,
  FiStar,
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiUser,
  FiChevronRight,
  FiHome,
  FiGrid,
  FiInfo,
} from "react-icons/fi";
import { AiFillAppstore } from "react-icons/ai";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Import icons dari react-icons
import {
  HiDocumentText,
  HiPresentationChartLine,
  HiUserGroup,
  HiClipboardList,
  HiLibrary,
  HiBeaker,
} from "react-icons/hi";
import {
  MdSchool,
  MdAssignment,
  MdEventNote,
  MdGroup,
  MdCardMembership,
  MdCampaign,
} from "react-icons/md";
import {
  BsFileEarmarkText,
  BsTrophy,
  BsClipboardCheck,
  BsNewspaper,
  BsPeopleFill,
  BsLightbulb,
  BsGlobe,
} from "react-icons/bs";
import {
  RiFileList3Fill,
  RiTeamFill,
  RiGovernmentFill,
  RiDashboardFill,
} from "react-icons/ri";
import {
  FaUserGraduate,
  FaBriefcase,
  FaHandsHelping,
  FaChartLine,
  FaDatabase,
  FaPlug,
  FaHeadset,
  FaBlog,
} from "react-icons/fa";

interface Application {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isFavorite: boolean;
  href: string;
}

interface AppCategory {
  category: string;
  apps: Application[];
}

export default function DashboardPage() {
  // Protect this route - require authentication
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useRequireAuth();
  const { logout, switchRole } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const router = useRouter();

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Loading selama 1.5 detik

    return () => clearTimeout(timer);
  }, []);

  // Set initial selected role
  useEffect(() => {
    if (authUser?.role) {
      setSelectedRole(authUser.role);
    }
  }, [authUser]);

  // Handle role change
  const handleRoleChange = async (newRole: string) => {
    try {
      await switchRole(newRole);
      setSelectedRole(newRole);
      setShowRoleModal(false);

      // Show success notification (optional - you can add a toast library)
      console.log('✅ Role berhasil diganti ke:', newRole);
    } catch (error) {
      console.error('❌ Gagal mengganti role:', error);
      // Show error notification (optional)
    }
  };

  // Dummy notifications data
  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem",
      message: "Sistem myUnila akan dilakukan maintenance pada tanggal 15 Januari 2025",
      time: "2 jam yang lalu",
      isRead: false,
      type: "info",
    },
    {
      id: 2,
      title: "Pengumuman Beasiswa",
      message: "Pendaftaran beasiswa semester genap 2024/2025 telah dibuka",
      time: "5 jam yang lalu",
      isRead: false,
      type: "announcement",
    },
    {
      id: 3,
      title: "Deadline Tugas",
      message: "Tugas Algoritma dan Pemrograman akan berakhir dalam 2 hari",
      time: "1 hari yang lalu",
      isRead: true,
      type: "warning",
    },
    {
      id: 4,
      title: "Nilai Telah Diupload",
      message: "Nilai UTS Basis Data telah tersedia di SI Akademik",
      time: "2 hari yang lalu",
      isRead: true,
      type: "success",
    },
  ];

  // Function to get user initials (first and last name)
  const getInitials = (fullName: string) => {
    const nameParts = fullName.split(",")[0].trim().split(" ");
    if (nameParts.length >= 2) {
      // Ambil huruf pertama dari nama depan dan nama belakang
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    // Jika hanya satu nama, ambil 2 huruf pertama
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  const [applications, setApplications] = useState<AppCategory[]>([
    {
      category: "Akademik",
      apps: [
        {
          id: "myunila-presensi",
          name: "Presensi (SIRANDU)",
          description: "Sistem Informasi Absensi",
          icon: <BsClipboardCheck className="w-6 h-6" />,
          color: "bg-green-500",
          isFavorite: true,
          href: "#",
        },
        {
          id: "myunila-siakadu",
          name: "SIAKADU",
          description: "Sistem Informasi Akademik",
          icon: <HiClipboardList className="w-6 h-6" />,
          color: "bg-blue-600",
          isFavorite: true,
          href: "/dashboard/siakadu",
        },
        {
          id: "myunila-e-kkn",
          name: "E-KKN",
          description: "Sistem Kuliah Kerja Nyata",
          icon: <BsGlobe className="w-6 h-6" />,
          color: "bg-teal-600",
          isFavorite: false,
          href: "#",
        },
        {
          id: "myunila-berdampak",
          name: "Berdampak (MBKM)",
          description: "Merdeka Belajar Kampus Merdeka",
          icon: <HiPresentationChartLine className="w-6 h-6" />,
          color: "bg-teal-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "myunila-classroom",
          name: "V-CLASS",
          description: "Platform Pembelajaran Virtual",
          icon: <HiLibrary className="w-6 h-6" />,
          color: "bg-cyan-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "myunila-wali",
          name: "Wali",
          description: "Sistem Perwalian",
          icon: <BsPeopleFill className="w-6 h-6" />,
          color: "bg-blue-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "myunila-sikep",
          name: "SIKEP",
          description: "Sistem Kepegawaian",
          icon: <BsPeopleFill className="w-6 h-6" />,
          color: "bg-blue-500",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Riset dan Kerjasama",
      apps: [
        {
          id: "penelitian",
          name: "SI Penelitian",
          description: "Manajemen penelitian",
          icon: <BsFileEarmarkText className="w-6 h-6" />,
          color: "bg-sky-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "pengabdian",
          name: "SI Pengabdian",
          description: "Pengabdian masyarakat",
          icon: <HiUserGroup className="w-6 h-6" />,
          color: "bg-fuchsia-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "publikasi",
          name: "SI Publikasi",
          description: "Manajemen publikasi ilmiah",
          icon: <BsNewspaper className="w-6 h-6" />,
          color: "bg-indigo-600",
          isFavorite: true,
          href: "#",
        },
        {
          id: "kerjasama",
          name: "SIKERMA",
          description: "Sistem Kerjasama Institusi",
          icon: <RiGovernmentFill className="w-6 h-6" />,
          color: "bg-blue-700",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Kemahasiswaan",
      apps: [
        {
          id: "si-prestasi",
          name: "SI Prestasi",
          description: "Sistem Informasi Prestasi",
          icon: <BsTrophy className="w-6 h-6" />,
          color: "bg-yellow-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "beasiswa",
          name: "Beasiswa",
          description: "Sistem Informasi Beasiswa",
          icon: <MdCardMembership className="w-6 h-6" />,
          color: "bg-emerald-500",
          isFavorite: true,
          href: "#",
        },
        {
          id: "ormawa",
          name: "Ormawa",
          description: "Organisasi Kemahasiswaan",
          icon: <RiTeamFill className="w-6 h-6" />,
          color: "bg-violet-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "minat-bakat",
          name: "Minat Bakat",
          description: "Sistem Minat dan Bakat",
          icon: <BsLightbulb className="w-6 h-6" />,
          color: "bg-amber-500",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Alumni",
      apps: [
        {
          id: "tracer-study",
          name: "Tracer Study",
          description: "Pelacakan Alumni",
          icon: <FaUserGraduate className="w-6 h-6" />,
          color: "bg-orange-500",
          isFavorite: false,
          href: "#",
        },
        {
          id: "service-layanan",
          name: "Service Layanan",
          description: "Layanan untuk Alumni",
          icon: <FaHandsHelping className="w-6 h-6" />,
          color: "bg-teal-500",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Dashboard & Akreditasi",
      apps: [
        {
          id: "iku-dashboard",
          name: "IKU Dashboard",
          description: "Dashboard Indikator Kinerja Utama",
          icon: <RiDashboardFill className="w-6 h-6" />,
          color: "bg-blue-600",
          isFavorite: false,
          href: "#",
        },
        {
          id: "spmi",
          name: "SPMI",
          description: "Sistem Penjaminan Mutu Internal",
          icon: <FaChartLine className="w-6 h-6" />,
          color: "bg-green-600",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Data dan Pelaporan",
      apps: [
        {
          id: "feeder-integrator",
          name: "Feeder Integrator",
          description: "Integrasi Data PDDikti",
          icon: <FaDatabase className="w-6 h-6" />,
          color: "bg-cyan-600",
          isFavorite: false,
          href: "/dashboard/feeder-integrator",
        },
        {
          id: "sister-integrator",
          name: "SISTER Integrator",
          description: "Integrasi SISTER Kemenristekdikti",
          icon: <FaDatabase className="w-6 h-6" />,
          color: "bg-purple-600",
          isFavorite: false,
          href: "#",
        },
        {
          id: "api-gateway",
          name: "API Gateway",
          description: "Gateway Integrasi API",
          icon: <FaPlug className="w-6 h-6" />,
          color: "bg-slate-700",
          isFavorite: false,
          href: "#",
        },
      ],
    },
    {
      category: "Layanan",
      apps: [
        {
          id: "helpdesk-tik",
          name: "Helpdesk TIK",
          description: "Layanan Bantuan TIK",
          icon: <FaHeadset className="w-6 h-6" />,
          color: "bg-red-500",
          isFavorite: false,
          href: "https://helpdesktik.unila.ac.id",
        },
        {
          id: "blog-unila",
          name: "Blog Unila",
          description: "Portal Berita dan Artikel",
          icon: <FaBlog className="w-6 h-6" />,
          color: "bg-pink-500",
          isFavorite: false,
          href: "#",
        },
      ],
    },
  ]);

  // Use authenticated user data or fallback to dummy
  const user = authUser || {
    name: "Mizar Zulmi Ramadhan, S.Kom.",
    email: "mizar.zulmi@staff.unila.ac.id",
    avatar: "", // Empty string akan menampilkan inisial nama
    role: "Staff",
    username: "mizar",
  };

  // Dummy announcements
  const announcements = [
    {
      id: 1,
      title: "Beasiswa Asih",
      description: "Beasiswa Asih",
      category: "Kegiatan",
      date: "30 Desember 2024",
      isNew: true,
    },
    {
      id: 2,
      title: "Pengumuman Penghapusan Akun",
      description: "Dalam rangka implementasi kebijakan TIK, UPA TIK mengumumkan bahwa akun email...",
      category: "Lainnya",
      date: "28 Desember 2024",
      isNew: false,
    },
  ];

  const toggleFavorite = (categoryIndex: number, appIndex: number) => {
    setApplications((prev) => {
      const newApps = [...prev];
      newApps[categoryIndex].apps[appIndex].isFavorite =
        !newApps[categoryIndex].apps[appIndex].isFavorite;
      return newApps;
    });
  };

  // Handle app click
  const handleAppClick = (app: Application) => {
    if (app.href === "#") {
      // Show coming soon modal
      setSelectedApp(app);
      setShowComingSoonModal(true);
    } else {
      // Navigate to the app
      router.push(app.href);
    }
  };

  const filteredApplications = applications.map((category) => ({
    ...category,
    apps: category.apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = !showFavoritesOnly || app.isFavorite;
      return matchesSearch && matchesFavorite;
    }),
  })).filter((category) => category.apps.length > 0);

  const favoriteApps = applications.flatMap((cat) =>
    cat.apps.filter((app) => app.isFavorite)
  );

  // Show loading while checking authentication or loading data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <div className="hidden md:flex flex-1 mx-8">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
            <div className="md:hidden pb-3">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>

              {/* Apps Grid Skeleton */}
              <div className="space-y-8">
                {[1, 2, 3].map((category) => (
                  <div key={category}>
                    <Skeleton className="h-6 w-32 rounded-lg mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {[1, 2, 3, 4, 5, 6].map((app) => (
                        <Card key={app} className="bg-white border border-gray-100">
                          <CardBody className="p-3 sm:p-4">
                            {/* Mobile Layout Skeleton */}
                            <div className="flex flex-col items-center text-center sm:hidden gap-2">
                              <Skeleton className="h-12 w-12 rounded-xl" />
                              <Skeleton className="h-4 w-24 rounded-lg" />
                            </div>
                            {/* Desktop Layout Skeleton */}
                            <div className="hidden sm:flex items-start gap-3">
                              <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32 rounded-lg" />
                                <Skeleton className="h-3 w-full rounded-lg" />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="lg:w-80 w-full space-y-6 hidden lg:block">
              {/* Profile Card Skeleton */}
              <Card className="bg-white shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-8 w-28 rounded-lg mt-2" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Announcements Skeleton */}
              <Card className="bg-white shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-lg" />
                          <Skeleton className="h-5 w-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-3 w-3/4 rounded-lg" />
                        <Skeleton className="h-3 w-24 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Quick Access Skeleton */}
              <Card className="bg-white shadow-sm">
                <CardBody className="p-6">
                  <Skeleton className="h-5 w-28 rounded-lg mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                        <Skeleton className="h-4 flex-1 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>

        {/* Mobile Bottom Navigation Skeleton */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-4 h-16">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-3 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-myunila">myUnila Portal</h1>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-8">
              <Input
                placeholder="Cari aplikasi atau layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<FiSearch className="text-gray-400 ml-1" />}
                classNames={{
                  input: "bg-white focus:outline-none pl-3",
                  inputWrapper:
                    "bg-transparent hover:bg-gray-100 border-0 shadow-none focus-within:bg-white data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-white !outline-none px-3",
                }}
                size="md"
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Role Button */}
              {user.role && (
                <Button
                  onClick={() => setShowRoleModal(true)}
                  variant="flat"
                  size="sm"
                  className="hidden md:flex bg-blue-50 text-myunila hover:bg-blue-100 font-medium"
                >
                  <span className="text-xs">Peran: {selectedRole || user.role}</span>
                </Button>
              )}

              {/* Notification Dropdown */}
              <Dropdown placement="bottom-end" isOpen={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    className="relative hover:bg-gray-100 rounded-lg"
                    aria-label="Notifikasi"
                  >
                    <FiBell className="w-5 h-5 text-gray-600" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </DropdownTrigger>
              <DropdownMenu
                aria-label="Notifications"
                className="w-80 max-h-96 overflow-y-auto bg-white shadow-xl border border-gray-200 p-0"
                style={{ backgroundColor: 'white' }}
                itemClasses={{
                  base: "p-0",
                }}
                items={[
                  { type: 'header', id: 'header' },
                  ...notifications.map(n => ({ ...n, type: 'notification' })),
                  { type: 'footer', id: 'footer' }
                ]}
              >
                {(item: any) => {
                  if (item.type === 'header') {
                    return (
                      <DropdownItem
                        key="header"
                        className="h-auto py-3 px-4 opacity-100 border-b border-gray-200"
                        textValue="Notifikasi Header"
                        isReadOnly
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">Notifikasi</h3>
                          <Chip size="sm" color="primary" className="bg-myunila text-white">
                            {notifications.filter(n => !n.isRead).length} Baru
                          </Chip>
                        </div>
                      </DropdownItem>
                    );
                  }
                  if (item.type === 'footer') {
                    return (
                      <DropdownItem
                        key="footer"
                        className="h-auto py-3 px-4 opacity-100 bg-gray-50 hover:bg-gray-100 text-center"
                        textValue="Lihat Semua"
                      >
                        <p className="text-sm font-semibold text-myunila">
                          Lihat Semua Notifikasi
                        </p>
                      </DropdownItem>
                    );
                  }
                  return (
                    <DropdownItem
                      key={item.id}
                      className={`h-auto py-3 px-4 border-b border-gray-100 last:border-0 ${
                        !item.isRead ? "bg-blue-50" : "bg-white"
                      } hover:bg-gray-50`}
                      textValue={item.title}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            !item.isRead ? "bg-myunila" : "bg-gray-300"
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {item.message}
                          </p>
                          <p className="text-xs text-gray-400">{item.time}</p>
                        </div>
                      </div>
                    </DropdownItem>
                  );
                }}
              </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <Input
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<FiSearch className="text-gray-400" />}
              classNames={{
                input: "bg-white",
                inputWrapper: "bg-gray-100 border-0 shadow-none",
              }}
              size="sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Aplikasi dan Layanan
              </h2>
              <Button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                variant={showFavoritesOnly ? "solid" : "bordered"}
                color={showFavoritesOnly ? "primary" : "default"}
                startContent={<FiStar className="w-4 h-4" />}
                size="sm"
                className={
                  showFavoritesOnly
                    ? "bg-myunila text-white"
                    : "border-gray-300"
                }
              >
                <span className="hidden sm:inline">
                  {showFavoritesOnly ? "Favorit Saja" : "Tampilkan Favorit"}
                </span>
                <span className="sm:hidden">Favorit</span>
              </Button>
            </div>

            {/* Applications Grid */}
            {filteredApplications.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardBody className="py-12 text-center">
                  <p className="text-gray-500">
                    Tidak ada aplikasi yang sesuai dengan pencarian.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredApplications.map((category, catIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.1 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {category.apps.map((app, appIndex) => {
                        const originalCatIndex = applications.findIndex(
                          (cat) => cat.category === category.category
                        );
                        const originalAppIndex = applications[
                          originalCatIndex
                        ].apps.findIndex((a) => a.id === app.id);

                        return (
                          <motion.div
                            key={app.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full"
                          >
                            <Card
                              isPressable
                              onPress={() => handleAppClick(app)}
                              className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 h-full w-full"
                            >
                              <CardBody className="p-3 sm:p-4 flex flex-col h-full">
                                {/* Mobile Layout */}
                                <div className="flex flex-col items-center text-center sm:hidden gap-2">
                                  <div
                                    className={`${app.color} p-2.5 rounded-xl text-white flex-shrink-0`}
                                  >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                      {app.icon}
                                    </div>
                                  </div>
                                  <div className="w-full">
                                    <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                                      {app.name}
                                    </h4>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(
                                        originalCatIndex,
                                        originalAppIndex
                                      );
                                    }}
                                    className="absolute top-2 right-2"
                                  >
                                    <FiStar
                                      className={`w-4 h-4 transition-colors ${
                                        app.isFavorite
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Desktop/Tablet Layout */}
                                <div className="hidden sm:flex items-start gap-3">
                                  <div
                                    className={`${app.color} p-3 rounded-xl text-white flex-shrink-0`}
                                  >
                                    <div className="w-6 h-6">
                                      {app.icon}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                                      {app.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                      {app.description}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(
                                        originalCatIndex,
                                        originalAppIndex
                                      );
                                    }}
                                    className="flex-shrink-0"
                                  >
                                    <FiStar
                                      className={`w-5 h-5 transition-colors ${
                                        app.isFavorite
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300 hover:text-yellow-400"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </CardBody>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - RIGHT */}
          <aside
            className={`
            lg:w-80 w-full lg:block
            ${sidebarOpen ? "block" : "hidden"}
            space-y-6
          `}
          >
            {/* User Profile Card with Dropdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-gradient-to-br from-myunila to-blue-700 text-white shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={user.avatar}
                      size="lg"
                      className="w-16 h-16 border-2 border-white"
                      name={getInitials(user.name)}
                      showFallback
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-2">{user.name}</h3>
                      {/* Organization Info */}
                      <div className="space-y-1 mb-3">
                        {/* Show fakultas and prodi if available, otherwise show satuan_pendidikan or default */}
                        {user.fakultas || user.prodi ? (
                          <>
                            {user.fakultas && (
                              <p className="text-xs text-blue-100 leading-relaxed">{user.fakultas}</p>
                            )}
                            {user.prodi && (
                              <p className="text-xs text-blue-100 leading-relaxed">{user.prodi}</p>
                            )}
                          </>
                        ) : user.satuan_pendidikan ? (
                          <p className="text-xs text-blue-100 leading-relaxed">{user.satuan_pendidikan}</p>
                        ) : (
                          <p className="text-xs text-blue-100 leading-relaxed">Universitas Lampung</p>
                        )}
                      </div>
                      <Dropdown placement="bottom-start">
                        <DropdownTrigger>
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-white/20 text-white hover:bg-white/30 font-semibold text-xs"
                            endContent={<FiChevronRight className="w-4 h-4" />}
                          >
                            Kelola Akun
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="User Actions"
                          className="w-48 bg-white shadow-lg border border-gray-200 p-1"
                          style={{ backgroundColor: 'white' }}
                          itemClasses={{
                            base: [
                              "rounded-lg",
                              "data-[hover=true]:bg-gray-100",
                              "data-[hover=true]:text-gray-900",
                              "transition-colors",
                            ],
                          }}
                        >
                          <DropdownItem
                            key="profile"
                            startContent={<FiUser className="w-4 h-4" />}
                            as={Link}
                            href="/portal/profile"
                          >
                            Profil Saya
                          </DropdownItem>
                          <DropdownItem
                            key="settings"
                            startContent={<FiSettings className="w-4 h-4" />}
                            as={Link}
                            href="/portal/settings"
                          >
                            Pengaturan
                          </DropdownItem>
                          <DropdownItem
                            key="logout"
                            color="danger"
                            className="text-danger"
                            startContent={<FiLogOut className="w-4 h-4" />}
                            onPress={() => logout()}
                          >
                            Keluar
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MdCampaign className="w-5 h-5 text-myunila" />
                      Pengumuman
                    </h3>
                    <Link href="/portal/announcements">
                      <Button
                        size="sm"
                        variant="light"
                        className="text-myunila text-xs"
                      >
                        Lihat Semua
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Chip
                            size="sm"
                            className={`text-xs ${
                              announcement.isNew
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {announcement.category}
                          </Chip>
                          {announcement.isNew && (
                            <Chip
                              size="sm"
                              className="bg-myunila text-white text-xs"
                            >
                              Senin
                            </Chip>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">
                          {announcement.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {announcement.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Access - Favorites */}
            {favoriteApps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-sm">
                  <CardBody className="p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiStar className="w-5 h-5 text-yellow-500" />
                      Akses Cepat
                    </h3>
                    <div className="space-y-2">
                      {favoriteApps.slice(0, 5).map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleAppClick(app)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div
                            className={`${app.color} p-2 rounded-lg text-white`}
                          >
                            {app.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                            {app.name}
                          </span>
                          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-myunila transition-colors" />
                        </button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => {
              setActiveTab("home");
              setSidebarOpen(false);
            }}
            className={`h-16 flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === "home"
                ? "text-myunila bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiHome className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">Beranda</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("favorites");
              setShowFavoritesOnly(true);
              setSidebarOpen(false);
            }}
            className={`h-16 flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === "favorites"
                ? "text-myunila bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiStar className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">Favorit</span>
          </button>

          <Link href="/portal/announcements" className="flex-1">
            <button
              className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "announcements"
                  ? "text-myunila bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdCampaign className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Pengumuman</span>
            </button>
          </Link>

          <Link href="/portal/profile" className="flex-1">
            <button
              className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "profile"
                  ? "text-myunila bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiUser className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Profil</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Add padding bottom for mobile to prevent content being hidden behind bottom nav */}
      <div className="lg:hidden h-16"></div>

      {/* Role Switching Modal */}
      <Modal
        isOpen={showRoleModal}
        onOpenChange={setShowRoleModal}
        size="md"
        backdrop="opaque"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="bg-white max-h-[85vh]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 pb-4 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-800">Ganti Peran</h3>
                <p className="text-sm text-gray-500 font-normal">Pilih peran yang ingin Anda gunakan</p>
              </ModalHeader>
              <ModalBody className="py-6 px-6 overflow-y-auto">
                {user.roles && user.roles.length > 0 ? (
                  <div className="space-y-3">
                    {user.roles.map((role, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedRole(role)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedRole === role
                            ? "border-myunila bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                              selectedRole === role ? "bg-myunila text-white" : "bg-gray-200 text-gray-600"
                            }`}>
                              <FiUser className="w-6 h-6" />
                            </div>
                            <div>
                              <p className={`font-semibold text-base ${
                                selectedRole === role ? "text-myunila" : "text-gray-800"
                              }`}>
                                {role}
                              </p>
                            </div>
                          </div>
                          {selectedRole === role && (
                            <div className="w-6 h-6 rounded-full bg-myunila text-white flex items-center justify-center">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Tidak ada peran lain yang tersedia</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 pt-4 sticky bottom-0 bg-white z-10">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-600 hover:bg-gray-100 font-medium"
                  size="md"
                >
                  Batal
                </Button>
                <Button
                  className="bg-myunila text-white hover:bg-blue-700 font-medium"
                  onPress={() => {
                    // Apply the selected role
                    if (selectedRole) {
                      handleRoleChange(selectedRole);
                      onClose(); // Close modal after applying
                    }
                  }}
                  size="md"
                >
                  Terapkan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoonModal}
        onOpenChange={setShowComingSoonModal}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white",
          header: "bg-white border-b border-gray-200",
          body: "bg-white",
          footer: "bg-white border-t border-gray-200",
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <FiInfo className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Aplikasi Belum Tersedia
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  {selectedApp && (
                    <div className="mb-4">
                      <div
                        className={`${selectedApp.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <div className="text-white">{selectedApp.icon}</div>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {selectedApp.name}
                      </h4>
                    </div>
                  )}
                  <p className="text-gray-600">
                    Mohon maaf, aplikasi ini sedang dalam tahap integrasi sistem.
                    Silakan coba lagi nanti atau hubungi tim TIK untuk informasi
                    lebih lanjut.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={onClose}
                  className="bg-myunila text-white"
                >
                  Mengerti
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
