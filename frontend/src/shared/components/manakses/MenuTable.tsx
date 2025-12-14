"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiEyeOff, FiFolder, FiFile } from "react-icons/fi";
import {
  menuService,
  type Menu,
  type MenuStats,
  type CreateMenuRequest,
  type UpdateMenuRequest,
} from "@/lib/services/manakses/menuService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { toast } from "react-hot-toast";

// Extended Menu type with nm_aplikasi
interface MenuWithAplikasi extends Menu {
  nm_aplikasi?: string;
  parent_menu_name?: string;
}

interface MenuTableProps {
  onStatsLoaded?: (stats: MenuStats) => void;
}

export default function MenuTable({ onStatsLoaded }: MenuTableProps) {
  const [data, setData] = useState<MenuWithAplikasi[]>([]);
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAplikasi, setFilterAplikasi] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState<string>("nm_aplikasi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown options
  const [aplikasiOptions, setAplikasiOptions] = useState<Aplikasi[]>([]);
  const [parentMenuOptions, setParentMenuOptions] = useState<Menu[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuWithAplikasi | null>(null);
  const [formData, setFormData] = useState<CreateMenuRequest>({
    id_aplikasi: "",
    nm_menu: "",
    nm_file: "",
    icon: "",
    urutan_menu: 1,
    a_aktif: true,
    a_tampil: true,
    level_menu: 0,
    id_group_menu: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for callback
  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;

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
        const aplikasiData = await aplikasiService.getList({ limit: 100 });
        setAplikasiOptions(aplikasiData.data);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    };
    loadOptions();
  }, []);

  // Load stats on mount and when filter changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        const idAplikasi = filterAplikasi !== "all" ? filterAplikasi : undefined;
        const statsData = await menuService.getStats(idAplikasi);
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    loadStats();
  }, [filterAplikasi]);

  // Load parent menus when aplikasi changes in form
  useEffect(() => {
    const loadParentMenus = async () => {
      if (!formData.id_aplikasi) {
        setParentMenuOptions([]);
        return;
      }
      try {
        const result = await menuService.getByAplikasi(formData.id_aplikasi, "flat");
        // Filter only level 0 and 1 as potential parents
        const parents = result.menus.filter(m => (m.level_menu ?? 0) < 2);
        setParentMenuOptions(parents);
      } catch (error) {
        console.error("Error loading parent menus:", error);
        setParentMenuOptions([]);
      }
    };
    loadParentMenus();
  }, [formData.id_aplikasi]);

  // Load data when filters/pagination change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await menuService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
          a_aktif: filterStatus !== "all" ? (filterStatus === "aktif" ? "1" : "0") : undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        // Convert string booleans to actual booleans
        const menus = result.data.map(m => ({
          ...m,
          a_aktif: m.a_aktif === true || m.a_aktif === "1" || (m.a_aktif as unknown) === 1,
          a_tampil: m.a_tampil === true || m.a_tampil === "1" || (m.a_tampil as unknown) === 1,
          level_menu: m.level_menu !== null ? Number(m.level_menu) : 0,
          urutan_menu: Number(m.urutan_menu) || 0,
        }));

        setData(menus as MenuWithAplikasi[]);
        setTotalRecords(result.total);
      } catch (error) {
        console.error("Error loading menus:", error);
        toast.error("Gagal memuat data menu", {
          duration: 4000,
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterAplikasi, filterStatus, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  const columns: Column<MenuWithAplikasi>[] = [
    {
      key: "nm_aplikasi",
      label: "APLIKASI",
      sortable: true,
      width: "180px",
      render: (item) => (
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {item.nm_aplikasi || "-"}
        </span>
      ),
    },
    {
      key: "nm_menu",
      label: "NAMA MENU",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {(item.level_menu ?? 0) > 0 ? (
            <FiFile className="w-4 h-4 text-gray-400" />
          ) : (
            <FiFolder className="w-4 h-4 text-indigo-500" />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{item.nm_menu}</div>
            {item.nm_file && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.nm_file}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "level_menu",
      label: "LEVEL",
      sortable: true,
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            (item.level_menu ?? 0) === 0 ? "primary" :
            (item.level_menu ?? 0) === 1 ? "secondary" : "default"
          }
        >
          Level {item.level_menu ?? 0}
        </Chip>
      ),
    },
    {
      key: "urutan_menu",
      label: "URUTAN",
      sortable: true,
      align: "center",
      width: "90px",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
          #{item.urutan_menu}
        </span>
      ),
    },
    {
      key: "icon",
      label: "ICON",
      width: "150px",
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[140px] block">
          {item.icon || "-"}
        </span>
      ),
    },
    {
      key: "a_aktif",
      label: "STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Chip
            size="sm"
            variant="flat"
            color={item.a_aktif ? "success" : "danger"}
          >
            {item.a_aktif ? "Aktif" : "Nonaktif"}
          </Chip>
          <Tooltip content={item.a_tampil ? "Tampil di Sidebar" : "Tersembunyi"}>
            {item.a_tampil ? (
              <FiEye className="w-4 h-4 text-blue-500" />
            ) : (
              <FiEyeOff className="w-4 h-4 text-gray-400" />
            )}
          </Tooltip>
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "80px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700"
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
              className="text-gray-700 dark:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => handleDeleteClick(item)}
              className="text-danger"
              color="danger"
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  const handleEdit = (item: MenuWithAplikasi) => {
    setSelectedItem(item);
    setFormData({
      id_aplikasi: item.id_aplikasi,
      nm_menu: item.nm_menu,
      nm_file: item.nm_file || "",
      icon: item.icon || "",
      urutan_menu: item.urutan_menu,
      a_aktif: item.a_aktif,
      a_tampil: item.a_tampil,
      level_menu: item.level_menu ?? 0,
      id_group_menu: item.id_group_menu || null,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item: MenuWithAplikasi) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : "",
      nm_menu: "",
      nm_file: "",
      icon: "",
      urutan_menu: 1,
      a_aktif: true,
      a_tampil: true,
      level_menu: 0,
      id_group_menu: null,
    });
    setIsAddModalOpen(true);
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      const result = await menuService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
        a_aktif: filterStatus !== "all" ? (filterStatus === "aktif" ? "1" : "0") : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const menus = result.data.map(m => ({
        ...m,
        a_aktif: m.a_aktif === true || m.a_aktif === "1" || (m.a_aktif as unknown) === 1,
        a_tampil: m.a_tampil === true || m.a_tampil === "1" || (m.a_tampil as unknown) === 1,
        level_menu: m.level_menu !== null ? Number(m.level_menu) : 0,
        urutan_menu: Number(m.urutan_menu) || 0,
      }));

      setData(menus as MenuWithAplikasi[]);
      setTotalRecords(result.total);

      // Reload stats
      const idAplikasi = filterAplikasi !== "all" ? filterAplikasi : undefined;
      const statsData = await menuService.getStats(idAplikasi);
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async () => {
    if (!formData.id_aplikasi) {
      toast.error("Aplikasi harus dipilih", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    if (!formData.nm_menu) {
      toast.error("Nama Menu harus diisi", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await menuService.create(formData);
      toast.success("Menu berhasil ditambahkan", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsAddModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error creating menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menambahkan menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_menu) {
      toast.error("Nama Menu harus diisi", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateMenuRequest = {
        nm_menu: formData.nm_menu,
        nm_file: formData.nm_file || null,
        icon: formData.icon || null,
        urutan_menu: formData.urutan_menu,
        a_aktif: formData.a_aktif,
        a_tampil: formData.a_tampil,
        level_menu: formData.level_menu,
        id_group_menu: formData.id_group_menu,
      };
      await menuService.update(selectedItem.id_menu, updateData);
      toast.success("Menu berhasil diperbarui", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsEditModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error updating menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memperbarui menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await menuService.delete(selectedItem.id_menu);
      toast.success("Menu berhasil dihapus", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsDeleteModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error deleting menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        aria-label="Filter Aplikasi"
        placeholder="Semua Aplikasi"
        selectedKeys={[filterAplikasi]}
        onChange={(e) => {
          setFilterAplikasi(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-52",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Aplikasi";
          const item = items[0];
          if (item.key === "all") return "Semua Aplikasi";
          return item.textValue || "Semua Aplikasi";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Aplikasi">
          <span className="text-sm">Semua Aplikasi</span>
        </SelectItem>
        {aplikasiOptions.map((app) => (
          <SelectItem key={app.id_aplikasi} value={app.id_aplikasi} textValue={app.nm_aplikasi}>
            <span className="text-sm">{app.nm_aplikasi}</span>
          </SelectItem>
        ))}
      </Select>
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-36",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all">Semua Status</SelectItem>
        <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
        <SelectItem key="nonaktif" value="nonaktif">Nonaktif</SelectItem>
      </Select>
    </div>
  );

  // Action slot with Add button
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAddNew}
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah Menu
    </Button>
  );

  // Form modal content
  const renderFormContent = () => (
    <div className="space-y-5">
      {/* Aplikasi Selection - only for add */}
      {!selectedItem && (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pilih Aplikasi
          </h4>
          <Select
            aria-label="Pilih Aplikasi"
            placeholder="Pilih aplikasi"
            selectedKeys={formData.id_aplikasi ? [formData.id_aplikasi] : []}
            onChange={(e) => setFormData({ ...formData, id_aplikasi: e.target.value, id_group_menu: null })}
            variant="bordered"
            size="sm"
            classNames={{
              trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
              value: "text-gray-900 dark:text-white",
              popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
            }}
          >
            {aplikasiOptions.map((app) => (
              <SelectItem key={app.id_aplikasi} value={app.id_aplikasi}>
                {app.nm_aplikasi}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Menu Info Section */}
      <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Informasi Menu
        </h4>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Masukkan nama menu"
              value={formData.nm_menu}
              onValueChange={(value) => setFormData({ ...formData, nm_menu: value })}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              URL / Path
            </label>
            <Input
              placeholder="/dashboard/example"
              value={formData.nm_file || ""}
              onValueChange={(value) => setFormData({ ...formData, nm_file: value })}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white font-mono",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Icon
            </label>
            <Input
              placeholder="heroicons:home"
              value={formData.icon || ""}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white font-mono",
              }}
            />
          </div>
        </div>
      </div>

      {/* Hierarchy Section */}
      <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Hierarki & Urutan
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Parent Menu
            </label>
            <Select
              aria-label="Pilih Parent Menu"
              placeholder="Tidak ada (Root)"
              selectedKeys={formData.id_group_menu ? [formData.id_group_menu] : []}
              onChange={(e) => {
                const value = e.target.value || null;
                const parentMenu = parentMenuOptions.find(m => m.id_menu === value);
                setFormData({
                  ...formData,
                  id_group_menu: value,
                  level_menu: parentMenu ? (parentMenu.level_menu ?? 0) + 1 : 0,
                });
              }}
              isDisabled={!formData.id_aplikasi}
              variant="bordered"
              size="sm"
              classNames={{
                trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                value: "text-gray-900 dark:text-white",
                popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
              }}
            >
              {parentMenuOptions.map((menu) => (
                <SelectItem key={menu.id_menu} value={menu.id_menu}>
                  <span className="text-xs text-gray-400 mr-2">L{menu.level_menu ?? 0}</span>
                  {menu.nm_menu}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Urutan
            </label>
            <Input
              type="number"
              placeholder="1"
              value={String(formData.urutan_menu || 1)}
              onValueChange={(value) => setFormData({ ...formData, urutan_menu: parseInt(value) || 1 })}
              min={1}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white",
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Status
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              formData.a_aktif
                ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.a_aktif || false}
              onChange={(e) => setFormData({ ...formData, a_aktif: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Menu Aktif</span>
          </label>
          <label
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              formData.a_tampil
                ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.a_tampil || false}
              onChange={(e) => setFormData({ ...formData, a_tampil: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Tampil di Sidebar</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable
            searchKeys={["nm_menu", "nm_file", "nm_aplikasi"]}
            searchPlaceholder="Cari nama menu, path, atau aplikasi..."
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            loading={loading}
            serverSide
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onSearchChange={(search) => {
              setSearchQuery(search);
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Tambah Menu Baru
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Isi form untuk menambah menu baru ke aplikasi
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            {renderFormContent()}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Menu
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Perbarui informasi menu
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            {renderFormContent()}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Hapus</h3>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus menu <strong>{selectedItem?.nm_menu}</strong>?
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              Perhatian: Menghapus menu parent akan menghapus semua sub-menu di bawahnya.
            </p>
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
