// src/components/common/SidebarMahasiswa.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Folder,
  Bell,
  Menu,
  X,
} from "lucide-react";

function MenuItem({ to, icon, label, end = false, onClose }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium overflow-hidden font-poppins
        ${
          isActive
            ? "text-blue-700 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 shadow-xs"
            : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-blue-700 via-blue-500 to-sky-400 rounded-r-full transition-opacity duration-200"
            style={{ opacity: isActive ? 1 : 0 }}
          />
          {icon}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SidebarMahasiswa() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-900 shadow-md border border-gray-100 dark:border-slate-800 rounded-xl p-2.5 text-gray-600 dark:text-slate-300 hover:text-blue-700 transition-colors"
        aria-label="Buka Menu"
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-[230px] h-screen shrink-0
          bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800/80 shadow-xs
          flex flex-col justify-between overflow-y-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* LOGO BRAND */}
            <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center p-1 shadow-md shadow-blue-500/20 shrink-0 overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}Logo-Website-Unila.png`}
                    alt="Universitas Lampung"
                    className="w-full h-full object-contain drop-shadow-xs"
                  />
                </div>
                <div className="leading-tight">
                  <div
                    className="text-[19px] font-black tracking-tight font-poppins bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 bg-clip-text text-transparent"
                  >
                    myUnila
                  </div>
                  <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-wider font-poppins">
                    SKPI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Tutup Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* NAV MENU */}
            <div className="px-3 py-4 space-y-1.5">
              <MenuItem
                to="/dashboard"
                end
                icon={<Home size={18} />}
                label="Dashboard"
                onClose={() => setIsOpen(false)}
              />

              <MenuItem
                to="/pengajuan"
                icon={<FileText size={18} />}
                label="Data SKPI"
                onClose={() => setIsOpen(false)}
              />

              <MenuItem
                to="/data-karya"
                icon={<Folder size={18} />}
                label="Data Karya"
                onClose={() => setIsOpen(false)}
              />

              <MenuItem
                to="/notifikasi"
                icon={<Bell size={18} />}
                label="Pemberitahuan"
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>

          {/* BOTTOM - Kembali ke Portal */}
          <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-all duration-200"
            >
              <Home size={17} />
              <span>Kembali ke Portal</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}