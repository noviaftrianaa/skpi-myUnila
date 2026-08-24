// src/pages/mahasiswa/Notifikasi.jsx
import React, { useState } from "react";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
} from "lucide-react";

const initialNotifikasi = [
  {
    id: 1,
    type: "validated",
    title: "Kegiatan Divalidasi",
    message: "Pengajuan 'Pelatihan UI/UX Design' telah divalidasi dan poin SKPI bertambah 15.",
    time: "2 jam lalu",
    unread: true,
  },
  {
    id: 2,
    type: "info",
    title: "Pembaruan Sistem",
    message: "Sistem Informasi SKPI kini hadir dengan tampilan baru yang lebih rapi.",
    time: "5 jam lalu",
    unread: true,
  },
  {
    id: 3,
    type: "warning",
    title: "Pengingat Kelengkapan Dokumen",
    message: "Segera unggah sertifikat \"National Hackathon 2025\" untuk melengkapi data SKPI-mu.",
    time: "1 hari lalu",
    unread: false,
  },
  {
    id: 4,
    type: "alert",
    title: "Data Kegiatan Perlu Diperbaiki",
    message: "Dokumen untuk \"International Conference Paper\" belum lengkap. Silakan lakukan pengunggahan ulang.",
    time: "2 hari lalu",
    unread: false,
  },
  {
    id: 5,
    type: "validated",
    title: "Poin Telah Ditambahkan",
    message: "Verifikasi berhasil! \"Leadership Training Seminar\" menambahkan 10 poin SKPI ke akunmu.",
    time: "3 hari lalu",
    unread: false,
  },
  {
    id: 6,
    type: "info",
    title: "Pencapaian Baru Berhasil Diraih",
    message: "Kamu berhasil mengumpulkan 60+ poin SKPI. Tetap semangat mencapai target berikutnya!",
    time: "4 hari lalu",
    unread: false,
  },
  {
    id: 7,
    type: "warning",
    title: "Target SKPI Hampir Tercapai",
    message: "Kamu membutuhkan beberapa poin lagi untuk mencapai target 100 poin.",
    time: "5 hari lalu",
    unread: false,
  },
];

export default function Notifikasi() {
  const [notifications, setNotifications] = useState(initialNotifikasi);
  const [activeTab, setActiveTab] = useState("semua"); // "semua" | "unread"

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "unread") return n.unread;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const renderIcon = (type) => {
    switch (type) {
      case "validated":
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
        );
      case "warning":
        return (
          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
        );
      case "alert":
        return (
          <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info size={18} />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 max-w-5xl">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Pemberitahuan
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Pantau status validasi & pembaruan SKPI-mu.
              </p>
            </div>

            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Check size={14} />
              <span>Tandai Semua Dibaca</span>
            </button>
          </div>

          {/* UNDERLINE TAB BUTTONS (EXACT MATCH PDF PAGE 13) */}
          <div className="flex items-center gap-6 border-b border-gray-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("semua")}
              className={`pb-3 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === "semua"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              Semua
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`pb-3 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px inline-flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Belum Dibaca</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* NOTIFICATION ITEMS CONTAINER (SINGLE DIVIDED CONTAINER - EXACT MATCH PDF PAGE 13) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 flex items-start gap-4 transition-colors ${
                    item.unread
                      ? "bg-blue-50/30 dark:bg-blue-950/20"
                      : "hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {renderIcon(item.type)}

                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-slate-100 inline-flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block" />
                      )}
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      {item.message}
                    </p>

                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-gray-400 dark:text-slate-500 space-y-3">
                <Bell size={48} className="mx-auto opacity-20" />
                <p className="text-xs font-semibold">Tidak ada pemberitahuan</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}