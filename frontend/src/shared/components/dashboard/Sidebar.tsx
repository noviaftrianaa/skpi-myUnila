"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import type { MenuItem } from "@/lib/types/dashboard.types";

interface SidebarProps {
  appName: string;
  appIcon?: React.ReactNode;
  menuConfig: MenuItem[]; // Menu config dari setiap app
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  appName,
  appIcon,
  menuConfig,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // Map user role dari database ke role types
  const getUserRole = (): string => {
    if (!user?.role) return "";

    const roleLower = user.role.toLowerCase();
    if (roleLower.includes("developer")) return "developer";
    if (roleLower.includes("admin")) return "admin";
    if (roleLower.includes("mahasiswa") || roleLower.includes("student"))
      return "mahasiswa";
    if (roleLower.includes("dosen") || roleLower.includes("lecturer"))
      return "dosen";

    return "";
  };

  const userRole = getUserRole();

  // Filter menu berdasarkan role
  const menuItems = menuConfig.filter((item) => {
    if (!item.roles) return true; // Jika tidak ada roles, tampilkan untuk semua
    return item.roles.includes(userRole);
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.title];
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleMenu(item.title)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mb-0.5
              ${
                level === 0
                  ? "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 ml-3"
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            {isOpen ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {item.children?.map((child) => renderMenuItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href || "#"} onClick={handleLinkClick}>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mb-0.5
            ${
              level === 0
                ? active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                  : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50"
                : active
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-3"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 ml-3"
            }`}
        >
          {item.icon}
          <span>{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar for Desktop - Always visible on lg+ */}
      <div className="hidden lg:flex h-screen w-64 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 flex-col sticky top-0 shadow-2xl">
        {/* Logo/App Name */}
        <div className="p-4 relative">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-10 rounded-b-3xl"></div>

          <Link href="/portal">
            <div className="relative flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-blue-100 dark:border-gray-700">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  {appIcon || <MdSchool className="w-7 h-7 text-white" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {appName}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Back to Portal */}
        <div className="p-3 mt-auto">
          <Link href="/portal">
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-lg transition-all duration-200 group">
              <FiHome className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              <span className="group-hover:text-blue-600 transition-colors">Kembali ke Portal</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Sidebar for Mobile - Slide in from left */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/App Name with Close Button */}
        <div className="p-4 relative">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-10 rounded-b-3xl"></div>

          <div className="relative flex items-center justify-between mb-3">
            <Link href="/portal" onClick={handleLinkClick}>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 shadow-lg border border-blue-100 dark:border-gray-700">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    {appIcon || <MdSchool className="w-6 h-6 text-white" />}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {appName}
                  </h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 rounded-xl transition-colors shadow-md"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Back to Portal */}
        <div className="p-3 mt-auto">
          <Link href="/portal" onClick={handleLinkClick}>
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-lg transition-all duration-200 group">
              <FiHome className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              <span className="group-hover:text-blue-600 transition-colors">Kembali ke Portal</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
