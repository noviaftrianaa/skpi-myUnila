"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";
import { FiSearch, FiBook } from "react-icons/fi";

interface KurikulumListItem {
  id_kurikulum_sp: string;
  nm_kurikulum_sp: string;
  id_semester: string;
  nama_semester?: string | null;
  jmlh_smt_normal: number;
  jmlh_sks_lulus: number; // Can be decimal from backend
  jmlh_sks_wajib?: number | null;
  jmlh_sks_pilihan?: number | null;
  jumlah_matkul: number;
  last_sync: string;
  id_prodi: string;
  nama_prodi?: string | null;
  nama_jenjang?: string | null;
  kode_prodi?: string | null;
  stat_kurikulum?: number | null;
  a_periode_aktif?: number | null;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
  nm_jenj_didik: string;
}

interface MatkulItem {
  id_mk: string;
  kode_mk?: string;
  nm_mk?: string;
  smt?: number;
  sks_mk?: number;
  sks_tm?: number;
  sks_prak?: number;
  sks_prak_lap?: number;
  sks_sim?: number;
  a_wajib?: number;
  jns_mk?: string;
  kel_mk?: string;
}

interface FeederKurikulumTableProps {
  onFilterChange?: (filters: { id_prodi?: string }) => void;
}

export default function FeederKurikulumTable({ onFilterChange }: FeederKurikulumTableProps) {
  const [data, setData] = useState<KurikulumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [prodiOptions, setProdiOptions] = useState<ProdiOption[]>([]);

  // Modal state
  const [showMatkulModal, setShowMatkulModal] = useState(false);
  const [selectedKurikulum, setSelectedKurikulum] = useState<KurikulumListItem | null>(null);
  const [matkulList, setMatkulList] = useState<MatkulItem[]>([]);
  const [matkulLoading, setMatkulLoading] = useState(false);
  const [matkulSearch, setMatkulSearch] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load filter options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load prodi list
        const prodiRes = await feederClient.get("/kurikulum/prodi");
        if (prodiRes.data.success) {
          setProdiOptions(prodiRes.data.data);
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  // Handle sort change
  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          _t: Date.now().toString(), // Cache busting
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await feederClient.get(`/kurikulum?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading kurikulum:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterProdi, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    console.log('FeederKurikulumTable: filterProdi changed to:', filterProdi);
    if (onFilterChange) {
      console.log('FeederKurikulumTable: Calling onFilterChange with id_prodi:', filterProdi || undefined);
      onFilterChange({
        id_prodi: filterProdi || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProdi]);

  // Handle open matkul modal
  const handleOpenMatkulModal = async (kurikulum: KurikulumListItem) => {
    setSelectedKurikulum(kurikulum);
    setShowMatkulModal(true);
    setMatkulSearch("");
    await fetchMatkulList(kurikulum.id_kurikulum_sp, "");
  };

  // Fetch matkul list
  const fetchMatkulList = async (idKurikulum: string, search: string) => {
    setMatkulLoading(true);
    try {
      const params = new URLSearchParams({
        _t: Date.now().toString(),
      });
      if (search) {
        params.append("search", search);
      }

      const response = await feederClient.get(
        `/kurikulum/${idKurikulum}/matkul?${params.toString()}`
      );

      if (response.data.success) {
        setMatkulList(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading matkul:", error);
      setMatkulList([]);
    } finally {
      setMatkulLoading(false);
    }
  };

  // Handle search in modal
  const handleMatkulSearch = (value: string) => {
    setMatkulSearch(value);
    if (selectedKurikulum) {
      fetchMatkulList(selectedKurikulum.id_kurikulum_sp, value);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum sync";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Belum sync";
    }
  };

  const columns: Column<KurikulumListItem>[] = [
    {
      key: "nm_kurikulum_sp",
      label: "NAMA KURIKULUM",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {item.nm_kurikulum_sp}
          </div>
          {item.nama_semester && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📅 {item.nama_semester}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: false,
      render: (item) => (
        <div className="text-sm max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_prodi || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nama_jenjang || ""} {item.kode_prodi ? `(${item.kode_prodi})` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "jumlah_matkul",
      label: "MATKUL",
      sortable: false,
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-center">
          <Chip
            size="sm"
            variant="flat"
            color={item.jumlah_matkul > 0 ? "primary" : "default"}
            className="font-semibold cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleOpenMatkulModal(item)}
          >
            {item.jumlah_matkul} MK
          </Chip>
        </div>
      ),
    },
    {
      key: "jmlh_sks_lulus",
      label: "SKS LULUS",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="text-center">
          <div className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
            {item.jmlh_sks_lulus} SKS
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.jmlh_smt_normal} Semester
          </div>
        </div>
      ),
    },
    {
      key: "sks_breakdown",
      label: "SKS WAJIB/PILIHAN",
      sortable: false,
      width: "150px",
      render: (item) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600 dark:text-gray-400">Wajib:</span>
            <span className="font-semibold text-green-600">{item.jmlh_sks_wajib || 0} SKS</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600 dark:text-gray-400">Pilihan:</span>
            <span className="font-semibold text-orange-600">{item.jmlh_sks_pilihan || 0} SKS</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      sortable: false,
      width: "110px",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={item.a_periode_aktif === 1 ? "success" : "default"}
            className="text-xs"
          >
            {item.a_periode_aktif === 1 ? "Aktif" : "Non-Aktif"}
          </Chip>
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      width: "130px",
      render: (item) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchQuery}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari nama kurikulum..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              {/* Filter dropdown */}
              <div className="flex-1">
                <Select
                  aria-label="Filter Prodi"
                  placeholder="Semua Prodi"
                  selectedKeys={filterProdi ? [filterProdi] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterProdi(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[400px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                  renderValue={(items) => {
                    if (!items || items.length === 0) return <span className="text-[10px]">Semua Prodi</span>;
                    const item = items[0];
                    const prodi = prodiOptions.find(p => p.id_sms === item.key);
                    if (!prodi) return <span className="text-[10px]">Semua Prodi</span>;
                    return (
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-semibold text-blue-600 text-[10px] flex-shrink-0">{prodi.nm_jenj_didik}</span>
                        <span className="text-gray-400 text-[10px]">-</span>
                        <span className="truncate text-[10px]">{prodi.nama_prodi}</span>
                      </div>
                    );
                  }}
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi.id_sms} textValue={`${prodi.nm_jenj_didik} - ${prodi.nama_prodi}`}>
                      <div className="flex items-center gap-2 py-1">
                        <span className="font-semibold text-blue-600 text-xs flex-shrink-0 min-w-[30px]">{prodi.nm_jenj_didik}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{prodi.nama_prodi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Reset filter button */}
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterProdi("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterProdi === ""}
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          }
        />
      </motion.div>

      {/* Modal untuk menampilkan list matkul */}
      <Modal
        isOpen={showMatkulModal}
        onOpenChange={setShowMatkulModal}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-800",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <FiBook className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Daftar Mata Kuliah
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal line-clamp-1">
                      {selectedKurikulum?.nm_kurikulum_sp}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-4">
                {/* Search box */}
                <div className="mb-4">
                  <Input
                    placeholder="Cari nama atau kode mata kuliah..."
                    value={matkulSearch}
                    onValueChange={handleMatkulSearch}
                    startContent={<FiSearch className="text-gray-400" />}
                    classNames={{
                      base: "w-full",
                      input: "text-sm",
                      inputWrapper: "h-10",
                    }}
                  />
                </div>

                {/* Matkul list */}
                {matkulLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : matkulList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {matkulSearch ? "Tidak ada mata kuliah yang sesuai pencarian" : "Tidak ada mata kuliah"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {matkulList.map((matkul, index) => (
                      <div
                        key={matkul.id_mk || index}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {matkul.kode_mk && (
                                <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                                  {matkul.kode_mk}
                                </span>
                              )}
                              {matkul.a_wajib === 1 && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs">
                                  Wajib
                                </Chip>
                              )}
                              {matkul.a_wajib === 0 && (
                                <Chip size="sm" color="warning" variant="flat" className="text-xs">
                                  Pilihan
                                </Chip>
                              )}
                              {matkul.smt && (
                                <span className="text-xs text-gray-500">
                                  Semester {matkul.smt}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {matkul.nm_mk || "Nama tidak tersedia"}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                              {matkul.sks_mk !== undefined && matkul.sks_mk !== null && (
                                <span>Total: {matkul.sks_mk} SKS</span>
                              )}
                              {matkul.sks_tm !== undefined && matkul.sks_tm !== null && matkul.sks_tm > 0 && (
                                <span>Tatap Muka: {matkul.sks_tm} SKS</span>
                              )}
                              {matkul.sks_prak !== undefined && matkul.sks_prak !== null && matkul.sks_prak > 0 && (
                                <span>Praktek: {matkul.sks_prak} SKS</span>
                              )}
                              {matkul.sks_prak_lap !== undefined && matkul.sks_prak_lap !== null && matkul.sks_prak_lap > 0 && (
                                <span>Praktek Lapangan: {matkul.sks_prak_lap} SKS</span>
                              )}
                              {matkul.sks_sim !== undefined && matkul.sks_sim !== null && matkul.sks_sim > 0 && (
                                <span>Simulasi: {matkul.sks_sim} SKS</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  color="primary"
                  variant="light"
                  onPress={onClose}
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
