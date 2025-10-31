"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  Chip,
  Spinner,
} from "@heroui/react";
import { FiSearch, FiRefreshCw, FiMapPin, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  sisterPenugasanService,
  type Penugasan,
  penugasanHelpers,
} from "@/lib/services/penugasanService";
import { sisterDosenService, type SisterDosen } from "@/lib/services/dosenService";
import { useAuth } from "@/contexts/AuthContext";

export default function SisterPenugasanTable() {
  const { user } = useAuth();

  // State
  const [searchNIDN, setSearchNIDN] = useState("");
  const [selectedDosen, setSelectedDosen] = useState<SisterDosen | null>(null);
  const [penugasanList, setPenugasanList] = useState<Penugasan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPenugasan, setIsLoadingPenugasan] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(penugasanList.length / rowsPerPage);
  const items = penugasanList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearchDosen = async () => {
    if (!searchNIDN.trim()) {
      toast.error("Masukkan NIDN dosen");
      return;
    }

    try {
      setIsSearching(true);
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
      setPage(1);
    } catch (error) {
      console.error("Error loading penugasan:", error);
      toast.error("Gagal memuat data penugasan");
      setPenugasanList([]);
    } finally {
      setIsLoadingPenugasan(false);
    }
  };

  const handleSync = async () => {
    if (!selectedDosen) {
      toast.error("Pilih dosen terlebih dahulu");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await sisterPenugasanService.syncByIDSDM(
        selectedDosen.id_sdm,
        user?.name || "system"
      );

      if (result.total_success > 0) {
        toast.success(`Berhasil sinkronisasi ${result.total_success} penugasan`);
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
    <Card className="border-none shadow-lg">
      <CardBody className="p-6">
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari dosen berdasarkan NIDN (contoh: 0010026802)"
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
        </div>

        {/* Selected Dosen Info */}
        {selectedDosen && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedDosen.nama_sdm}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    NIDN: {selectedDosen.nidn || "-"} • NIP: {selectedDosen.nip || "-"}
                  </p>
                </div>
              </div>
              <Button
                color="primary"
                onClick={handleSync}
                isLoading={isSyncing}
                startContent={!isSyncing && <FiRefreshCw />}
                size="sm"
              >
                Sync dari SISTER
              </Button>
            </div>
          </div>
        )}

        {/* Table Section */}
        {!selectedDosen ? (
          <div className="text-center py-20">
            <FiMapPin className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada dosen dipilih
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Gunakan kolom pencarian di atas untuk mencari dosen berdasarkan NIDN
            </p>
          </div>
        ) : isLoadingPenugasan ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : penugasanList.length === 0 ? (
          <div className="text-center py-20">
            <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Belum ada data penugasan untuk dosen ini
            </p>
            <Button
              color="primary"
              onClick={handleSync}
              startContent={<FiRefreshCw />}
            >
              Sync dari SISTER
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                aria-label="Penugasan Table"
                classNames={{
                  wrapper: "min-h-[400px]",
                }}
              >
                <TableHeader>
                  <TableColumn>NO</TableColumn>
                  <TableColumn>STATUS KEPEGAWAIAN</TableColumn>
                  <TableColumn>IKATAN KERJA</TableColumn>
                  <TableColumn>NO SURAT TUGAS</TableColumn>
                  <TableColumn>TGL SURAT TUGAS</TableColumn>
                  <TableColumn>TMT TUGAS</TableColumn>
                  <TableColumn>LAST SYNC</TableColumn>
                </TableHeader>
                <TableBody>
                  {items.map((penugasan, index) => (
                    <TableRow key={penugasan.id_reg_ptk}>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            penugasan.id_stat_pegawai === 1
                              ? "success"
                              : penugasan.id_stat_pegawai === 2
                              ? "primary"
                              : "default"
                          }
                        >
                          {penugasanHelpers.getStatusKepegawaianLabel(
                            penugasan.id_stat_pegawai
                          )}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {penugasanHelpers.getIkatanKerjaLabel(
                          penugasan.id_ikatan_kerja
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {penugasan.no_srt_tgs || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {penugasanHelpers.formatDate(penugasan.tgl_srt_tgs)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {penugasanHelpers.formatDate(penugasan.tmt_srt_tgs)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {penugasanHelpers.formatDate(penugasan.last_sync)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={pages}
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
