// src/components/common/SidebarAdmin.jsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Palette,
  Menu,
  X,
} from "lucide-react";

function MenuItem({ to, icon, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium overflow-hidden
        ${
          isActive
            ? "text-[#1E3A8A] shadow-sm"
            : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background:
                "linear-gradient(90deg, rgba(30, 58, 138, 0.1) 0%, rgba(14, 165, 233, 0.1) 50%, rgba(56, 189, 248, 0.05) 100%)",
            }
          : {}
      }
    >
      {({ isActive }) => (
        <>
          {/* LEFT BAR — selalu render, hanya tampil saat aktif */}
          <div
            className="absolute left-0 top-0 h-full w-[4px] rounded-r-full transition-opacity duration-200"
            style={{
              background:
                "linear-gradient(180deg, #1E3A8A 0%, #0EA5E9 50%, #38BDF8 100%)",
              opacity: isActive ? 1 : 0,
            }}
          />
          {icon}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SidebarAdmin() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md border border-gray-100 rounded-xl p-2.5 text-gray-600 hover:text-blue-700 transition-colors"
        aria-label="Buka Menu"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-[250px] h-screen
          bg-white border-r border-gray-100 shadow-sm
          flex flex-col justify-between overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* TOP */}
        <div>
          {/* LOGO */}
          <div className="px-6 py-7 flex items-center justify-between">
            <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
              SKPI
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* MENU */}
          <div className="px-3 space-y-2">
            <MenuItem
              to="/admin/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Beranda"
              onClose={() => setIsOpen(false)}
            />

            <MenuItem
              to="/admin/validasi"
              icon={<FileText size={20} />}
              label="Validasi SKPI"
              onClose={() => setIsOpen(false)}
            />

            <MenuItem
              to="/admin/data-karya"
              icon={<Palette size={20} />}
              label="Data Karya"
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}