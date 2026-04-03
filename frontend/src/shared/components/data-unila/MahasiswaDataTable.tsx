"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip, Select, SelectItem, Button, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Divider,
} from "@heroui/react";
import {
  FiDownload, FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiBookOpen,
} from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { MdSchool } from "react-icons/md";
import mahasiswaDataService, {
  type MahasiswaItem, type MahasiswaDetail, type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";

interface MahasiswaDataTableProps {
  orgFilter?: { id_prodi?: string; id_fakultas?: string };
}

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "default" | "secondary"> = {
  Aktif: "success", Lulus: "secondary", Cuti: "warning", DO: "danger", Lainnya: "default",
};

export default function MahasiswaDataTable({ orgFilter }: MahasiswaDataTableProps) {
  const [data, setData] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("nm_pd");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filters
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterFakultas, setFilterFakultas] = useState(orgFilter?.id_fakultas || "");
  const [filterProdi, setFilterProdi] = useState(orgFilter?.id_prodi || "");
  const [filterStatus, setFilterStatus] = useState("");

  // Detail modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MahasiswaDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load filter options
  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFakultas || undefined })
      .then(setFilters).catch(console.error);
  }, [filterFakultas]);

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await mahasiswaDataService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
          id_fakultas: filterFakultas || orgFilter?.id_fakultas || undefined,
          id_prodi: filterProdi || orgFilter?.id_prodi || undefined,
          angkatan: filterAngkatan || undefined,
          status: filterStatus || undefined,
        });
        setData(result.data);
        setTotalRecords(result.total);
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat data mahasiswa", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder,
    filterAngkatan, filterFakultas, filterProdi, filterStatus, orgFilter]);

  // Handle sort
  const handleSortChange = useCallback((key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  // Open detail
  const handleRowClick = async (item: MahasiswaItem) => {
    setSelectedId(item.id_pd);
    setLoadingDetail(true);
    try {
      const d = await mahasiswaDataService.getDetail(item.id_pd);
      setDetail(d);
    } catch {
      toast.error("Gagal memuat detail");
      setSelectedId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    const url = mahasiswaDataService.getExportUrl({
      search: searchQuery || undefined,
      id_fakultas: filterFakultas || orgFilter?.id_fakultas || undefined,
      id_prodi: filterProdi || orgFilter?.id_prodi || undefined,
      angkatan: filterAngkatan || undefined,
      status: filterStatus || undefined,
    });
    window.open(url, "_blank");
  };

  const columns: Column<MahasiswaItem>[] = [
    {
      key: "nipd",
      label: "NIM",
      width: "130px",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.nipd}</span>
      ),
    },
    {
      key: "nm_pd",
      label: "NAMA MAHASISWA",
      sortable: true,
      render: (item) => (
        <div
          className="cursor-pointer hover:text-primary-600 transition-colors"
          onClick={() => handleRowClick(item)}
        >
          <div className="font-medium text-gray-900 dark:text-white">{item.nm_pd}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {item.jk === "L" ? "Laki-laki" : item.jk === "P" ? "Perempuan" : item.jk}
          </div>
        </div>
      ),
    },
    {
      key: "nm_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200">{item.nm_prodi}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.nm_fakultas}</div>
        </div>
      ),
    },
    {
      key: "angkatan",
      label: "ANGKATAN",
      width: "100px",
      sortable: true,
      align: "center" as const,
      render: (item) => (
        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{item.angkatan}</span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      width: "90px",
      align: "center" as const,
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={STATUS_COLORS[item.status] || "default"}
          className="font-semibold"
        >
          {item.status}
        </Chip>
      ),
    },
  ];

  const filterSlot = (
    <div className="flex flex-wrap gap-2 w-full">
      {/* Angkatan */}
      <Select
        aria-label="Angkatan"
        placeholder="Angkatan"
        selectedKeys={filterAngkatan ? [filterAngkatan] : []}
        onSelectionChange={(k) => { setFilterAngkatan(Array.from(k)[0] as string || ""); setCurrentPage(1); }}
        size="sm" variant="bordered"
        classNames={{ base: "w-[110px]", trigger: "h-10" }}
      >
        {(filters?.angkatan || []).map((a) => (
          <SelectItem key={a.angkatan}>{a.angkatan}</SelectItem>
        ))}
      </Select>

      {/* Fakultas (hide if org filtered to prodi) */}
      {!orgFilter?.id_prodi && (
        <Select
          aria-label="Fakultas"
          placeholder="Semua Fakultas"
          selectedKeys={filterFakultas ? [filterFakultas] : []}
          onSelectionChange={(k) => {
            setFilterFakultas(Array.from(k)[0] as string || "");
            setFilterProdi("");
            setCurrentPage(1);
          }}
          size="sm" variant="bordered"
          classNames={{ base: "w-[200px]", trigger: "h-10" }}
          isDisabled={!!orgFilter?.id_fakultas}
        >
          {(filters?.fakultas || []).map((f) => (
            <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>
          ))}
        </Select>
      )}

      {/* Prodi */}
      {!orgFilter?.id_prodi && (
        <Select
          aria-label="Prodi"
          placeholder="Semua Prodi"
          selectedKeys={filterProdi ? [filterProdi] : []}
          onSelectionChange={(k) => { setFilterProdi(Array.from(k)[0] as string || ""); setCurrentPage(1); }}
          size="sm" variant="bordered"
          classNames={{ base: "w-[220px]", trigger: "h-10" }}
        >
          {(filters?.prodi || []).map((p) => (
            <SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>
          ))}
        </Select>
      )}

      {/* Status */}
      <Select
        aria-label="Status"
        placeholder="Semua Status"
        selectedKeys={filterStatus ? [filterStatus] : []}
        onSelectionChange={(k) => { setFilterStatus(Array.from(k)[0] as string || ""); setCurrentPage(1); }}
        size="sm" variant="bordered"
        classNames={{ base: "w-[140px]", trigger: "h-10" }}
      >
        {["aktif", "lulus", "cuti", "do"].map((s) => (
          <SelectItem key={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
        ))}
      </Select>

      {/* Export */}
      <Button
        size="sm" variant="flat" color="success"
        startContent={<FiDownload className="w-4 h-4" />}
        onPress={handleExport}
        className="h-10 font-medium ml-auto"
      >
        Export CSV
      </Button>
      <Button
        size="sm" variant="flat" color="primary"
        startContent={<FiDownload className="w-4 h-4" />}
        onPress={() => exportToExcel(
          data as unknown as Record<string, unknown>[],
          `mahasiswa-${filterFakultas || 'semua'}-${filterAngkatan || 'semua'}`,
          'Mahasiswa',
          {
            nipd: 'NIM', nm_pd: 'Nama', jk: 'Jenis Kelamin',
            nm_prodi: 'Program Studi', jenjang: 'Jenjang',
            nm_fakultas: 'Fakultas', angkatan: 'Angkatan', status: 'Status',
            email: 'Email', tlpn_hp: 'No HP',
          }
        )}
        className="h-10 font-medium"
      >
        Export Excel
      </Button>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari NIM, nama, NIK..."
          defaultRowsPerPage={20}
          filterSlot={filterSlot}
        />
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedId}
        onClose={() => { setSelectedId(null); setDetail(null); }}
        size="2xl" scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <MdSchool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {loadingDetail ? "Memuat..." : detail?.nm_pd || "-"}
                </h3>
                <p className="text-sm text-gray-500 font-normal">{detail?.nipd || "-"}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : detail ? (
              <div className="space-y-5">
                {/* Status + Prodi */}
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" color={STATUS_COLORS[detail.status] || "default"} className="font-semibold">
                    {detail.status}
                  </Chip>
                  <Chip size="sm" variant="flat" color="primary">{detail.nm_prodi}</Chip>
                  <Chip size="sm" variant="flat">{detail.nm_fakultas}</Chip>
                  {detail.ipk && (
                    <Chip size="sm" variant="flat" color="success">IPK: {detail.ipk}</Chip>
                  )}
                </div>

                <Divider />

                {/* Biodata */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Biodata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: <FiUser />, label: "Jenis Kelamin", val: detail.jk === "L" ? "Laki-laki" : "Perempuan" },
                      { icon: <FiCalendar />, label: "Tgl Lahir", val: `${detail.tmpt_lahir}, ${detail.tgl_lahir}` },
                      { icon: <FiMail />, label: "Email", val: detail.email || "-" },
                      { icon: <FiPhone />, label: "No HP", val: detail.tlpn_hp || "-" },
                      { icon: <FiUser />, label: "Agama", val: detail.nm_agama || "-" },
                      { icon: <FiMapPin />, label: "Wilayah", val: detail.nm_wilayah || "-" },
                      { icon: <FiUser />, label: "Nama Ayah", val: detail.nm_ayah || "-" },
                      { icon: <FiUser />, label: "Nama Ibu", val: detail.nm_ibu || "-" },
                    ].map(({ icon, label, val }) => (
                      <div key={label} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Akademik */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Akademik</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: <FiBookOpen />, label: "Program Studi", val: `${detail.jenjang || ""} ${detail.nm_prodi}`.trim() },
                      { icon: <FiBookOpen />, label: "Fakultas", val: detail.nm_fakultas || "-" },
                      { icon: <FiCalendar />, label: "Angkatan", val: detail.angkatan || "-" },
                      { icon: <FiCalendar />, label: "Semester Masuk", val: detail.id_semester_masuk || "-" },
                      { icon: <FiUser />, label: "NIK", val: detail.nik || "-" },
                      { icon: <FiUser />, label: "NISN", val: detail.nisn || "-" },
                      ...(detail.tgl_keluar ? [{ icon: <FiCalendar />, label: "Tanggal Keluar", val: detail.tgl_keluar }] : []),
                    ].map(({ icon, label, val }) => (
                      <div key={label} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={() => { setSelectedId(null); setDetail(null); }}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
