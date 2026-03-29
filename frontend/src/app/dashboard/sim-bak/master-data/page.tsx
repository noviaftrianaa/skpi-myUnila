"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiDatabase, FiList, FiGitBranch, FiFileText } from "react-icons/fi";
import JenisLayananTab from "./components/JenisLayananTab";
import PersyaratanTab from "./components/PersyaratanTab";
import TahapanTab from "./components/TahapanTab";
import TemplateTab from "./components/TemplateTab";

const tabs = [
  { key: "jenis", label: "Jenis Layanan", icon: <FiDatabase className="w-4 h-4" /> },
  { key: "persyaratan", label: "Persyaratan", icon: <FiList className="w-4 h-4" /> },
  { key: "tahapan", label: "Tahapan", icon: <FiGitBranch className="w-4 h-4" /> },
  { key: "template", label: "Template", icon: <FiFileText className="w-4 h-4" /> },
];

export default function MasterDataPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("jenis");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Master Data"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Master Data
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola data referensi layanan administrasi kemahasiswaan
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
            {activeTab === "jenis" && <JenisLayananTab />}
            {activeTab === "persyaratan" && <PersyaratanTab />}
            {activeTab === "tahapan" && <TahapanTab />}
            {activeTab === "template" && <TemplateTab />}
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
