"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
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
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  FiMapPin,
  FiRefreshCw,
  FiArrowLeft,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import Link from "next/link";
import {
  sisterPenugasanService,
  type Penugasan,
  type BatchPenugasanSyncResult,
  penugasanHelpers,
} from "@/lib/services/penugasanService";
import { sisterDosenService, type SisterDosen } from "@/lib/services/dosenService";
import { toast } from "react-hot-toast";

export default function PenugasanManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [searchNIDN, setSearchNIDN] = useState("");
  const [selectedDosen, setSelectedDosen] = useState<SisterDosen | null>(null);
  const [penugasanList, setPenugasanList] = useState<Penugasan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPenugasan, setIsLoadingPenugasan] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState<BatchPenugasanSyncResult | null>(null);

  const handleSearchDosen = async () => {
    if (!searchNIDN.trim()) {
      toast.error("Masukkan NIDN dosen");
      return;
    }

    try {
      setIsSearching(true);
      // Search dosen by NIDN
      const dosenList = await sisterDosenService.getList({
        search: searchNIDN.trim(),
        limit: 1,
      });

      if (dosenList.data.length === 0) {
        toast.error("Dosen dengan NIDN tersebut tidak ditemukan");
        setSelectedDosen(null);
        setPenugasanList([]);
        return;
      }

      const dosen = dosenList.data[0];
      setSelectedDosen(dosen);

      // Load penugasan for this dosen
      await loadPenugasan(dosen.id_sdm);
      toast.success(`Dosen ${dosen.nama_sdm} ditemukan`);
    } catch (error) {
      console.error("Error searching dosen:", error);
      toast.error("Gagal mencari dosen");
      setSelectedDosen(null);
      setPenugasanList([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPenugasan = async (idSDM: string) => {
    try {
      setIsLoadingPenugasan(true);
      const data = await sisterPenugasanService.getListByIDSDM(idSDM);
      setPenugasanList(data);
    } catch (error) {
      console.error("Error loading penugasan:", error);
      toast.error("Gagal memuat data penugasan");
      setPenugasanList([]);
    } finally {
      setIsLoadingPenugasan(false);
    }
  };

  const handleSyncClick = () => {
    if (!selectedDosen) {
      toast.error("Pilih dosen terlebih dahulu");
      return;
    }
    setShowSyncModal(true);
  };

  const handleConfirmSync = async () => {
    if (!selectedDosen) return;

    setShowSyncModal(false);
    setIsSyncing(true);

    try {
      const result = await sisterPenugasanService.syncByIDSDM(
        selectedDosen.id_sdm,
        user?.name || "system"
      );

      setSyncResult(result);

      if (result.total_success > 0) {
        toast.success(
          `Berhasil sinkronisasi ${result.total_success} penugasan`
        );
        // Reload penugasan list
        await loadPenugasan(selectedDosen.id_sdm);
      } else if (result.total_processed === 0) {
        toast.info("Tidak ada penugasan untuk dosen ini");
      } else {
        toast.error("Sinkronisasi gagal");
      }
    } catch (error) {
      console.error("Error syncing penugasan:", error);
      toast.error("Gagal melakukan sinkronisasi");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Penugasan/Penempatan Dosen"
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/sister-integrator"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Penugasan/Penempatan Dosen
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola dan sinkronisasi data penugasan/penempatan dosen dari SISTER API
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Masukkan NIDN Dosen (contoh: 0010026802)"
                  value={searchNIDN}
                  onChange={(e) => setSearchNIDN(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearchDosen();
                  }}
                  startContent={<FiSearch className="text-gray-400" />}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12",
                  }}
                />
              </div>
              <Button
                color="primary"
                size="lg"
                onClick={handleSearchDosen}
                isLoading={isSearching}
                startContent={!isSearching && <FiSearch />}
                className="sm:w-auto w-full"
              >
                Cari Dosen
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Selected Dosen Card */}
        {selectedDosen && (
          <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedDosen.nama_sdm}
                    </h3>
                    <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>NIDN: {selectedDosen.nidn || "-"}</span>
                      <span>•</span>
                      <span>NIP: {selectedDosen.nip || "-"}</span>
                    </div>
                  </div>
                </div>
                <Button
                  color="primary"
                  onClick={handleSyncClick}
                  isLoading={isSyncing}
                  startContent={!isSyncing && <FiRefreshCw />}
                >
                  Sync dari SISTER
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Penugasan List */}
        {selectedDosen && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardBody className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiMapPin className="text-blue-600" />
                Daftar Penugasan ({penugasanList.length})
              </h3>

              {isLoadingPenugasan ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" color="primary" />
                </div>
              ) : penugasanList.length === 0 ? (
                <div className="text-center py-12">
                  <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Belum ada data penugasan. Silakan sync dari SISTER.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table aria-label="Penugasan Table">
                    <TableHeader>
                      <TableColumn>NO</TableColumn>
                      <TableColumn>STATUS KEPEGAWAIAN</TableColumn>
                      <TableColumn>IKATAN KERJA</TableColumn>
                      <TableColumn>NO SURAT TUGAS</TableColumn>
                      <TableColumn>TGL SURAT TUGAS</TableColumn>
                      <TableColumn>TMT</TableColumn>
                      <TableColumn>LAST SYNC</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {penugasanList.map((penugasan, index) => (
                        <TableRow key={penugasan.id_reg_ptk}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {penugasanHelpers.getStatusKepegawaianLabel(
                              penugasan.id_stat_pegawai
                            )}
                          </TableCell>
                          <TableCell>
                            {penugasanHelpers.getIkatanKerjaLabel(
                              penugasan.id_ikatan_kerja
                            )}
                          </TableCell>
                          <TableCell>
                            {penugasan.no_srt_tgs || "-"}
                          </TableCell>
                          <TableCell>
                            {penugasanHelpers.formatDate(penugasan.tgl_srt_tgs)}
                          </TableCell>
                          <TableCell>
                            {penugasanHelpers.formatDate(penugasan.tmt_srt_tgs)}
                          </TableCell>
                          <TableCell>
                            {penugasanHelpers.formatDate(penugasan.last_sync)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Sync Confirmation Modal */}
        <Modal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          size="md"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Konfirmasi Sinkronisasi
            </ModalHeader>
            <ModalBody>
              <p>
                Apakah Anda yakin ingin melakukan sinkronisasi data penugasan untuk dosen{" "}
                <strong>{selectedDosen?.nama_sdm}</strong> dari SISTER API?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Proses ini akan mengambil data terbaru dari SISTER dan memperbarui database lokal.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => setShowSyncModal(false)}
              >
                Batal
              </Button>
              <Button
                color="primary"
                onPress={handleConfirmSync}
                startContent={<FiRefreshCw />}
              >
                Ya, Sinkronkan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
