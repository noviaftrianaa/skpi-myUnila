"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiHome, FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import type { MenuItem } from "@/lib/types/dashboardTypes";

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
                  ? "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/30 hover:text-gray-800 dark:hover:text-slate-200 ml-3"
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
                  ? "bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-500"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                : active
                ? "bg-blue-50/50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 ml-3 border-l-2 border-blue-600 dark:border-blue-500"
                : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/30 hover:text-gray-800 dark:hover:text-slate-200 ml-3"
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
      <div className="hidden lg:flex h-screen w-64 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700/50 flex-col sticky top-0 shadow-xl dark:shadow-2xl">
        {/* Logo/App Name */}
        <div className="p-4 pb-6 border-b border-gray-200 dark:border-slate-700/50">
          <Link href="/portal">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:bg-white flex items-center justify-center shadow-lg">
                <Image
                  src="/assets/images/logo-unila.png"
                  alt="Logo Unila"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {appName}
                </h1>
                <p className="text-xs text-gray-600 dark:text-slate-400 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Back to Portal */}
        <div className="p-3 mt-auto border-t border-gray-200 dark:border-slate-700/50">
          <Link href="/portal">
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200 group">
              <FiHome className="w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <span className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Kembali ke Portal</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Sidebar for Mobile - Slide in from left */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700/50 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/App Name with Close Button */}
        <div className="p-4 pb-6 border-b border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link href="/portal" onClick={handleLinkClick}>
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:bg-white flex items-center justify-center shadow-lg">
                  <Image
                    src="/assets/images/logo-unila.png"
                    alt="Logo Unila"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {appName}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-slate-400 capitalize">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
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
        <div className="p-3 mt-auto border-t border-gray-200 dark:border-slate-700/50">
          <Link href="/portal" onClick={handleLinkClick}>
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200 group">
              <FiHome className="w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <span className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Kembali ke Portal</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
