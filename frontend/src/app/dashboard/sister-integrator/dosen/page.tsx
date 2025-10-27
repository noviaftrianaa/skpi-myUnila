"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Pagination,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
} from "@heroui/react";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDatabase,
  FiTrendingUp,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../config/menuConfig";
import { sisterDosenService, type SisterDosen, type SisterDosenStats } from "@/lib/services/dosenService";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function DosenManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [dosenList, setDosenList] = useState<SisterDosen[]>([]);
  const [stats, setStats] = useState<SisterDosenStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<SisterDosen | null>(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filterJenisSDM, setFilterJenisSDM] = useState<number>(0);
  const [filterStatusAktif, setFilterStatusAktif] = useState<number>(0);

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch dosen list when filters/page change
  useEffect(() => {
    fetchDosenList();
  }, [page, limit, search, filterJenisSDM, filterStatusAktif]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await sisterDosenService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik dosen");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchDosenList = async () => {
    try {
      setIsLoading(true);
      const data = await sisterDosenService.getList({
        page,
        limit,
        search: search || undefined,
        id_jns_sdm: filterJenisSDM || undefined,
        id_stat_aktif: filterStatusAktif || undefined,
      });

      setDosenList(data.data);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching dosen list:", error);
      toast.error("Gagal memuat daftar dosen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.name) {
      toast.error("User tidak teridentifikasi");
      return;
    }

    try {
      setIsSyncing(true);
      toast.loading("Memulai sinkronisasi data dosen dari SISTER API...", { id: "sync-toast" });

      const result = await sisterDosenService.syncFromSister(user.name);

      toast.success(
        `Sinkronisasi selesai! ${result.total_success} dosen berhasil di-sync dalam ${result.duration_seconds.toFixed(2)} detik`,
        { id: "sync-toast", duration: 5000 }
      );

      // Refresh data
      await Promise.all([fetchStats(), fetchDosenList()]);
    } catch (error: any) {
      console.error("Error syncing dosen:", error);
      toast.error(
        error?.response?.data?.error || "Gagal melakukan sinkronisasi data dosen",
        { id: "sync-toast" }
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRowClick = (dosen: SisterDosen) => {
    setSelectedDosen(dosen);
    onOpen();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: idLocale });
    } catch {
      return dateString;
    }
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Total Dosen",
      value: stats?.total_dosen.toLocaleString() || "0",
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      subtitle: "total data dosen",
      progress: 100,
    },
    {
      title: "Dosen Aktif",
      value: stats?.total_aktif.toLocaleString() || "0",
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      subtitle: `${stats ? ((stats.total_aktif / stats.total_dosen) * 100).toFixed(1) : 0}% dari total`,
      progress: stats ? (stats.total_aktif / stats.total_dosen) * 100 : 0,
    },
    {
      title: "Tidak Aktif",
      value: stats?.total_tidak_aktif.toLocaleString() || "0",
      icon: <FiXCircle className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      subtitle: `${stats ? ((stats.total_tidak_aktif / stats.total_dosen) * 100).toFixed(1) : 0}% dari total`,
      progress: stats ? (stats.total_tidak_aktif / stats.total_dosen) * 100 : 0,
    },
    {
      title: "Last Sync",
      value: stats?.last_sync ? formatDate(stats.last_sync) : "Belum sync",
      icon: <FiClock className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      subtitle: "terakhir sinkronisasi",
      progress: stats?.last_sync ? 100 : 0,
    },
  ];

  if (isLoadingStats) {
    return (
      <DashboardLayout
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        menuConfig={sisterIntegratorMenuConfig}
        pageTitle="Dosen Management"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Dosen Management"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    Manajemen Data Dosen - SISTER Integration
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Data Dosen Universitas Lampung
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Monitor dan kelola data dosen yang tersinkronisasi dengan SISTER API Kemdikbud
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiUsers className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group relative"
            >
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${stat.color}`}></div>
              </div>

              <CardBody className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-20 blur-lg group-hover:opacity-30 transition-opacity`}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={stat.progress}
                      className="flex-1"
                      classNames={{
                        indicator: `bg-gradient-to-r ${stat.color}`,
                        track: "bg-gray-100 dark:bg-gray-800",
                      }}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      {stat.progress.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {stat.subtitle}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Data Table Card */}
        <Card className="border-none shadow-lg">
          <CardBody className="p-6">
            {/* Table Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiDatabase className="w-5 h-5 text-purple-600" />
                  Daftar Dosen ({total.toLocaleString()})
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FiRefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />}
                    onClick={handleSync}
                    isLoading={isSyncing}
                    isDisabled={isSyncing}
                  >
                    Sync dari SISTER
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Cari nama, NIDN, atau NIP..."
                  value={search}
                  onValueChange={setSearch}
                  startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "h-10",
                  }}
                />
                <Select
                  placeholder="Jenis SDM"
                  selectedKeys={filterJenisSDM ? [filterJenisSDM.toString()] : []}
                  onChange={(e) => setFilterJenisSDM(parseInt(e.target.value) || 0)}
                  classNames={{
                    trigger: "h-10",
                  }}
                  startContent={<FiFilter className="w-4 h-4 text-gray-400" />}
                >
                  <SelectItem key="0" value="0">Semua Jenis</SelectItem>
                  {stats?.by_jenis_sdm.filter(j => j.total > 0).map((jenis) => (
                    <SelectItem key={jenis.id_jns_sdm.toString()} value={jenis.id_jns_sdm.toString()}>
                      {jenis.nm_jns_sdm} ({jenis.total})
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Status Aktif"
                  selectedKeys={filterStatusAktif ? [filterStatusAktif.toString()] : []}
                  onChange={(e) => setFilterStatusAktif(parseInt(e.target.value) || 0)}
                  classNames={{
                    trigger: "h-10",
                  }}
                  startContent={<FiFilter className="w-4 h-4 text-gray-400" />}
                >
                  <SelectItem key="0" value="0">Semua Status</SelectItem>
                  {stats?.by_status_aktif.filter(s => s.total > 0).map((status) => (
                    <SelectItem key={status.id_stat_aktif.toString()} value={status.id_stat_aktif.toString()}>
                      {status.nm_stat_aktif.trim()} ({status.total})
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Items per page"
                  selectedKeys={[limit.toString()]}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setPage(1);
                  }}
                  classNames={{
                    trigger: "h-10",
                  }}
                >
                  <SelectItem key="10" value="10">10 items</SelectItem>
                  <SelectItem key="25" value="25">25 items</SelectItem>
                  <SelectItem key="50" value="50">50 items</SelectItem>
                  <SelectItem key="100" value="100">100 items</SelectItem>
                </Select>
              </div>
            </div>

            {/* Table */}
            <Table
              aria-label="Daftar Dosen"
              classNames={{
                wrapper: "min-h-[400px]",
              }}
            >
              <TableHeader>
                <TableColumn>NAMA</TableColumn>
                <TableColumn>NIDN / NIP</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>JENIS KELAMIN</TableColumn>
                <TableColumn>NO HP</TableColumn>
                <TableColumn>LAST SYNC</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isLoading}
                loadingContent={<Spinner />}
                emptyContent="Tidak ada data dosen"
              >
                {dosenList.map((dosen) => (
                  <TableRow
                    key={dosen.id_sdm}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => handleRowClick(dosen)}
                  >
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {dosen.nama_sdm}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono text-gray-700 dark:text-gray-300">
                          {dosen.nidn || "-"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dosen.nip || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {dosen.email || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={dosen.jenis_kelamin === "L" ? "primary" : "secondary"}
                      >
                        {dosen.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {dosen.no_hp || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(dosen.last_sync)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total.toLocaleString()} data
              </div>
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
                classNames={{
                  cursor: "bg-purple-600 text-white",
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Detail Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold">Detail Dosen</h3>
                  <p className="text-sm text-gray-500 font-normal">
                    Data lengkap dari database
                  </p>
                </ModalHeader>
                <ModalBody>
                  {selectedDosen && (
                    <div className="space-y-4">
                      {/* Personal Info */}
                      <Card className="border-none shadow-sm">
                        <CardBody className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Informasi Personal
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                              <p className="font-medium">{selectedDosen.nama_sdm}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Jenis Kelamin</p>
                              <p className="font-medium">
                                {selectedDosen.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Tempat Lahir</p>
                              <p className="font-medium">{selectedDosen.tempat_lahir || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Tanggal Lahir</p>
                              <p className="font-medium">{formatDate(selectedDosen.tanggal_lahir)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">NIK</p>
                              <p className="font-mono text-sm">{selectedDosen.nik}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">NIDN</p>
                              <p className="font-mono text-sm">{selectedDosen.nidn || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">NIP</p>
                              <p className="font-mono text-sm">{selectedDosen.nip || "-"}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Contact Info */}
                      <Card className="border-none shadow-sm">
                        <CardBody className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Informasi Kontak
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <p className="font-medium text-sm break-all">{selectedDosen.email || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">No HP</p>
                              <p className="font-mono text-sm">{selectedDosen.no_hp || "-"}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Sync Info */}
                      <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-900/20">
                        <CardBody className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Informasi Sinkronisasi
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                              <p className="font-medium">{formatDate(selectedDosen.last_sync)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">ID SDM</p>
                              <p className="font-mono text-xs break-all">{selectedDosen.id_sdm}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    Tutup
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
