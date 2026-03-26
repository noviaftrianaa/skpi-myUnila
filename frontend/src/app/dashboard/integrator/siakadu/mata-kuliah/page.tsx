"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import siakaduService, { SiakaduMataKuliah } from "@/lib/services/siakadu/siakaduService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

const APP_KEY = "myunila-integrator";

import {
  Card, CardBody, Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Progress,
} from "@heroui/react";
import { FiBook, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

interface StatsData { total_records: number; last_sync: string | null; }

export default function SiakaduMataKuliahPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [data, setData] = useState<SiakaduMataKuliah[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{ totalRecords: number; message: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try { setIsLoadingStats(true); const r = await siakaduService.getMatakuliahStats(); if (r.success) setStats(r.data); } catch (e) { console.error(e); } finally { setIsLoadingStats(false); }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const r = await siakaduService.getMatakuliahList({ page: currentPage, limit: rowsPerPage, search: searchQuery || undefined });
      if (r.success) { setData(r.data || []); setTotalRecords(r.meta?.total || 0); }
    } catch (e) { console.error(e); } finally { setIsLoadingData(false); }
  }, [currentPage, rowsPerPage, searchQuery]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmSync = async () => {
    setShowSyncModal(false); setShowProgressModal(true); setIsSyncing(true); setSyncStatus("syncing"); setSyncProgress(0);
    try {
      const pi = setInterval(() => { setSyncProgress((p) => { if (p >= 80) { clearInterval(pi); return 80; } return p + 10; }); }, 500);
      const r = await siakaduService.syncMatakuliah(undefined, user?.name || "system");
      clearInterval(pi);
      if (r.success) {
        setSyncProgress(100); setSyncStatus("success");
        setSyncResult({ totalRecords: r.data?.total_processed || r.data?.inserted || 0, message: r.data?.message || `Inserted: ${r.data?.inserted || 0}, Updated: ${r.data?.updated || 0}` });
        toast.success("Sinkronisasi mata kuliah berhasil!");
      } else throw new Error(r.message || "Sinkronisasi gagal");
      setTimeout(async () => { await fetchStats(); await fetchData(); setShowProgressModal(false); setSyncProgress(0); setSyncStatus("idle"); }, 2000);
    } catch (e: any) {
      setSyncStatus("error"); toast.error(e.response?.data?.message || e.message || "Gagal");
      setSyncResult({ totalRecords: 0, message: e.response?.data?.message || e.message || "Gagal" });
      setTimeout(() => { setShowProgressModal(false); setSyncProgress(0); setSyncStatus("idle"); }, 3000);
    } finally { setIsSyncing(false); }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "Belum pernah";
    return new Date(d).toLocaleString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const columns: Column<SiakaduMataKuliah>[] = [
    { key: "kode_mk", label: "Kode MK", sortable: true },
    { key: "nama_mata_kuliah", label: "Nama MK", sortable: true },
    { key: "sks", label: "SKS", align: "center", sortable: true },
    { key: "jenis_mk", label: "Jenis", align: "center",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.jenis_mk === "W" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        }`}>{item.jenis_mk === "W" ? "Wajib" : item.jenis_mk === "P" ? "Pilihan" : item.jenis_mk || "-"}</span>
      ),
    },
    { key: "nm_prodi", label: "Prodi", sortable: true },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="MyUnila Integrator" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={myunilaIntegratorMenuConfig} pageTitle="Data Mata Kuliah SIAKADU">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Mata Kuliah</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sinkronisasi data mata kuliah dari SIAKADU</p>
          </div>
          <Button color="primary" size="lg" startContent={<MdSync className="w-5 h-5" />}
            onPress={() => setShowSyncModal(true)} isLoading={isSyncing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl">
            Sinkronisasi Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiBook className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100 mb-1">Total Mata Kuliah</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{(stats?.total_records ?? 0).toLocaleString("id-ID")}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Status Sync</p>
                  <h3 className="text-lg font-bold text-white leading-tight">{stats?.total_records ? "Tersinkronisasi" : "Belum Sync"}</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 mb-1">Last Sync</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-base font-bold text-white leading-tight truncate">{formatDate(stats?.last_sync)}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <DataTable<SiakaduMataKuliah> data={data} columns={columns} searchable searchPlaceholder="Cari kode/nama mata kuliah..."
              loading={isLoadingData} serverSide totalRecords={totalRecords} currentPage={currentPage}
              onPageChange={setCurrentPage} onRowsPerPageChange={(r) => { setRowsPerPage(r); setCurrentPage(1); }}
              onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }} defaultRowsPerPage={rowsPerPage} />
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={showSyncModal} onOpenChange={setShowSyncModal} size="md" backdrop="blur"
        classNames={{ backdrop: "bg-black/50 backdrop-blur-sm", base: "bg-white dark:bg-gray-800 rounded-2xl" }}>
        <ModalContent>{(onClose) => (<>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg"><MdSync className="w-6 h-6" /></div>
              <div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Konfirmasi Sinkronisasi</h3><p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Data Mata Kuliah SIAKADU</p></div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan mengambil data mata kuliah terbaru dari SIAKADU.</p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Data yang sudah ada akan diperbarui</li><li>Data baru akan ditambahkan</li><li>Proses memerlukan waktu beberapa menit</li>
                  </ul>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="light" onPress={onClose} className="font-medium rounded-xl">Batal</Button>
            <Button color="primary" onPress={() => { onClose(); handleConfirmSync(); }} startContent={<MdSync className="w-4 h-4" />}
              className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">Ya, Sinkronkan Sekarang</Button>
          </ModalFooter>
        </>)}</ModalContent>
      </Modal>

      <Modal isOpen={showProgressModal} isDismissable={false} hideCloseButton size="md" backdrop="blur"
        classNames={{ backdrop: "bg-black/50 backdrop-blur-sm", base: "bg-white dark:bg-gray-800 rounded-2xl" }}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${syncStatus === "success" ? "bg-gradient-to-br from-green-500 to-green-600" : syncStatus === "error" ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6" /> : syncStatus === "error" ? <FiXCircle className="w-6 h-6" /> : <FiRefreshCw className="w-6 h-6 animate-spin" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{syncStatus === "success" ? "Sinkronisasi Berhasil!" : syncStatus === "error" ? "Sinkronisasi Gagal" : "Sedang Melakukan Sinkronisasi..."}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">{syncStatus === "syncing" && "Mohon tunggu sebentar"}{syncStatus === "success" && syncResult && `${syncResult.totalRecords.toLocaleString("id-ID")} data berhasil diproses`}{syncStatus === "error" && "Terjadi kesalahan"}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span><span className="text-sm font-bold text-blue-600 dark:text-blue-400">{syncProgress}%</span></div>
                <Progress value={syncProgress} color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "primary"} className="mb-2" size="md" classNames={{ track: "rounded-full", indicator: "rounded-full" }} />
              </div>
              {syncStatus === "success" && syncResult && (<div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"><div className="flex items-center gap-3"><FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><p className="text-sm font-semibold text-gray-800 dark:text-white">{syncResult.message}</p></div></div>)}
              {syncStatus === "error" && (<div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><div className="flex items-center gap-3"><FiXCircle className="w-5 h-5 text-red-600 flex-shrink-0" /><p className="text-sm text-gray-700 dark:text-gray-300">Terjadi kesalahan. Silakan coba lagi.</p></div></div>)}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
