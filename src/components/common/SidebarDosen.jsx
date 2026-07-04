// src/components/common/SidebarDosen.jsx

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
} from "lucide-react";

function MenuItem({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium overflow-hidden font-poppins
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

export default function SidebarDosen() {
  return (
    <aside className="w-[250px] h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm flex flex-col justify-between shrink-0 overflow-y-auto">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="px-6 py-7">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight font-poppins">
            SKPI
          </h1>
          <p className="text-[11px] font-semibold text-gray-400 font-poppins mt-1 tracking-wider uppercase">
            Peran: Dosen
          </p>
        </div>

        {/* MENU */}
        <div className="px-3 space-y-2">
          <MenuItem
            to="/dosen/dashboard"
            end
            icon={<LayoutDashboard size={20} />}
            label="Beranda"
          />
        </div>
      </div>

    </aside>
  );
}
