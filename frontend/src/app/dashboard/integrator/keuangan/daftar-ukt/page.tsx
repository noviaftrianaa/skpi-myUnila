"use client";

import { useState, useEffect, useRef } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import toast from "react-hot-toast";

const APP_KEY = "myunila-integrator";
import KeuanganDaftarUktTable from "@/shared/components/keuangan-integrator/KeuanganDaftarUktTable";
import {
  Card, CardBody, Spinner, Button, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Input, Checkbox,
} from "@heroui/react";
import {
  FiCheckCircle, FiClock, FiDatabase, FiList, FiRefreshCw,
} from "react-icons/fi";
import { MdSchool, MdSync } from "react-icons/md";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { keuanganClient } from "@/lib/api/keuanganClient";

interface DaftarUktStats {
  total_daftar_ukt: number;
  total_prodi: number;
  total_mapped: number;
  total_unmapped: number;
  last_sync?: string;
}

export default function DaftarUktManagementPage() {
  const { user } = useRequireAuth();

  const [stats, setStats] = useState<DaftarUktStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncTahun, setSyncTahun] = useState<string>(new Date().getFullYear().toString());
  const [forceSync, setForceSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await keuanganClient.get("/daftar-ukt/stats", { params: { _t: Date.now() } });
      if (response.data.success) setStats(response.data.data);
    } catch (error) {
      setStats({ total_daftar_ukt: 0, total_prodi: 0, total_mapped: 0, total_unmapped: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleConfirmSync = async () => {
    if (!syncTahun) {
      toast.error("Pilih tahun terlebih dahulu");
      return;
    }
    setShowSyncModal(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => prev >= 85 ? 85 : prev + 5);
      }, 300);

      const response = await keuanganClient.post("/daftar-ukt/sync", {
        tahun: parseInt(syncTahun),
        force_sync: forceSync,
        synced_by: user?.name || "system",
      });

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(response.data.message || "Sync berhasil");
        toast.success("Sync Daftar UKT berhasil!");
        setTimeout(async () => {
          await fetchStats();
          setRefreshKey(prev => prev + 1);
          setShowProgressModal(false);
          setSyncStatus("idle");
          setSyncProgress(0);
        }, 2000);
      } else {
        throw new Error(response.data.message || "Sync gagal");
      }
    } catch (error: any) {
      setSyncStatus("error");
      const msg = error.response?.data?.message || error.message || "Gagal sync";
      setSyncMessage(msg);
      toast.error(msg);
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncStatus("idle");
        setSyncProgress(0);
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Daftar UKT"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Daftar UKT</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data kelas UKT per prodi per tahun dari SIMPEDAM
            </p>
          </div>
          <Button
            color="primary"
            startContent={isSyncing ? <Spinner size="sm" color="white" /> : <MdSync className="w-5 h-5" />}
            onPress={() => setShowSyncModal(true)}
            isDisabled={isSyncing}
            className="flex-shrink-0"
          >
            Sync Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Total Daftar UKT</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-2xl font-bold text-white">{(stats?.total_daftar_ukt ?? 0).toLocaleString("id-ID")}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-teal-100">Total Prodi</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-2xl font-bold text-white">{(stats?.total_prodi ?? 0).toLocaleString("id-ID")}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-100">Ter-mapping</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-2xl font-bold text-white">{(stats?.total_mapped ?? 0).toLocaleString("id-ID")}</h3>
                  )}
                  {stats && stats.total_unmapped > 0 && (
                    <p className="text-xs text-yellow-200">{stats.total_unmapped} belum mapped</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-purple-100">Last Sync</p>
                  {isLoadingStats ? <Spinner size="sm" color="white" /> : (
                    <h3 className="text-sm font-bold text-white truncate">{formatDate(stats?.last_sync)}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <KeuanganDaftarUktTable key={refreshKey} />
          </CardBody>
        </Card>
      </div>

      {/* Sync Modal */}
      <Modal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} size="md">
        <ModalContent>
          <ModalHeader>Sinkronisasi Daftar UKT</ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sync data UKT dari SIMPEDAM untuk tahun yang dipilih.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Tahun</label>
              <select
                value={syncTahun}
                onChange={(e) => setSyncTahun(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
              >
                {tahunOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Checkbox isSelected={forceSync} onValueChange={setForceSync} size="sm">
              Force sync (update data yang sudah ada)
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowSyncModal(false)}>Batal</Button>
            <Button color="primary" onPress={handleConfirmSync} startContent={<MdSync />}>
              Mulai Sync
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Progress Modal */}
      <Modal isOpen={showProgressModal} isDismissable={false} size="sm">
        <ModalContent>
          <ModalHeader>
            {syncStatus === "syncing" ? "Sync Berlangsung..." :
             syncStatus === "success" ? "✅ Sync Berhasil" : "❌ Sync Gagal"}
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              {syncStatus === "syncing" && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" color="primary" />
                    <span className="text-sm text-gray-600">Sinkronisasi data tahun {syncTahun}...</span>
                  </div>
                </>
              )}
              {syncStatus === "success" && (
                <div className="text-center">
                  <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{syncMessage || "Data berhasil disinkronkan"}</p>
                </div>
              )}
              {syncStatus === "error" && (
                <div className="text-center">
                  <p className="text-red-500 text-sm">{syncMessage}</p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
