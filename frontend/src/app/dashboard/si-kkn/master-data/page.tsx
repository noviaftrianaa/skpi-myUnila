"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiCalendar, FiMapPin, FiMap, FiFileText, FiStar, FiCheckSquare } from "react-icons/fi";
import PeriodeTab from "./components/PeriodeTab";
import LokasiTab from "./components/LokasiTab";
import WilayahTab from "./components/WilayahTab";
import JenisDokumenTab from "./components/JenisDokumenTab";
import KomponenPenilaianTab from "./components/KomponenPenilaianTab";
import KriteriaTab from "./components/KriteriaTab";

const tabs = [
  { key: "periode", label: "Periode", icon: <FiCalendar className="w-4 h-4" /> },
  { key: "lokasi", label: "Lokasi", icon: <FiMapPin className="w-4 h-4" /> },
  { key: "wilayah", label: "Wilayah", icon: <FiMap className="w-4 h-4" /> },
  { key: "jenis_dokumen", label: "Jenis Dokumen", icon: <FiFileText className="w-4 h-4" /> },
  { key: "komponen", label: "Komponen Penilaian", icon: <FiStar className="w-4 h-4" /> },
  { key: "kriteria", label: "Kriteria", icon: <FiCheckSquare className="w-4 h-4" /> },
];

export default function MasterDataPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("periode");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Master Data"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Master Data
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola data referensi Kuliah Kerja Nyata
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            {activeTab === "periode" && <PeriodeTab />}
            {activeTab === "lokasi" && <LokasiTab />}
            {activeTab === "wilayah" && <WilayahTab />}
            {activeTab === "jenis_dokumen" && <JenisDokumenTab />}
            {activeTab === "komponen" && <KomponenPenilaianTab />}
            {activeTab === "kriteria" && <KriteriaTab />}
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
