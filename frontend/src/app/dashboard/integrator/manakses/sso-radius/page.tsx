"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import SsoRadiusPenggunaTable from "@/shared/components/myunila-integrator/SsoRadiusPenggunaTable";
import SsoRadiusSchedulerTable from "@/shared/components/myunila-integrator/SsoRadiusSchedulerTable";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { myunilaClient } from "@/lib/api/myunilaClient";
import { toast } from "react-hot-toast";

interface StatsData {
  total_pengguna: number;
  total_aktif: number;
  total_nonaktif: number;
  total_sso: number;
  total_non_sso: number;
  last_sync: string | null;
}

export default function ManaksesSsoRadiusPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{
    totalRecords: number;
    message: string;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter states
  const [usernameFilter, setUsernameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await myunilaClient.get("/radius/pengguna/stats", {
        params: { _t: Date.now() }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSyncClick = () => {
    setShowSyncModal(true);
  };

  const handleClearFilters = () => {
    setUsernameFilter("");
    setRoleFilter("");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const handleConfirmSync = async () => {
    setShowSyncModal(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);

    try {
      // Simulate progress while API is called
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 500);

      // Build filter payload
      const filterPayload: any = {
        sync_type: "manual",
      };

      if (usernameFilter) {
        filterPayload.username_filter = usernameFilter;
      }
      if (roleFilter) {
        filterPayload.role_filter = roleFilter;
      }
      if (dateFromFilter) {
        filterPayload.date_from = dateFromFilter;
      }
      if (dateToFilter) {
        filterPayload.date_to = dateToFilter;
      }

      // Call sync API with filters
      const response = await myunilaClient.post("/radius/sync", filterPayload, {
        params: {
          synced_by: user?.name || "system",
        },
      });

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");

        const data = response.data.data;
        setSyncResult({
          totalRecords: data.total_processed || 0,
          message: `Berhasil: ${data.total_success || 0}, Gagal: ${data.total_failed || 0}`
        });

        toast.success("Sinkronisasi berhasil!");

        // Trigger table refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(response.data.message || "Sinkronisasi gagal");
      }

      // Refresh stats after 2 seconds
      setTimeout(async () => {
        await fetchStats();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } catch (error: any) {
      console.error("Error syncing radius:", error);
      setSyncStatus("error");

      const errorMessage = error.response?.data?.message || error.message || "Gagal melakukan sinkronisasi";
      toast.error(errorMessage);

      setSyncResult({
        totalRecords: 0,
        message: errorMessage
      });

      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

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

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="SSO Radius - ManAkses"
    >
      <div className="space-y-6">
        {/* Header with Title and Sync Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              SSO Radius - ManAkses
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data pengguna SSO Radius dari sistem ManAkses UNILA
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onPress={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pengguna Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100 mb-1">Total Pengguna</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_pengguna ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengguna Aktif Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Pengguna Aktif</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_aktif ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengguna Tidak Aktif Card */}
          <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 mb-1">Pengguna Tidak Aktif</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_nonaktif ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-100 mb-1">Last Sync</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {formatDate(stats?.last_sync)}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs for Data Pengguna and Scheduler */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-6">
            <Tabs
              aria-label="SSO Radius tabs"
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary font-semibold"
              }}
            >
              <Tab
                key="data"
                title={
                  <div className="flex items-center space-x-2">
                    <FiUsers />
                    <span>Data Pengguna</span>
                  </div>
                }
              >
                <div className="py-4">
                  <SsoRadiusPenggunaTable refreshTrigger={refreshTrigger} />
                </div>
              </Tab>
              <Tab
                key="scheduler"
                title={
                  <div className="flex items-center space-x-2">
                    <FiClock />
                    <span>Scheduler</span>
                  </div>
                }
              >
                <div className="py-4">
                  <SsoRadiusSchedulerTable />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Sync Confirmation Modal */}
      <Modal
        isOpen={showSyncModal}
        onOpenChange={setShowSyncModal}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 rounded-2xl",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data SSO Radius ManAkses
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  {/* Filter Section */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        Filter Sinkronisasi (Opsional)
                        {(usernameFilter || roleFilter || dateFromFilter || dateToFilter) && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                            {[usernameFilter, roleFilter, dateFromFilter, dateToFilter].filter(Boolean).length} aktif
                          </span>
                        )}
                      </h4>
                      {(usernameFilter || roleFilter || dateFromFilter || dateToFilter) && (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={handleClearFilters}
                          className="text-xs font-medium text-gray-600 dark:text-gray-400"
                        >
                          Reset Filter
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Filter Username
                        </label>
                        <Input
                          placeholder="Contoh: john.doe"
                          value={usernameFilter}
                          onValueChange={setUsernameFilter}
                          size="sm"
                          variant="bordered"
                          classNames={{
                            input: "text-sm",
                            inputWrapper: "h-10",
                          }}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Kosongkan untuk sync semua user
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Filter Role
                        </label>
                        <Select
                          placeholder="Pilih role (kosongkan untuk semua)"
                          selectedKeys={roleFilter ? [roleFilter] : []}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          size="sm"
                          variant="bordered"
                          classNames={{
                            trigger: "h-10",
                          }}
                        >
                          <SelectItem key="Mahasiswa" value="Mahasiswa">
                            Mahasiswa
                          </SelectItem>
                          <SelectItem key="Dosen" value="Dosen">
                            Dosen
                          </SelectItem>
                          <SelectItem key="Tendik" value="Tendik">
                            Tendik
                          </SelectItem>
                          <SelectItem key="Guest" value="Guest">
                            Guest
                          </SelectItem>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Tanggal Dari
                          </label>
                          <Input
                            placeholder="YYYY-MM-DD"
                            value={dateFromFilter}
                            onValueChange={setDateFromFilter}
                            size="sm"
                            variant="bordered"
                            type="date"
                            classNames={{
                              input: "text-sm",
                              inputWrapper: "h-10",
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Tanggal Sampai
                          </label>
                          <Input
                            placeholder="YYYY-MM-DD"
                            value={dateToFilter}
                            onValueChange={setDateToFilter}
                            size="sm"
                            variant="bordered"
                            type="date"
                            classNames={{
                              input: "text-sm",
                              inputWrapper: "h-10",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil data pengguna terbaru dari SSO Radius API dan menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Kolom a_sso akan diupdate menjadi 1</li>
                          <li>User dengan multiple registrasi akan punya multiple roles</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-emerald-600" />
                      Statistik saat ini:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Total Pengguna:</span>
                        <span>{(stats?.total_pengguna ?? 0).toLocaleString("id-ID")} data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pengguna Aktif:</span>
                        <span>{(stats?.total_aktif ?? 0).toLocaleString("id-ID")} data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pengguna Tidak Aktif:</span>
                        <span>{(stats?.total_nonaktif ?? 0).toLocaleString("id-ID")} data</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="font-medium rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    handleConfirmSync();
                  }}
                  startContent={<MdSync className="w-4 h-4" />}
                  className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
                >
                  Ya, Sinkronkan Sekarang
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Sync Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        isDismissable={false}
        hideCloseButton
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 rounded-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  syncStatus === "success"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : syncStatus === "error"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                }`}
              >
                {syncStatus === "success" ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : syncStatus === "error" ? (
                  <FiXCircle className="w-6 h-6" />
                ) : (
                  <FiRefreshCw className="w-6 h-6 animate-spin" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {syncStatus === "success"
                    ? "Sinkronisasi Berhasil!"
                    : syncStatus === "error"
                    ? "Sinkronisasi Gagal"
                    : "Sedang Melakukan Sinkronisasi..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {syncStatus === "syncing" && "Mohon tunggu sebentar"}
                  {syncStatus === "success" && syncResult && `${syncResult.totalRecords.toLocaleString("id-ID")} data berhasil disinkronkan`}
                  {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  className="mb-2"
                  size="md"
                  classNames={{
                    track: "rounded-full",
                    indicator: "rounded-full",
                  }}
                />
              </div>

              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {syncResult.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Total: {syncResult.totalRecords.toLocaleString("id-ID")} data pengguna
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {syncResult?.message || "Terjadi kesalahan saat melakukan sinkronisasi. Silakan coba lagi."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
