// src/components/common/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, Bell, ChevronDown, Check, UserCheck, LogOut, FileText } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function Navbar({ role = "admin" }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const themeRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabelMap = {
    admin: { label: "Admin SKPI", icon: "🛡️" },
    dosen: { label: "Dosen", icon: "👨‍🏫" },
    mahasiswa: { label: "Mahasiswa", icon: "🎓" },
  };

  const handleSwitchRole = (newRole) => {
    localStorage.setItem("bypass_role", newRole);
    setShowProfileMenu(false);
    if (newRole === "admin") navigate("/admin/dashboard");
    else if (newRole === "dosen") navigate("/dosen/dashboard");
    else navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between py-3 px-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-200">
      {/* LEFT: Date */}
      <div className="text-xs font-medium text-gray-500 dark:text-slate-400">
        Sabtu, 22 Agustus 2026
      </div>

      {/* RIGHT: Action Menu */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Pilih Tema"
          >
            {theme === "dark" ? <Moon size={18} /> : theme === "system" ? <Monitor size={18} /> : <Sun size={18} />}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { setTheme("light"); setShowThemeMenu(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                  theme === "light"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun size={15} />
                  <span>Light <span className="text-[10px] text-gray-400 font-normal">Tema terang</span></span>
                </div>
                {theme === "light" && <Check size={14} />}
              </button>

              <button
                onClick={() => { setTheme("dark"); setShowThemeMenu(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                  theme === "dark"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon size={15} />
                  <span>Dark <span className="text-[10px] text-gray-400 font-normal">Tema gelap</span></span>
                </div>
                {theme === "dark" && <Check size={14} />}
              </button>

              <button
                onClick={() => { setTheme("system"); setShowThemeMenu(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                  theme === "system"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Monitor size={15} />
                  <span>System <span className="text-[10px] text-gray-400 font-normal">Mengikuti sistem</span></span>
                </div>
                {theme === "system" && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifikasi"
          >
            <Bell size={18} />
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5 mb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">Notifikasi</span>
                <span className="text-[11px] text-gray-400">0 notifikasi belum dibaca</span>
              </div>
              <div className="py-6 text-center text-gray-400 dark:text-slate-500 text-xs">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                Tidak ada notifikasi
              </div>
              <button
                onClick={() => {
                  setShowNotifMenu(false);
                  navigate("/notifikasi");
                }}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-2 border-t border-gray-100 dark:border-slate-800"
              >
                Lihat semua pemberitahuan →
              </button>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
              NH
            </div>
            <div className="hidden sm:block leading-tight pr-1">
              <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                NOVIA FITRIANA HUDA
              </div>
              <div className="text-[10px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                <span className="text-blue-500 font-semibold">{roleLabelMap[role]?.label || "User"}</span>
                <span>• Program Studi S1 Teknik Inf...</span>
              </div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">NOVIA FITRIANA HUDA</p>
                <p className="text-[11px] text-gray-400">2215061024 • Teknik Informatika</p>
              </div>

              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ganti Peran (Demo):
              </div>

              <button
                onClick={() => handleSwitchRole("admin")}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                  role === "admin"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">🛡️ Admin SKPI</span>
                {role === "admin" && <Check size={14} />}
              </button>

              <button
                onClick={() => handleSwitchRole("dosen")}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                  role === "dosen"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">👨‍🏫 Dosen Pembimbing</span>
                {role === "dosen" && <Check size={14} />}
              </button>

              <button
                onClick={() => handleSwitchRole("mahasiswa")}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                  role === "mahasiswa"
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">🎓 Mahasiswa</span>
                {role === "mahasiswa" && <Check size={14} />}
              </button>

              <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut size={14} />
                Kembali ke Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
