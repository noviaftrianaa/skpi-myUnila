"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip, Select, SelectItem, Button, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter,
} from "@heroui/react";
import { keuanganClient } from "@/lib/api/keuanganClient";
import {
  FiUser, FiCalendar, FiDollarSign, FiFileText, FiX,
} from "react-icons/fi";

interface SppMhsItem {
  id_spp_mhs: string;
  id_smt: string;
  npm: string;
  nama_mahasiswa: string;
  nama_prodi: string;
  tgl_bayar: string;
  nominal: number;
  total_tagihan: number;
  jumlah_spi: number;
  jumlah_denda: number;
  jumlah_lainnya: number;
  sisa_tagihan: number;
  a_cicil: number;
  cicilan_ke: number;
  kode_pembayaran: string;
  nama_kelas_ukt?: string | null;
  nominal_ukt?: number | null;
  flag_by: string;
  last_sync: string;
}

interface SemesterOption {
  id_smt: string;
  nm_smt: string;
}

interface KeuanganSppMhsTableProps {
  onSemesterChange?: (idSmt: string) => void;
}

export default function KeuanganSppMhsTable({ onSemesterChange }: KeuanganSppMhsTableProps) {
  const [data, setData] = useState<SppMhsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterIdSmt, setFilterIdSmt] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Detail modal
  const [selectedItem, setSelectedItem] = useState<SppMhsItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const response = await keuanganClient.get('/spp-mhs/semesters/all');
        if (response.data.success) setSemesters(response.data.data || []);
      } catch (error) {
        console.error('Error loading semesters:', error);
      }
    };
    loadSemesters();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          _t: Date.now().toString(),
        });
        if (searchQuery) params.append("search", searchQuery);
        if (filterIdSmt) params.append("id_smt", filterIdSmt);
        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await keuanganClient.get(`/spp-mhs?${params.toString()}`);
        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading spp mhs:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterIdSmt, sortBy, sortOrder]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "-"; }
  };

  const handleRowClick = (item: SppMhsItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const columns: Column<SppMhsItem>[] = [
    {
      key: "nama_mahasiswa",
      label: "MAHASISWA",
      sortable: true,
      render: (item) => (
        <div
          className="max-w-md cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(item)}
        >
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_mahasiswa}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {item.npm}
          </div>
        </div>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
            {item.nama_prodi}
          </div>
        </div>
      ),
    },
    {
      key: "id_smt",
      label: "SEMESTER",
      sortable: true,
      width: "100px",
      render: (item) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">{item.id_smt}</span>
        </div>
      ),
    },
    {
      key: "nominal",
      label: "NOMINAL",
      sortable: true,
      width: "140px",
      render: (item) => (
        <div className="text-right">
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(item.nominal)}
          </div>
        </div>
      ),
    },
    {
      key: "total_tagihan",
      label: "TOTAL TAGIHAN",
      sortable: true,
      width: "140px",
      render: (item) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {item.total_tagihan ? formatCurrency(item.total_tagihan) : "-"}
          </div>
          {item.sisa_tagihan > 0 && (
            <div className="text-xs text-red-500 mt-0.5">
              Sisa: {formatCurrency(item.sisa_tagihan)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "flag_by",
      label: "STATUS",
      sortable: false,
      width: "100px",
      render: (item) => (
        <div className="text-center">
          <Chip
            size="sm"
            variant="flat"
            color={item.flag_by === "LUNAS" ? "success" : "warning"}
            className="font-semibold"
          >
            {item.flag_by || "-"}
          </Chip>
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "SYNC",
      sortable: true,
      width: "100px",
      render: (item) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <>
      <motion.div
        className="w-full"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
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
            searchPlaceholder="Cari nama/NPM mahasiswa..."
            defaultRowsPerPage={10}
            filterSlot={
              <div className="flex flex-wrap gap-2 w-full">
                <div className="flex-shrink-0 w-[200px]">
                  <Select
                    aria-label="Filter Semester"
                    placeholder="Pilih Semester"
                    selectedKeys={filterIdSmt ? [filterIdSmt] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFilterIdSmt(selected || "");
                      setCurrentPage(1);
                      onSemesterChange?.(selected || "");
                    }}
                    classNames={{
                      base: "w-full",
                      trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 shadow-sm",
                      value: "text-[10px] font-medium",
                      popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[200px]",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    {semesters.map((s) => (
                      <SelectItem key={s.id_smt}>
                        {s.nm_smt || s.id_smt}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => { setFilterIdSmt(""); setCurrentPage(1); onSemesterChange?.(""); }}
                    className="h-10 px-3 text-[10px]"
                    isDisabled={!filterIdSmt}
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            }
          />
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedItem && (
            <>
              <ModalHeader className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {selectedItem.nama_mahasiswa || "Detail Pembayaran"}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono font-normal">{selectedItem.npm}</p>
                </div>
              </ModalHeader>

              <ModalBody className="py-5">
                <div className="space-y-6">

                  {/* Info Mahasiswa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard label="Program Studi" value={selectedItem.nama_prodi || "-"} icon={<FiFileText className="w-4 h-4" />} />
                    <InfoCard label="Semester" value={selectedItem.id_smt} icon={<FiCalendar className="w-4 h-4" />} />
                    <InfoCard
                      label="Kelas UKT"
                      value={selectedItem.nama_kelas_ukt || "-"}
                    />
                    <InfoCard
                      label="Status Bayar"
                      value={selectedItem.flag_by || "-"}
                      valueColor={selectedItem.flag_by === "LUNAS" ? "text-green-600" : "text-amber-600"}
                    />
                  </div>

                  {/* Rincian Biaya */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Rincian Biaya
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <DetailRow label="Nominal UKT" value={formatCurrency(selectedItem.nominal)} bold />
                          <DetailRow label="Total Tagihan" value={formatCurrency(selectedItem.total_tagihan)} />
                          <DetailRow label="Jumlah SPI" value={formatCurrency(selectedItem.jumlah_spi || 0)} />
                          <DetailRow
                            label="Denda"
                            value={formatCurrency(selectedItem.jumlah_denda || 0)}
                            valueColor={selectedItem.jumlah_denda > 0 ? "text-red-500 font-semibold" : undefined}
                          />
                          <DetailRow label="Biaya Lainnya" value={formatCurrency(selectedItem.jumlah_lainnya || 0)} />
                          <DetailRow
                            label="Sisa Tagihan"
                            value={formatCurrency(selectedItem.sisa_tagihan || 0)}
                            valueColor={selectedItem.sisa_tagihan > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}
                            bold
                          />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Info Tambahan */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Info Tambahan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoItem label="Cicilan" value={selectedItem.a_cicil ? `Ya (ke-${selectedItem.cicilan_ke})` : "Tidak"} />
                      <InfoItem label="Kode Pembayaran" value={selectedItem.kode_pembayaran || "-"} />
                      <InfoItem label="Tgl Bayar" value={formatDate(selectedItem.tgl_bayar)} />
                      <InfoItem label="Last Sync" value={formatDate(selectedItem.last_sync)} />
                    </div>
                  </div>

                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button variant="flat" onPress={() => setShowDetailModal(false)}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

// Helper components
function InfoCard({ label, value, icon, valueColor }: {
  label: string; value: string; icon?: React.ReactNode; valueColor?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueColor || "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  );
}

function DetailRow({ label, value, valueColor, bold }: {
  label: string; value: string; valueColor?: string; bold?: boolean;
}) {
  return (
    <tr className="border-b border-gray-200/50 dark:border-gray-700/50 last:border-0">
      <td className={`px-4 py-2.5 text-gray-600 dark:text-gray-400 ${bold ? "font-semibold" : ""}`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${valueColor || "text-gray-900 dark:text-white"} ${bold ? "font-bold text-base" : ""}`}>
        {value}
      </td>
    </tr>
  );
}
