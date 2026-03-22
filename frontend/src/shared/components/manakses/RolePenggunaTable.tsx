"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiSearch } from "react-icons/fi";
import { rolePenggunaService, type RolePengguna, type RolePenggunaCreateData } from "@/lib/services/manakses/rolePenggunaService";
import { peranService, type Peran } from "@/lib/services/manakses/peranService";
import { unitOrganisasiService, type UnitOrganisasiOption } from "@/lib/services/manakses/unitOrganisasiService";
import { toast } from "react-hot-toast";

export default function RolePenggunaTable() {
  const [data, setData] = useState<RolePengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterPeran, setFilterPeran] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tgl_create");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dropdown options
  const [peranOptions, setPeranOptions] = useState<Peran[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOrganisasiOption[]>([]);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [unitSearchLoading, setUnitSearchLoading] = useState(false);
  const unitSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<RolePengguna | null>(null);
  const [formData, setFormData] = useState<RolePenggunaCreateData>({
    id_pengguna: "",
    id_peran: 0,
    id_organisasi: null,
    sk_penugasan: null,
    tgl_sk_penugasan: null,
    approval_peran: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [peranResult, unitData] = await Promise.all([
          peranService.getList({ limit: 100 }),
          unitOrganisasiService.getAll({ limit: 50 }),
        ]);
        setPeranOptions(peranResult.data);
        setUnitOptions(unitData);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  // Search unit organisasi with debounce
  const searchUnitOrganisasi = useCallback(async (query: string) => {
    if (unitSearchTimeout.current) {
      clearTimeout(unitSearchTimeout.current);
    }

    if (!query.trim()) {
      // Load default data when search is empty
      setUnitSearchLoading(true);
      try {
        const unitData = await unitOrganisasiService.getAll({ limit: 50 });
        setUnitOptions(unitData);
      } catch (error) {
        console.error('Error loading unit options:', error);
      } finally {
        setUnitSearchLoading(false);
      }
      return;
    }

    unitSearchTimeout.current = setTimeout(async () => {
      setUnitSearchLoading(true);
      try {
        const unitData = await unitOrganisasiService.getAll({ search: query, limit: 50 });
        setUnitOptions(unitData);
      } catch (error) {
        console.error('Error searching unit organisasi:', error);
      } finally {
        setUnitSearchLoading(false);
      }
    }, 300);
  }, []);

  // Handle unit search input change
  const handleUnitSearchChange = (value: string) => {
    setUnitSearchQuery(value);
    searchUnitOrganisasi(value);
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await rolePenggunaService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
          sort_by: sortBy as 'nm_pengguna' | 'username' | 'nm_peran' | 'nm_organisasi' | 'sk_penugasan' | 'tgl_sk_penugasan' | 'last_active' | 'tgl_create' | 'last_update',
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading role pengguna:', error);
        toast.error('Gagal memuat data role pengguna', {
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterPeran, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const handleAdd = () => {
    setFormData({
      id_pengguna: "",
      id_peran: 0,
      id_organisasi: null,
      sk_penugasan: null,
      tgl_sk_penugasan: null,
      approval_peran: false,
    });
    onAddOpen();
  };

  const handleEdit = (item: RolePengguna) => {
    setSelectedItem(item);
    setFormData({
      id_pengguna: item.id_pengguna,
      id_peran: item.id_peran,
      id_organisasi: item.id_organisasi,
      sk_penugasan: item.sk_penugasan,
      tgl_sk_penugasan: item.tgl_sk_penugasan,
      approval_peran: item.approval_peran,
    });
    onEditOpen();
  };

  const handleDelete = (item: RolePengguna) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleSubmitAdd = async () => {
    if (!formData.id_pengguna.trim()) {
      toast.error('ID Pengguna harus diisi', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
      return;
    }
    if (!formData.id_peran) {
      toast.error('Peran harus dipilih', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await rolePenggunaService.create(formData);
      toast.success('Role pengguna berhasil ditambahkan', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      });
      onAddClose();
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('Error creating role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan role pengguna';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem) return;
    if (!formData.id_peran) {
      toast.error('Peran harus dipilih', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await rolePenggunaService.update(selectedItem.id_role_pengguna, {
        id_peran: formData.id_peran,
        id_organisasi: formData.id_organisasi,
        sk_penugasan: formData.sk_penugasan,
        tgl_sk_penugasan: formData.tgl_sk_penugasan,
        approval_peran: formData.approval_peran,
      });
      toast.success('Role pengguna berhasil diperbarui', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      });
      onEditClose();
      // Reload data
      const response = await rolePenggunaService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error('Error updating role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui role pengguna';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await rolePenggunaService.delete(selectedItem.id_role_pengguna);
      toast.success('Role pengguna berhasil dihapus', {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      });
      onDeleteClose();
      // Reload data
      const response = await rolePenggunaService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error: unknown) {
      console.error('Error deleting role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus role pengguna';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<RolePengguna>[] = [
    {
      key: "nm_pengguna",
      label: "PENGGUNA",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_pengguna}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.username}
          </div>
        </div>
      ),
    },
    {
      key: "nm_peran",
      label: "PERAN",
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary">
          {item.nm_peran}
        </Chip>
      ),
    },
    {
      key: "nm_organisasi",
      label: "ORGANISASI",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
          {item.nm_organisasi || "-"}
        </div>
      ),
    },
    {
      key: "sk_penugasan",
      label: "SK PENUGASAN",
      render: (item) => (
        <div className="text-sm">
          {item.sk_penugasan ? (
            <>
              <div className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{item.sk_penugasan}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.tgl_sk_penugasan)}</div>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "approval_peran",
      label: "APPROVAL",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.approval_peran ? "success" : "warning"}
        >
          {item.approval_peran ? "Approved" : "Pending"}
        </Chip>
      ),
    },
    {
      key: "last_active",
      label: "AKTIVITAS TERAKHIR",
      align: "center",
      width: "130px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_active)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "100px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Aksi"
            className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg"
          >
            <DropdownItem
              key="edit"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => handleEdit(item)}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => handleDelete(item)}
              color="danger"
              className="text-danger"
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  // Calculate total from all peran
  const totalAllPengguna = peranOptions.reduce((sum, p) => sum + (p.jumlah_pengguna || 0), 0);

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        aria-label="Filter Peran"
        placeholder="Semua Peran"
        selectedKeys={[filterPeran]}
        onChange={(e) => {
          setFilterPeran(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-44",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Peran";
          const item = items[0];
          if (item.key === "all") return "Semua Peran";
          return item.textValue || "Semua Peran";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Peran">
          <span className="text-sm">Semua Peran ({totalAllPengguna})</span>
        </SelectItem>
        {peranOptions.map((peran) => (
          <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)} textValue={peran.nm_peran}>
            <span className="text-sm">{peran.nm_peran} ({peran.jumlah_pengguna || 0})</span>
          </SelectItem>
        ))}
      </Select>
    </div>
  );

  // Action slot with Add button (right side)
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAdd}
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah Data
    </Button>
  );

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable={true}
            searchKeys={["nm_pengguna", "username", "nm_peran"]}
            searchPlaceholder="Cari pengguna internal portal..."
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            loading={loading}
            serverSide={true}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
            onSortChange={handleSortChange}
            filterSlot={filterSlot}
            actionSlot={actionSlot}
            className="shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={onAddClose}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Role Pengguna</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">Assign peran ke pengguna</p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Data Pengguna Section */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Data Pengguna
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      ID Pengguna <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Masukkan ID pengguna (UUID)"
                      value={formData.id_pengguna}
                      onChange={(e) => setFormData({ ...formData, id_pengguna: e.target.value })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Peran <span className="text-red-500">*</span>
                    </label>
                    <Select
                      aria-label="Pilih Peran"
                      placeholder="Pilih peran"
                      selectedKeys={formData.id_peran ? [String(formData.id_peran)] : []}
                      onChange={(e) => setFormData({ ...formData, id_peran: parseInt(e.target.value) })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                      }}
                    >
                      {peranOptions.map((peran) => (
                        <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
                          {peran.nm_peran}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Unit Organisasi
                    </label>
                    {/* Search Input for Unit */}
                    <div className="relative mb-2">
                      <Input
                        placeholder="Cari unit organisasi..."
                        value={unitSearchQuery}
                        onChange={(e) => handleUnitSearchChange(e.target.value)}
                        variant="bordered"
                        size="sm"
                        startContent={<FiSearch className="text-gray-400" />}
                        endContent={unitSearchLoading && <Spinner size="sm" />}
                        classNames={{
                          input: "text-gray-900 dark:text-white",
                          inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        }}
                      />
                    </div>
                    <Select
                      aria-label="Pilih Unit Organisasi"
                      placeholder="Pilih unit organisasi (opsional)"
                      selectedKeys={formData.id_organisasi ? [formData.id_organisasi] : []}
                      onChange={(e) => setFormData({ ...formData, id_organisasi: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg max-h-60",
                      }}
                      renderValue={(items) => {
                        if (!items || items.length === 0) return "Pilih unit organisasi (opsional)";
                        const selectedUnit = unitOptions.find(u => u.id_organisasi === items[0].key);
                        if (selectedUnit) {
                          return selectedUnit.display_name || selectedUnit.nm_lemb;
                        }
                        return items[0].textValue;
                      }}
                    >
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit.id_organisasi} value={unit.id_organisasi} textValue={unit.display_name || unit.nm_lemb}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{unit.nm_lemb}</span>
                            {(unit.nm_jns_lemb || unit.jenjang) && (
                              <span className="text-xs text-gray-500">
                                {unit.nm_jns_lemb}{unit.jenjang ? ` - ${unit.jenjang}` : ''}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ketik untuk mencari unit organisasi
                    </p>
                  </div>
                </div>
              </div>

              {/* SK Penugasan Section */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  SK Penugasan
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      No. SK Penugasan
                    </label>
                    <Input
                      placeholder="SK/001/2024"
                      value={formData.sk_penugasan || ""}
                      onChange={(e) => setFormData({ ...formData, sk_penugasan: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tanggal SK
                    </label>
                    <Input
                      type="date"
                      value={formData.tgl_sk_penugasan || ""}
                      onChange={(e) => setFormData({ ...formData, tgl_sk_penugasan: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Status Approval
                </h4>
                <label
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.approval_peran
                      ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.approval_peran}
                    onChange={(e) => setFormData({ ...formData, approval_peran: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Approval Peran</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Setujui role pengguna ini langsung aktif
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onAddClose} className="font-medium">Batal</Button>
            <Button
              color="primary"
              onPress={handleSubmitAdd}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Role Pengguna</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">Perbarui assignment peran pengguna</p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Data Pengguna Section */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Data Pengguna
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Pengguna
                    </label>
                    <Input
                      value={selectedItem?.nm_pengguna || ""}
                      isReadOnly
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50",
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Peran <span className="text-red-500">*</span>
                    </label>
                    <Select
                      aria-label="Pilih Peran"
                      placeholder="Pilih peran"
                      selectedKeys={formData.id_peran ? [String(formData.id_peran)] : []}
                      onChange={(e) => setFormData({ ...formData, id_peran: parseInt(e.target.value) })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                      }}
                    >
                      {peranOptions.map((peran) => (
                        <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
                          {peran.nm_peran}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Unit Organisasi
                    </label>
                    {/* Search Input for Unit */}
                    <div className="relative mb-2">
                      <Input
                        placeholder="Cari unit organisasi..."
                        value={unitSearchQuery}
                        onChange={(e) => handleUnitSearchChange(e.target.value)}
                        variant="bordered"
                        size="sm"
                        startContent={<FiSearch className="text-gray-400" />}
                        endContent={unitSearchLoading && <Spinner size="sm" />}
                        classNames={{
                          input: "text-gray-900 dark:text-white",
                          inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        }}
                      />
                    </div>
                    <Select
                      aria-label="Pilih Unit Organisasi"
                      placeholder="Pilih unit organisasi (opsional)"
                      selectedKeys={formData.id_organisasi ? [formData.id_organisasi] : []}
                      onChange={(e) => setFormData({ ...formData, id_organisasi: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg max-h-60",
                      }}
                      renderValue={(items) => {
                        if (!items || items.length === 0) return "Pilih unit organisasi (opsional)";
                        const selectedUnit = unitOptions.find(u => u.id_organisasi === items[0].key);
                        if (selectedUnit) {
                          return selectedUnit.display_name || selectedUnit.nm_lemb;
                        }
                        return items[0].textValue;
                      }}
                    >
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit.id_organisasi} value={unit.id_organisasi} textValue={unit.display_name || unit.nm_lemb}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{unit.nm_lemb}</span>
                            {(unit.nm_jns_lemb || unit.jenjang) && (
                              <span className="text-xs text-gray-500">
                                {unit.nm_jns_lemb}{unit.jenjang ? ` - ${unit.jenjang}` : ''}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ketik untuk mencari unit organisasi
                    </p>
                  </div>
                </div>
              </div>

              {/* SK Penugasan Section */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  SK Penugasan
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      No. SK Penugasan
                    </label>
                    <Input
                      placeholder="SK/001/2024"
                      value={formData.sk_penugasan || ""}
                      onChange={(e) => setFormData({ ...formData, sk_penugasan: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tanggal SK
                    </label>
                    <Input
                      type="date"
                      value={formData.tgl_sk_penugasan || ""}
                      onChange={(e) => setFormData({ ...formData, tgl_sk_penugasan: e.target.value || null })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Status Approval
                </h4>
                <label
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.approval_peran
                      ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.approval_peran}
                    onChange={(e) => setFormData({ ...formData, approval_peran: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Approval Peran</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Setujui role pengguna ini langsung aktif
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onEditClose} className="font-medium">Batal</Button>
            <Button
              color="primary"
              onPress={handleSubmitEdit}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-gray-900 dark:text-white">Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p className="text-gray-700 dark:text-gray-300">Apakah Anda yakin ingin menghapus role <strong>{selectedItem?.nm_peran}</strong> dari pengguna <strong>{selectedItem?.nm_pengguna}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>Batal</Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
