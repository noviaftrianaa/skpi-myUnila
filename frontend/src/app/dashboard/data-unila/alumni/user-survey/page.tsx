"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import { Toaster } from "react-hot-toast";
import { FiUsers, FiCheckCircle, FiBriefcase, FiClock } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import EmptyState from "@/shared/components/data-unila/EmptyState";

const APP_KEY = "data-unila";

export default function UserSurveyPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="User Survey Alumni"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Survey Alumni</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Survei pengguna lulusan (employer/atasan) untuk mengukur kepuasan dan capaian lulusan di dunia kerja.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiUsers className="w-6 h-6 opacity-90" />
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Total Responden</div>
                <div className="text-2xl font-bold tabular-nums">—</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-6 h-6 opacity-90" />
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Kepuasan Rata-rata</div>
                <div className="text-2xl font-bold tabular-nums">—</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiBriefcase className="w-6 h-6 opacity-90" />
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Industri Berbeda</div>
                <div className="text-2xl font-bold tabular-nums">—</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiClock className="w-6 h-6 opacity-90" />
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Periode Aktif</div>
                <div className="text-2xl font-bold tabular-nums">—</div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          variant="folder"
          title="Modul User Survey belum tersedia"
          description="Sumber data user-survey (pengguna lulusan / employer survey) belum terhubung ke pdrd. Modul ini sedang dalam tahap perencanaan — akan terintegrasi dengan instrumen IKU 1 dan IKU 2 Kemendikbud."
        />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
