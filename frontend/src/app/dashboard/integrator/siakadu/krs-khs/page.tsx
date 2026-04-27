"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import siakaduService, {
  SiakaduKRS,
  SiakaduKHS,
  KHSFilterOptions,
  KuliahFilterOptions,
} from "@/lib/services/siakadu/siakaduService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

const APP_KEY = "myunila-integrator";

import {
  Card,
  CardBody,
  Spinner,
  Progress,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FiFileText,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

interface StatsData {
  total_records: number;
  last_sync: string | null;
}

/** Format raw id_smt like "20241" into "2024/2025 Ganjil" */
function formatSemester(idSmt?: string | null): string {
  if (!idSmt || idSmt.length < 5) return idSmt || "-";
  const year = parseInt(idSmt.substring(0, 4), 10);
  const term = idSmt.charAt(4);
  const yearLabel = `${year}/${year + 1}`;
  if (term === "1") return `${yearLabel} Ganjil`;
  if (term === "2") return `${yearLabel} Genap`;
  if (term === "3") return `${yearLabel} Pendek`;
  return `${yearLabel} (${term})`;
}

export default function SiakaduKrsKhsPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("khs");

  // KRS state
  const [krsStats, setKrsStats] = useState<StatsData | null>(null);
  const [isLoadingKrsStats, setIsLoadingKrsStats] = useState(true);
  const [krsData, setKrsData] = useState<SiakaduKRS[]>([]);
  const [isLoadingKrs, setIsLoadingKrs] = useState(true);
  const [krsTotalRecords, setKrsTotalRecords] = useState(0);
  const [krsPage, setKrsPage] = useState(1);
  const [krsRowsPerPage, setKrsRowsPerPage] = useState(10);
  const [krsSearch, setKrsSearch] = useState("");
  const [krsSemester, setKrsSemester] = useState("");
  const [krsFilterOptions, setKrsFilterOptions] = useState<KuliahFilterOptions | null>(null);
  const [krsSelectedProdi, setKrsSelectedProdi] = useState("");
  const [krsSelectedAngkatan, setKrsSelectedAngkatan] = useState("");
  const [krsShowFilters, setKrsShowFilters] = useState(false);
  const [krsSortBy, setKrsSortBy] = useState("nim");
  const [krsSortOrder, setKrsSortOrder] = useState<"asc" | "desc">("asc");

  // KHS state
  const [khsStats, setKhsStats] = useState<StatsData | null>(null);
  const [isLoadingKhsStats, setIsLoadingKhsStats] = useState(true);
  const [khsData, setKhsData] = useState<SiakaduKHS[]>([]);
  const [isLoadingKhs, setIsLoadingKhs] = useState(true);
  const [khsTotalRecords, setKhsTotalRecords] = useState(0);
  const [khsPage, setKhsPage] = useState(1);
  const [khsRowsPerPage, setKhsRowsPerPage] = useState(10);
  const [khsSearch, setKhsSearch] = useState("");

  // KHS filters
  const [khsFilterOptions, setKhsFilterOptions] =
    useState<KHSFilterOptions | null>(null);
  const [khsSelectedSemester, setKhsSelectedSemester] = useState("");
  const [khsSelectedProdi, setKhsSelectedProdi] = useState("");
  const [khsSelectedAngkatan, setKhsSelectedAngkatan] = useState("");
  const [khsShowFilters, setKhsShowFilters] = useState(false);

  // KHS sorting
  const [khsSortBy, setKhsSortBy] = useState("nim");
  const [khsSortOrder, setKhsSortOrder] = useState<"asc" | "desc">("asc");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const fetchKrsStats = useCallback(async () => {
    try {
      setIsLoadingKrsStats(true);
      const r = await siakaduService.getKRSStats();
      if (r.success) setKrsStats(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKrsStats(false);
    }
  }, []);

  const fetchKhsStats = useCallback(async () => {
    try {
      setIsLoadingKhsStats(true);
      const r = await siakaduService.getKHSStats();
      if (r.success) setKhsStats(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKhsStats(false);
    }
  }, []);

  const fetchKrsFilters = useCallback(async () => {
    try {
      const r = await siakaduService.getStatusKuliahFilters();
      if (r.success) setKrsFilterOptions(r.data);
    } catch (e) {
      console.error("Error fetching KRS filters:", e);
    }
  }, []);

  const fetchKhsFilters = useCallback(async () => {
    try {
      const r = await siakaduService.getKHSFilters();
      if (r.success) setKhsFilterOptions(r.data);
    } catch (e) {
      console.error("Error fetching KHS filters:", e);
    }
  }, []);

  const fetchKrsData = useCallback(async () => {
    try {
      setIsLoadingKrs(true);
      const r = await siakaduService.getStatusKuliahList({
        page: krsPage,
        limit: krsRowsPerPage,
        search: krsSearch || undefined,
        id_smt: krsSemester || undefined,
        id_unit: krsSelectedProdi || undefined,
        angkatan: krsSelectedAngkatan || undefined,
        sort_by: krsSortBy,
        sort_order: krsSortOrder,
      });
      if (r.success) {
        setKrsData(r.data || []);
        setKrsTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKrs(false);
    }
  }, [krsPage, krsRowsPerPage, krsSearch, krsSemester, krsSelectedProdi, krsSelectedAngkatan, krsSortBy, krsSortOrder]);

  const fetchKhsData = useCallback(async () => {
    try {
      setIsLoadingKhs(true);
      const r = await siakaduService.getKHSList({
        page: khsPage,
        limit: khsRowsPerPage,
        search: khsSearch || undefined,
        id_smt: khsSelectedSemester || undefined,
        id_unit: khsSelectedProdi || undefined,
        angkatan: khsSelectedAngkatan || undefined,
        sort_by: khsSortBy,
        sort_order: khsSortOrder,
      });
      if (r.success) {
        setKhsData(r.data || []);
        setKhsTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKhs(false);
    }
  }, [
    khsPage,
    khsRowsPerPage,
    khsSearch,
    khsSelectedSemester,
    khsSelectedProdi,
    khsSelectedAngkatan,
    khsSortBy,
    khsSortOrder,
  ]);

  useEffect(() => {
    fetchKrsStats();
    fetchKhsStats();
    fetchKrsFilters();
    fetchKhsFilters();
  }, [fetchKrsStats, fetchKhsStats, fetchKrsFilters, fetchKhsFilters]);
  useEffect(() => {
    fetchKrsData();
  }, [fetchKrsData]);
  useEffect(() => {
    fetchKhsData();
  }, [fetchKhsData]);

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 800);

      const syncFn =
        activeTab === "krs" ? siakaduService.syncKRS : siakaduService.syncKHS;
      const filter =
        activeTab === "krs" && krsSemester
          ? { id_semester: krsSemester }
          : activeTab === "khs" && khsSelectedSemester
            ? { id_semester: khsSelectedSemester }
            : undefined;
      const r = await syncFn(filter, user?.name || "system");
      clearInterval(progressInterval);

      if (r.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(
          `Inserted: ${r.data?.total_inserted || 0}, Updated: ${r.data?.total_updated || 0}, Duration: ${r.data?.duration || ""}`
        );
        toast.success(`Sinkronisasi ${activeTab.toUpperCase()} berhasil!`);
        setTimeout(async () => {
          if (activeTab === "krs") {
            await fetchKrsStats();
            await fetchKrsData();
          } else {
            await fetchKhsStats();
            await fetchKhsData();
          }
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 3000);
      } else {
        throw new Error(r.message || "Sinkronisasi gagal");
      }
    } catch (e: any) {
      setSyncStatus("error");
      setSyncMessage(
        e.response?.data?.message || e.message || "Gagal melakukan sinkronisasi"
      );
      toast.error("Sinkronisasi gagal");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearKrsFilters = () => {
    setKrsSemester("");
    setKrsSelectedProdi("");
    setKrsSelectedAngkatan("");
    setKrsPage(1);
  };

  const krsHasActiveFilters = krsSemester || krsSelectedProdi || krsSelectedAngkatan;
  const krsActiveFilterCount = [krsSemester, krsSelectedProdi, krsSelectedAngkatan].filter(Boolean).length;

  const clearKhsFilters = () => {
    setKhsSelectedSemester("");
    setKhsSelectedProdi("");
    setKhsSelectedAngkatan("");
    setKhsPage(1);
  };

  const khsHasActiveFilters =
    khsSelectedSemester || khsSelectedProdi || khsSelectedAngkatan;
  const khsActiveFilterCount = [
    khsSelectedSemester,
    khsSelectedProdi,
    khsSelectedAngkatan,
  ].filter(Boolean).length;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const krsColumns: Column<SiakaduKRS>[] = [
    { key: "nim", label: "NIM", sortable: true },
    { key: "nama_mahasiswa", label: "Nama", sortable: true },
    {
      key: "id_semester",
      label: "Semester",
      align: "center",
      render: (item) => (
        <span className="text-sm">{formatSemester(item.id_semester)}</span>
      ),
    },
    {
      key: "status_kuliah",
      label: "Status",
      align: "center",
      render: (item) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {item.status_kuliah || "-"}
        </span>
      ),
    },
    {
      key: "ips",
      label: "IPS",
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">
          {item.ips != null ? item.ips.toFixed(2) : "-"}
        </span>
      ),
    },
    {
      key: "sks_smt",
      label: "SKS",
      align: "center",
      render: (item) => (
        <span className="text-sm">
          {item.sks_smt != null ? item.sks_smt : "-"}
        </span>
      ),
    },
  ];

  const khsColumns: Column<SiakaduKHS>[] = [
    {
      key: "nim",
      label: "NIM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.nim}</span>,
    },
    {
      key: "nama_mahasiswa",
      label: "Nama",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.nama_mahasiswa?.trim() || "-"}
        </span>
      ),
    },
    {
      key: "nm_prodi",
      label: "Prodi",
      render: (item) => (
        <div className="max-w-[200px]">
          <p className="text-sm truncate" title={item.nm_prodi || "-"}>
            {item.nm_prodi || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "id_semester",
      label: "Semester",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-sm">{formatSemester(item.id_semester)}</span>
      ),
    },
    {
      key: "kode_mk",
      label: "Kode MK",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">{item.kode_mk || "-"}</span>
      ),
    },
    {
      key: "nama_mk",
      label: "Nama MK",
      render: (item) => (
        <div className="max-w-[220px]">
          <p className="text-sm truncate" title={item.nama_mk || "-"}>
            {item.nama_mk || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "sks_mk",
      label: "SKS",
      align: "center",
      render: (item) => (
        <span className="text-sm">{item.sks_mk != null ? item.sks_mk : "-"}</span>
      ),
    },
    {
      key: "nilai_huruf",
      label: "Nilai Huruf",
      sortable: true,
      align: "center",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            item.nilai_huruf === "A"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : item.nilai_huruf === "B" ||
                  item.nilai_huruf === "B+" ||
                  item.nilai_huruf === "B-"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : item.nilai_huruf === "C" ||
                    item.nilai_huruf === "C+" ||
                    item.nilai_huruf === "C-"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : item.nilai_huruf === "D" || item.nilai_huruf === "D+"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    : item.nilai_huruf === "E"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {item.nilai_huruf || "-"}
        </span>
      ),
    },
    {
      key: "nilai_angka",
      label: "Nilai Angka",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">
          {item.nilai_angka != null ? item.nilai_angka.toFixed(2) : "-"}
        </span>
      ),
    },
  ];

  const currentStats = activeTab === "krs" ? krsStats : khsStats;
  const isLoadingCurrentStats =
    activeTab === "krs" ? isLoadingKrsStats : isLoadingKhsStats;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="KRS/KHS SIAKADU"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data KRS & KHS
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi data KRS dan KHS dari SIAKADU
            </p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <MdSync className="w-5 h-5" />
            )}
            Sync {activeTab.toUpperCase()}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100 mb-1">
                    Total KRS
                  </p>
                  {isLoadingKrsStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(krsStats?.total_records ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">
                    Total KHS
                  </p>
                  {isLoadingKhsStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(khsStats?.total_records ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-violet-100 mb-1">
                    Status Sync
                  </p>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {currentStats?.total_records
                      ? "Tersinkronisasi"
                      : "Belum Sync"}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 mb-1">
                    Last Sync
                  </p>
                  {isLoadingCurrentStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {formatDate(currentStats?.last_sync)}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs (siakadu_khs) */}
        <ScheduleList syncType={"siakadu_khs" as any} />

        {/* Tabs */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-4">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-6",
                cursor: "w-full bg-blue-600",
                tab: "max-w-fit px-0 h-12",
                tabContent:
                  "group-data-[selected=true]:text-blue-600 font-semibold",
              }}
            >
              <Tab key="krs" title="KRS (Kartu Rencana Studi)">
                <div className="mt-4 space-y-4">
                  {/* KRS Filter Bar */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setKrsShowFilters(!krsShowFilters)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Filter
                        </span>
                        {krsHasActiveFilters && (
                          <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                            {krsActiveFilterCount}
                          </span>
                        )}
                      </div>
                      {krsShowFilters ? (
                        <FiChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {krsShowFilters && (
                      <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                          {/* Semester */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Semester
                            </label>
                            <select
                              value={krsSemester}
                              onChange={(e) => {
                                setKrsSemester(e.target.value);
                                setKrsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Semester</option>
                              {(krsFilterOptions?.semester || []).map((s) => (
                                <option key={s} value={s}>
                                  {formatSemester(s)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Prodi */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Program Studi
                            </label>
                            <select
                              value={krsSelectedProdi}
                              onChange={(e) => {
                                setKrsSelectedProdi(e.target.value);
                                setKrsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Prodi</option>
                              {(krsFilterOptions?.prodi || []).map((p) => (
                                <option key={p.id_unit} value={p.id_unit}>
                                  {p.nm_prodi}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Angkatan */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Angkatan
                            </label>
                            <select
                              value={krsSelectedAngkatan}
                              onChange={(e) => {
                                setKrsSelectedAngkatan(e.target.value);
                                setKrsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Angkatan</option>
                              {(krsFilterOptions?.angkatan || []).map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {krsHasActiveFilters && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={clearKrsFilters}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <FiX className="w-3 h-3" /> Hapus Semua Filter
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* KRS Data Table */}
                  <DataTable<SiakaduKRS>
                    data={krsData}
                    columns={krsColumns}
                    searchable
                    searchPlaceholder="Cari NIM atau nama..."
                    loading={isLoadingKrs}
                    serverSide
                    totalRecords={krsTotalRecords}
                    currentPage={krsPage}
                    onPageChange={setKrsPage}
                    onRowsPerPageChange={(r) => {
                      setKrsRowsPerPage(r);
                      setKrsPage(1);
                    }}
                    onSearchChange={(q) => {
                      setKrsSearch(q);
                      setKrsPage(1);
                    }}
                    onSortChange={(key, order) => {
                      setKrsSortBy(key);
                      setKrsSortOrder(order);
                      setKrsPage(1);
                    }}
                    defaultRowsPerPage={krsRowsPerPage}
                  />
                </div>
              </Tab>
              <Tab key="khs" title="KHS (Kartu Hasil Studi)">
                <div className="mt-4 space-y-4">
                  {/* KHS Filter Bar */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setKhsShowFilters(!khsShowFilters)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Filter
                        </span>
                        {khsHasActiveFilters && (
                          <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                            {khsActiveFilterCount}
                          </span>
                        )}
                      </div>
                      {khsShowFilters ? (
                        <FiChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {khsShowFilters && (
                      <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                          {/* Semester */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Semester
                            </label>
                            <select
                              value={khsSelectedSemester}
                              onChange={(e) => {
                                setKhsSelectedSemester(e.target.value);
                                setKhsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Semester</option>
                              {(khsFilterOptions?.semester || []).map((s) => (
                                <option key={s} value={s}>
                                  {formatSemester(s)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Prodi */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Program Studi
                            </label>
                            <select
                              value={khsSelectedProdi}
                              onChange={(e) => {
                                setKhsSelectedProdi(e.target.value);
                                setKhsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Prodi</option>
                              {(khsFilterOptions?.prodi || []).map((p) => (
                                <option key={p.id_unit} value={p.id_unit}>
                                  {p.nm_prodi}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Angkatan */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                              Angkatan
                            </label>
                            <select
                              value={khsSelectedAngkatan}
                              onChange={(e) => {
                                setKhsSelectedAngkatan(e.target.value);
                                setKhsPage(1);
                              }}
                              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Semua Angkatan</option>
                              {(khsFilterOptions?.angkatan || []).map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {khsHasActiveFilters && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={clearKhsFilters}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <FiX className="w-3 h-3" /> Hapus Semua Filter
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* KHS Data Table */}
                  <DataTable<SiakaduKHS>
                    data={khsData}
                    columns={khsColumns}
                    searchable
                    searchPlaceholder="Cari NIM, nama, atau mata kuliah..."
                    loading={isLoadingKhs}
                    serverSide
                    totalRecords={khsTotalRecords}
                    currentPage={khsPage}
                    onPageChange={setKhsPage}
                    onRowsPerPageChange={(r) => {
                      setKhsRowsPerPage(r);
                      setKhsPage(1);
                    }}
                    onSearchChange={(q) => {
                      setKhsSearch(q);
                      setKhsPage(1);
                    }}
                    onSortChange={(key, order) => {
                      setKhsSortBy(key);
                      setKhsSortOrder(order);
                      setKhsPage(1);
                    }}
                    defaultRowsPerPage={khsRowsPerPage}
                  />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Sync Confirm Dialog */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowSyncConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MdSync className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sinkronisasi Data
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeTab.toUpperCase()} SIAKADU
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Proses ini akan:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>
                    Mengambil data {activeTab.toUpperCase()} terbaru dari SIAKADU
                  </li>
                  <li>Data yang sudah ada akan diperbarui</li>
                  <li>Data baru akan ditambahkan</li>
                </ul>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSyncConfirm(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSync}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all"
                >
                  Ya, Sinkronkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    syncStatus === "success"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : syncStatus === "error"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
                  {syncStatus === "success" ? (
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  ) : syncStatus === "error" ? (
                    <FiXCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <FiRefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {syncStatus === "success"
                      ? "Sinkronisasi Berhasil"
                      : syncStatus === "error"
                        ? "Sinkronisasi Gagal"
                        : "Sedang Sinkronisasi..."}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {syncStatus === "syncing" &&
                      "Mohon tunggu, jangan tutup halaman"}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Progress
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {syncProgress}%
                </span>
              </div>
              <Progress
                value={syncProgress}
                color={
                  syncStatus === "success"
                    ? "success"
                    : syncStatus === "error"
                      ? "danger"
                      : "primary"
                }
                size="md"
                classNames={{
                  track: "rounded-full",
                  indicator: "rounded-full",
                }}
              />

              {syncMessage && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    syncStatus === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : syncStatus === "error"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : ""
                  }`}
                >
                  {syncMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
