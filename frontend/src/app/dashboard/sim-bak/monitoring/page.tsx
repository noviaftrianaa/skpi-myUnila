"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiPauseCircle, FiAward, FiDownload, FiBarChart2, FiAlertCircle } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getMahasiswaAktif, getLulusan } from "@/lib/services/sim-bak/simBakService";
import toast, { Toaster } from "react-hot-toast";

const tabs = [
  { key: "aktif", label: "Mahasiswa Aktif", icon: <FiUsers className="w-4 h-4" /> },
  { key: "lulusan", label: "Lulusan", icon: <FiAward className="w-4 h-4" /> },
];

export default function MonitoringPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("aktif");
  const [aktifData, setAktifData] = useState<Record<string,unknown>[]>([]);
  const [lulusanData, setLulusanData] = useState<Record<string,unknown>[]>([]);
  const [aktifTotal, setAktifTotal] = useState(0);
  const [lulusanTotal, setLulusanTotal] = useState(0);
  const [filterFakultas, setFilterFakultas] = useState("");
  const [loadingAktif, setLoadingAktif] = useState(false);
  const [loadingLulusan, setLoadingLulusan] = useState(false);
  const [page, setPage] = useState(1);

  const fetchAktif = useCallback(async () => {
    setLoadingAktif(true);
    try {
      const result = await getMahasiswaAktif({ page, limit: 10, fakultas: filterFakultas || undefined });
      setAktifData(result.data ?? []);
      setAktifTotal(result.pagination?.total ?? 0);
    } catch {
      // SQL Server might not have required tables — show empty
      setAktifData([]);
    } finally { setLoadingAktif(false); }
  }, [page, filterFakultas]);

  const fetchLulusan = useCallback(async () => {
    setLoadingLulusan(true);
    try {
      const result = await getLulusan({ page, limit: 10, fakultas: filterFakultas || undefined });
      setLulusanData(result.data ?? []);
      setLulusanTotal(result.pagination?.total ?? 0);
    } catch {
      setLulusanData([]);
    } finally { setLoadingLulusan(false); }
  }, [page, filterFakultas]);

  useEffect(() => { if (!user) return; if (activeTab === "aktif") fetchAktif(); else fetchLulusan(); }, [user, activeTab, fetchAktif, fetchLulusan]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const aktifColumns: Column<Record<string,unknown>>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-sm">{String(item.nim || "-")}</span> },
    { key: "nama", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{String(item.nama || item.nm_pd || "-")}</span> },
    { key: "prodi", label: "Prodi", sortable: true, render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{String(item.prodi || item.nm_lemb || "-")}</span> },
    { key: "status", label: "Status", align: "center" as const, render: (item) => <Chip size="sm" color="success" variant="flat">Aktif</Chip> },
  ];

  const lulusanColumns: Column<Record<string,unknown>>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-sm">{String(item.nim || "-")}</span> },
    { key: "nama", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{String(item.nama || "-")}</span> },
    { key: "prodi", label: "Prodi", sortable: true, render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{String(item.prodi || "-")}</span> },
  ];

  const aktifStatCards = [
    { label: "Total Mahasiswa Aktif", value: aktifTotal, icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Monitoring">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Monitoring</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitoring data mahasiswa aktif dan lulusan</p>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Mahasiswa Aktif */}
        {activeTab === "aktif" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aktifStatCards.map(card => (
                <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>{card.icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {aktifData.length === 0 && !loadingAktif ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiAlertCircle className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Data belum tersedia</p>
                <p className="text-sm">Koneksi ke database akademik diperlukan</p>
              </div>
            ) : (
              <DataTable data={aktifData} columns={aktifColumns} searchable searchKeys={["nim","nama","prodi"]} searchPlaceholder="Cari mahasiswa..."
                filterSlot={
                  <input value={filterFakultas} onChange={e => setFilterFakultas(e.target.value)} placeholder="Filter fakultas..."
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                }
                actionSlot={
                  <Button size="sm" variant="flat" color="success" startContent={<FiDownload className="w-4 h-4" />}
                    onPress={() => toast.success("Export CSV (segera tersedia)")}>Export CSV</Button>
                }
              />
            )}
          </div>
        )}

        {/* Lulusan */}
        {activeTab === "lulusan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white"><FiAward className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Lulusan</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{lulusanTotal.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {lulusanData.length === 0 && !loadingLulusan ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiAlertCircle className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Data belum tersedia</p>
                <p className="text-sm">Fitur monitoring lulusan sedang dikembangkan</p>
              </div>
            ) : (
              <DataTable data={lulusanData} columns={lulusanColumns} searchable searchKeys={["nim","nama","prodi"]} searchPlaceholder="Cari lulusan..."
                actionSlot={
                  <Button size="sm" variant="flat" color="success" startContent={<FiDownload className="w-4 h-4" />}
                    onPress={() => toast.success("Export CSV (segera tersedia)")}>Export CSV</Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
