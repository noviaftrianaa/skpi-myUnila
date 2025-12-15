"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Badge,
  ScrollShadow,
} from "@heroui/react";
import {
  FiSettings,
  FiLogOut,
  FiHome,
  FiChevronDown,
  FiBell,
  FiMenu,
  FiUser,
  FiMail,
  FiBook,
  FiMapPin,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

interface DashboardNavbarProps {
  title?: string;
  onMenuClick?: () => void;
}

// Dummy notifications
const dummyNotifications = [
  {
    id: 1,
    title: "Pengumuman UTS",
    message: "UTS akan dilaksanakan pada tanggal 15-20 November 2024",
    time: "1 jam yang lalu",
    isRead: false,
    type: "alert" as const,
    icon: <FiAlertCircle className="w-4 h-4" />,
    color: "text-red-600 bg-red-100",
  },
  {
    id: 2,
    title: "Nilai Quiz Tersedia",
    message: "Nilai quiz Basis Data telah diupload oleh dosen",
    time: "3 jam yang lalu",
    isRead: false,
    type: "success" as const,
    icon: <FiCheckCircle className="w-4 h-4" />,
    color: "text-green-600 bg-green-100",
  },
  {
    id: 3,
    title: "Perubahan Jadwal",
    message: "Kuliah Pemrograman Web dipindah ke ruang IF-301",
    time: "5 jam yang lalu",
    isRead: true,
    type: "info" as const,
    icon: <FiInfo className="w-4 h-4" />,
    color: "text-blue-600 bg-blue-100",
  },
  {
    id: 4,
    title: "Reminder Tugas",
    message: "Deadline tugas Struktur Data H-2 hari lagi",
    time: "1 hari yang lalu",
    isRead: true,
    type: "warning" as const,
    icon: <FiClock className="w-4 h-4" />,
    color: "text-orange-600 bg-orange-100",
  },
];

export default function DashboardNavbar({
  title,
  onMenuClick,
}: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const { activeContext } = useUserContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [currentDate, setCurrentDate] = useState<string>("");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Format date only on client-side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }));
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase()
    );
  };

  // Get role and organization info based on active context
  const getRoleInfo = () => {
    // Priority: use activeContext if available (role yang dipilih user)
    if (activeContext) {
      return {
        role: activeContext.nm_peran,
        organization: activeContext.nm_organisasi,
      };
    }

    // Fallback to user data from auth context
    return {
      role: user?.role || "User",
      organization: user?.satuan_pendidikan || user?.fakultas || "Universitas Lampung",
    };
  };

  const roleInfo = getRoleInfo();
  const userInitials = getUserInitials(user?.name);

  return (
    <div className="relative h-[72px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Smooth gradient transition at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none"></div>

      {/* Left Section - Menu Button & Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 active:scale-95 rounded-xl transition-all relative z-50 touch-manipulation"
          aria-label="Open menu"
          type="button"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Date Only */}
        <div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {currentDate || "Loading..."}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Notifications"
            className="w-96 p-0"
            classNames={{
              base: "bg-white dark:bg-gray-800 p-0",
              list: "bg-white dark:bg-gray-800 p-0",
            }}
            itemClasses={{
              base: [
                "bg-white",
                "dark:bg-gray-800",
                "data-[hover=true]:bg-gray-50",
                "data-[hover=true]:dark:bg-gray-700",
                "p-0",
              ],
            }}
          >
            {/* Header */}
            <DropdownItem
              key="header"
              isReadOnly
              className="bg-white dark:bg-gray-800 opacity-100 cursor-default rounded-t-lg"
              textValue="Notifications Header"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifikasi
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount} notifikasi belum dibaca
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
            </DropdownItem>

            {/* Notifications List */}
            <DropdownItem
              key="notifications-list"
              isReadOnly
              className="bg-white dark:bg-gray-800 opacity-100 cursor-default p-0"
              textValue="Notifications List"
            >
              <ScrollShadow className="max-h-[400px] bg-white dark:bg-gray-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-gray-800">
                    <FiBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada notifikasi
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        !notif.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${notif.color} flex items-center justify-center flex-shrink-0`}
                        >
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={`text-sm font-medium ${
                                !notif.isRead
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {notif.time}
                            </p>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollShadow>
            </DropdownItem>

            {/* Footer */}
            {notifications.length > 0 && (
              <DropdownItem
                key="footer"
                isReadOnly
                className="bg-white dark:bg-gray-800 opacity-100 cursor-default rounded-b-lg"
                textValue="Notifications Footer"
              >
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-800">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>

        {/* User Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 sm:p-2 transition-colors max-w-[280px]">
              {/* Avatar with initials fallback */}
              {user?.avatar ? (
                <Avatar
                  src={user.avatar}
                  size="sm"
                  className="w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm ring-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0">
                  {userInitials}
                </div>
              )}

              {/* User Info - Show active role and organization */}
              <div className="hidden lg:flex flex-col items-start min-w-0 max-w-[160px] xl:max-w-[180px]">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full text-left">
                  {user?.name || "User"}
                </span>
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 w-full">
                  <FiShield className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate font-medium">{roleInfo.role}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 w-full">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{roleInfo.organization}</span>
                </div>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300 hidden lg:block flex-shrink-0" />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="User menu actions"
            className="w-72 p-1"
            classNames={{
              base: "bg-white dark:bg-gray-800",
              list: "bg-white dark:bg-gray-800",
            }}
            itemClasses={{
              base: [
                "rounded-lg",
                "bg-white",
                "dark:bg-gray-800",
                "data-[hover=true]:bg-gray-100",
                "data-[hover=true]:dark:bg-gray-700",
                "transition-colors",
              ],
            }}
          >
            {/* User Info Header in Dropdown */}
            <DropdownItem
              key="user-info"
              isReadOnly
              className="bg-white dark:bg-gray-800 opacity-100 cursor-default"
              textValue="User Info"
            >
              <div className="px-1 py-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {user?.email || "-"}
                </p>
                {/* Active Role Badge */}
                <div className="flex flex-col gap-1.5 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {roleInfo.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {roleInfo.organization}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownItem>

            {/* Divider */}
            <DropdownItem
              key="divider-1"
              isReadOnly
              className="h-px p-0 my-2 bg-white dark:bg-gray-800 opacity-100"
              textValue="Divider"
            >
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
            </DropdownItem>

            {/* Menu Items */}
            <DropdownItem
              key="profile"
              startContent={<FiUser className="w-4 h-4" />}
              textValue="Profil Saya"
              className="bg-white dark:bg-gray-800"
            >
              <Link href="/portal/profile" className="w-full">
                Profil Saya
              </Link>
            </DropdownItem>
            <DropdownItem
              key="portal"
              startContent={<FiHome className="w-4 h-4" />}
              textValue="Portal Aplikasi"
              className="bg-white dark:bg-gray-800"
            >
              <Link href="/portal" className="w-full">
                Portal Aplikasi
              </Link>
            </DropdownItem>
            <DropdownItem
              key="settings"
              startContent={<FiSettings className="w-4 h-4" />}
              textValue="Pengaturan"
              className="bg-white dark:bg-gray-800"
            >
              Pengaturan
            </DropdownItem>

            {/* Divider */}
            <DropdownItem
              key="divider-2"
              isReadOnly
              className="h-px p-0 my-2 bg-white dark:bg-gray-800 opacity-100"
              textValue="Divider"
            >
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
            </DropdownItem>

            <DropdownItem
              key="logout"
              className="text-danger bg-white dark:bg-gray-800"
              color="danger"
              startContent={<FiLogOut className="w-4 h-4" />}
              onClick={handleLogout}
              textValue="Logout"
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
