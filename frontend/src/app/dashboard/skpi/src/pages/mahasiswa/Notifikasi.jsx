// src/pages/mahasiswa/Notifikasi.jsx
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import Sidebar from "../../components/common/SidebarMahasiswa";

const ALL_NOTIFS = [
  {
    id: 1,
    title: "Kegiatan Divalidasi",
    message: "Pengajuan 'Pelatihan UI/UX Design' telah divalidasi dan poin SKPI bertambah 15.",
    time: "2 jam lalu",
    read: false,
    icon: "✓",
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
  },
  {
    id: 2,
    title: "Pembaruan Sistem",
    message: "Sistem Informasi SKPI kini hadir dengan tampilan!",
    time: "5 jam lalu",
    read: false,
    icon: "ℹ",
    iconBg: "bg-[#EEF4FF]",
    iconColor: "text-[#1D4ED8]",
  },
  {
    id: 3,
    title: "Pengingat Kelengkapan Dokumen",
    message: "Segera unggah sertifikat \"National Hackathon 2025\" untuk melengkapi data SKPI-mu.",
    time: "1 hari lalu",
    read: true,
    icon: "⏰",
    iconBg: "bg-[#FEF9C3]",
    iconColor: "text-[#CA8A04]",
  },
  {
    id: 4,
    title: "Data Kegiatan Perlu Diperbaiki",
    message: "Dokumen untuk \"International Conference Paper\" belum lengkap. Silakan lakukan pengunggahan ulang.",
    time: "2 hari lalu",
    read: true,
    icon: "✕",
    iconBg: "bg-[#FEE2E2]",
    iconColor: "text-[#DC2626]",
  },
  {
    id: 5,
    title: "Poin Telah Ditambahkan",
    message: "Verifikasi berhasil! \"Leadership Training Seminar\" telah menambahkan 10 poin SKPI ke akunmu.",
    time: "3 hari lalu",
    read: true,
    icon: "✓",
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
  },
  {
    id: 6,
    title: "Pencapaian Baru Berhasil Diraih",
    message: "Kamu berhasil mengumpulkan 70 poin SKPI! Tetap semangat mencapai target berikutnya.",
    time: "4 hari lalu",
    read: true,
    icon: "ℹ",
    iconBg: "bg-[#EEF4FF]",
    iconColor: "text-[#1D4ED8]",
  },
  {
    id: 7,
    title: "Target SKPI Hampir Tercapai",
    message: "Kamu hanya membutuhkan 28 poin lagi untuk mencapai target 100 poin",
    time: "5 hari lalu",
    read: true,
    icon: "⏰",
    iconBg: "bg-[#FEF9C3]",
    iconColor: "text-[#CA8A04]",
  },
];

export default function Notifikasi() {
  const [tab, setTab] = useState("semua");
  const [notifs, setNotifs] = useState(ALL_NOTIFS);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const displayed =
    tab === "semua" ? notifs : notifs.filter((n) => !n.read);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#0F172A]">Pemberitahuan</h1>
            <p className="text-[14px] text-[#94A3B8] mt-1">Pantau status validasi datamu</p>
          </div>
          <button
  onClick={markAllRead}
  className="flex items-center gap-2 border border-[#E2E8F0] text-[#0B5EA8] px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
>
  <CheckCheck size={15} color="#0B5EA8" />
  Tandai Telah Dibaca
</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#E5E7EB] px-2 pt-2">
            <button
              onClick={() => setTab("semua")}
              className={`px-5 py-2.5 text-[14px] font-medium rounded-t-lg transition-colors ${
                tab === "semua"
                  ? "text-[#1D4ED8] border-b-2 border-[#1D4ED8] bg-[#EEF4FF]"
                  : "text-[#64748B] hover:text-[#374151]"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTab("belum")}
              className={`px-5 py-2.5 text-[14px] font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                tab === "belum"
                  ? "text-[#1D4ED8] border-b-2 border-[#1D4ED8] bg-[#EEF4FF]"
                  : "text-[#64748B] hover:text-[#374151]"
              }`}
            >
              Belum Dibaca
              {unreadCount > 0 && (
                <span className="bg-[#1D4ED8] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notif List */}
          <div className="divide-y divide-[#F1F5F9]">
            {displayed.length === 0 ? (
              <div className="py-16 text-center text-[#94A3B8] text-[14px]">
                Tidak ada pemberitahuan
              </div>
            ) : (
              displayed.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                    !n.read ? "bg-[#FAFBFF]" : "bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[16px] font-bold ${n.iconBg} ${n.iconColor}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-[#0F172A]">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-[#1D4ED8] rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-[13px] text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[12px] text-[#94A3B8] mt-1">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}