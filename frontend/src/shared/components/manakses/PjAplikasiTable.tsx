"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, Autocomplete, AutocompleteItem, useDisclosure,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { authClient } from "@/lib/api/authClient";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiPhone, FiMail, FiMoreVertical, FiBriefcase } from "react-icons/fi";
import toast from "react-hot-toast";

interface PenggunaOption {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  no_hp: string | null;
}
interface PeranOption {
  id_peran: number;
  nm_peran: string;
}

interface PjItem {
  id_pj_aplikasi: string;
  id_pengguna: string | null;
  id_aplikasi: string;
  nm_pj: string;
  jabatan_pj: string;
  no_hp: string;
  email: string;
  a_masih: number;
  wkt_selesai: string | null;
  nm_aplikasi: string;
  nm_pengguna: string | null;
  username: string | null;
  tgl_create: string;
  last_update: string;
}

interface AppOption {
  id_aplikasi: string;
  nm_aplikasi: string;
}

const toastSuccess = (msg: string) =>
  toast.success(msg, {
    duration: 3000,
    style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#10B981" },
  });

const toastError = (msg: string) =>
  toast.error(msg, {
    duration: 4000,
    style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#EF4444" },
  });

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

export default function PjAplikasiTable() {
  const [data, setData] = useState<PjItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [apps, setApps] = useState<AppOption[]>([]);
  const [filterApp, setFilterApp] = useState("");
  const [sortBy, setSortBy] = useState<string>("nm_pj");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reloadKey, setReloadKey] = useState(0);

  // Separate modals (pattern PeranTable)
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<PjItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_aplikasi: "",
    id_pengguna: "",
    nm_pj: "",
    jabatan_pj: "",
    no_hp: "",
    email: "",
    a_masih: true,
  });

  // Autocomplete data: pengguna + peran (for jabatan dropdown)
  const [penggunaOptions, setPenggunaOptions] = useState<PenggunaOption[]>([]);
  const [penggunaSearch, setPenggunaSearch] = useState("");
  const [penggunaLoading, setPenggunaLoading] = useState(false);
  const [peranOptions, setPeranOptions] = useState<PeranOption[]>([]);
  const penggunaSearchTimerRef = useRef<number | undefined>(undefined);

  // Load peran once (fixed list, small)
  useEffect(() => {
    authClient
      .get("/manakses/peran/all")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const options = (Array.isArray(list) ? list : list?.data || [])
          .map((p: any) => ({ id_peran: p.id_peran, nm_peran: p.nm_peran }))
          .sort((a: PeranOption, b: PeranOption) => a.nm_peran.localeCompare(b.nm_peran));
        setPeranOptions(options);
      })
      .catch(() => {
        // fallback: no options
      });
  }, []);

  // Debounced pengguna search: type in autocomplete → query backend.
  // Min 3 huruf supaya server tidak kena query LIKE '%a%' yang match ribuan row.
  // Debounce 500ms supaya tidak query setiap keystroke.
  // Limit 15 rows supaya response cepat dirender.
  useEffect(() => {
    if (penggunaSearchTimerRef.current) {
      window.clearTimeout(penggunaSearchTimerRef.current);
    }
    if (penggunaSearch.length < 3) {
      setPenggunaOptions([]);
      setPenggunaLoading(false);
      return;
    }
    penggunaSearchTimerRef.current = window.setTimeout(async () => {
      setPenggunaLoading(true);
      try {
        const res = await authClient.get(
          `/manakses/pengguna?search=${encodeURIComponent(penggunaSearch)}&limit=15`
        );
        const list = res.data?.data || [];
        const arr = Array.isArray(list) ? list : list?.data || [];
        setPenggunaOptions(
          arr.map((u: any) => ({
            id_pengguna: u.id_pengguna,
            username: u.username || "",
            nm_pengguna: u.nm_pengguna || u.nama || "",
            email: u.email || null,
            no_hp: u.no_hp || null,
          }))
        );
      } catch (e) {
        console.error("Search pengguna failed:", e);
        setPenggunaOptions([]);
      } finally {
        setPenggunaLoading(false);
      }
    }, 500);

    return () => {
      if (penggunaSearchTimerRef.current) {
        window.clearTimeout(penggunaSearchTimerRef.current);
      }
    };
  }, [penggunaSearch]);

  // Handler: when user picks a pengguna, auto-fill form fields
  const handlePickPengguna = (idPengguna: string | null) => {
    if (!idPengguna) {
      setFormData((prev) => ({
        ...prev,
        id_pengguna: "",
        nm_pj: "",
        email: "",
        no_hp: "",
      }));
      return;
    }
    const pick = penggunaOptions.find((p) => p.id_pengguna === idPengguna);
    if (!pick) return;
    setFormData((prev) => ({
      ...prev,
      id_pengguna: pick.id_pengguna,
      nm_pj: pick.nm_pengguna || pick.username,
      email: pick.email || prev.email,
      no_hp: pick.no_hp || prev.no_hp,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load apps for dropdown
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await authClient.get("/manakses/aplikasi?limit=200");
        // Handle nested pagination: res.data.data.data or res.data.data (array)
        const rawData = res.data?.data;
        const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        setApps(
          list.map((a: any) => ({
            id_aplikasi: a.id_aplikasi,
            nm_aplikasi: a.nm_aplikasi,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadApps();
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
        });
        if (searchQuery) params.append("search", searchQuery);
        if (filterApp) params.append("id_aplikasi", filterApp);

        const res = await authClient.get(`/manakses/pj-aplikasi?${params}`);
        if (res.data.success) {
          setData(res.data.data || []);
          setTotalRecords(res.data.total || 0);
        }
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat data PJ Aplikasi");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterApp, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  // Sort handler
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  // Add
  const handleAdd = () => {
    setFormData({
      id_aplikasi: "",
      id_pengguna: "",
      nm_pj: "",
      jabatan_pj: "",
      no_hp: "",
      email: "",
      a_masih: true,
    });
    setPenggunaSearch("");
    setPenggunaOptions([]);
    onAddOpen();
  };

  // Edit
  const handleEdit = (item: PjItem) => {
    setSelectedItem(item);
    setFormData({
      id_aplikasi: item.id_aplikasi,
      id_pengguna: item.id_pengguna || "",
      nm_pj: item.nm_pj,
      jabatan_pj: item.jabatan_pj,
      no_hp: item.no_hp || "",
      email: item.email || "",
      a_masih: item.a_masih === 1,
    });
    // Pre-populate pengguna option so autocomplete shows current selection
    if (item.id_pengguna) {
      setPenggunaOptions([
        {
          id_pengguna: item.id_pengguna,
          username: item.username || "",
          nm_pengguna: item.nm_pengguna || item.nm_pj,
          email: item.email,
          no_hp: item.no_hp,
        },
      ]);
    } else {
      setPenggunaOptions([]);
    }
    setPenggunaSearch("");
    onEditOpen();
  };

  // Delete
  const handleDelete = (item: PjItem) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  // Submit Add
  const handleSubmitAdd = async () => {
    if (!formData.id_pengguna || !formData.jabatan_pj.trim() || !formData.email.trim() || !formData.id_aplikasi) {
      toastError("Lengkapi semua field yang wajib (Pengguna, Jabatan PJ, Email, Aplikasi)");
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.post("/manakses/pj-aplikasi", formData);
      toastSuccess("PJ berhasil ditambahkan");
      onAddClose();
      setCurrentPage(1);
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal menambahkan PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.id_pengguna || !formData.jabatan_pj.trim() || !formData.email.trim()) {
      toastError("Lengkapi semua field yang wajib (Pengguna, Jabatan PJ, Email)");
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.put(`/manakses/pj-aplikasi/${selectedItem.id_pj_aplikasi}`, formData);
      toastSuccess("PJ berhasil diperbarui");
      onEditClose();
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal memperbarui PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    const name = selectedItem.nm_pj;
    setIsSubmitting(true);
    try {
      await authClient.delete(`/manakses/pj-aplikasi/${selectedItem.id_pj_aplikasi}`);
      toastSuccess(`PJ "${name}" berhasil dihapus`);
      onDeleteClose();
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal menghapus PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<PjItem>[] = [
    {
      key: "nm_pj",
      label: "NAMA PJ",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.nm_pj}</div>
          {item.username && (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
              @{item.username}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.jabatan_pj}</div>
        </div>
      ),
    },
    {
      key: "nm_aplikasi",
      label: "APLIKASI",
      sortable: true,
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary" className="font-medium">
          {item.nm_aplikasi}
        </Chip>
      ),
    },
    {
      key: "email",
      label: "KONTAK",
      render: (item) => (
        <div className="space-y-1">
          {item.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <FiMail className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[180px]">{item.email}</span>
            </div>
          )}
          {item.no_hp && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <FiPhone className="w-3 h-3 shrink-0" />
              <span>{item.no_hp}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "a_masih",
      label: "STATUS",
      align: "center" as const,
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_masih ? "success" : "default"}
          className="font-semibold"
        >
          {item.a_masih ? "Aktif" : "Selesai"}
        </Chip>
      ),
    },
    {
      key: "tgl_create",
      label: "DIBUAT",
      width: "120px",
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.tgl_create)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      align: "center" as const,
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Aksi PJ">
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
              className="text-danger"
              color="danger"
              onPress={() => handleDelete(item)}
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  // Form fields (reusable for Add & Edit)
  const renderFormFields = (isEdit: boolean) => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Aplikasi <span className="text-red-500">*</span>
        </label>
        <Select
          aria-label="Pilih Aplikasi"
          placeholder="Pilih aplikasi"
          selectedKeys={formData.id_aplikasi ? [formData.id_aplikasi] : []}
          onSelectionChange={(keys) =>
            setFormData({ ...formData, id_aplikasi: Array.from(keys)[0] as string || "" })
          }
          isDisabled={isEdit}
          variant="bordered"
          size="sm"
          classNames={{
            trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
            value: "text-gray-900 dark:text-white",
            popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
          }}
        >
          {apps.map((a) => (
            <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Pengguna search — autocomplete ke man_akses.pengguna (SSO users) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Pengguna (Username / Email) <span className="text-red-500">*</span>
        </label>
        <Autocomplete
          aria-label="Pilih Pengguna"
          placeholder="Ketik username / nama (min 3 huruf)..."
          inputValue={penggunaSearch}
          onInputChange={setPenggunaSearch}
          selectedKey={formData.id_pengguna || null}
          onSelectionChange={(key) => handlePickPengguna(key as string | null)}
          isLoading={penggunaLoading}
          variant="bordered"
          size="sm"
          startContent={<FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          classNames={{
            base: "w-full",
          }}
          inputProps={{
            classNames: {
              inputWrapper:
                "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
              input: "text-gray-900 dark:text-white",
            },
          }}
          popoverProps={{
            classNames: {
              content:
                "!bg-white dark:!bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-xl rounded-lg",
            },
          }}
          listboxProps={{
            emptyContent:
              penggunaSearch.length < 3
                ? "Ketik min. 3 huruf untuk cari"
                : penggunaLoading
                  ? "Mencari..."
                  : "Tidak ada user cocok",
          }}
        >
          {penggunaOptions.map((p) => (
            <AutocompleteItem key={p.id_pengguna} textValue={`${p.username} — ${p.nm_pengguna}`}>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{p.nm_pengguna || "-"}</span>
                <span className="text-xs text-gray-500">@{p.username}{p.email ? ` · ${p.email}` : ""}</span>
              </div>
            </AutocompleteItem>
          ))}
        </Autocomplete>
        {formData.id_pengguna && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            ✓ {formData.nm_pj} — auto-fill dari akun pengguna
          </p>
        )}
      </div>

      {/* Jabatan PJ — dropdown dari man_akses.peran */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Jabatan PJ <span className="text-red-500">*</span>
        </label>
        <Select
          aria-label="Jabatan PJ"
          placeholder="Pilih peran sebagai jabatan PJ"
          selectedKeys={formData.jabatan_pj ? [formData.jabatan_pj] : []}
          onSelectionChange={(keys) =>
            setFormData({ ...formData, jabatan_pj: (Array.from(keys)[0] as string) || "" })
          }
          variant="bordered"
          size="sm"
          startContent={<FiBriefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          classNames={{
            base: "w-full",
            trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
            value: "text-gray-900 dark:text-white",
            popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
          }}
        >
          {peranOptions.map((p) => (
            <SelectItem key={p.nm_peran} textValue={p.nm_peran}>
              {p.nm_peran}
            </SelectItem>
          ))}
        </Select>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
          ⓘ Jabatan ini hanya label dokumen — TIDAK otomatis memberi peran/role ke pengguna.
          Untuk memberi peran (mis. Developer supaya bisa login ke WS API),
          tambahkan via menu <strong>Manajemen Peran</strong> atau Role Pengguna.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            aria-label="Email"
            placeholder="email@unila.ac.id"
            type="email"
            value={formData.email}
            onValueChange={(v) => setFormData({ ...formData, email: v })}
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
            No HP
          </label>
          <Input
            aria-label="No HP"
            placeholder="08xxxxxxxxxx"
            value={formData.no_hp}
            onValueChange={(v) => setFormData({ ...formData, no_hp: v })}
            variant="bordered"
            size="sm"
            classNames={{
              input: "text-gray-900 dark:text-white",
              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
            }}
          />
        </div>
      </div>

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
          formData.a_masih
            ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
            : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
        }`}
        onClick={() => setFormData({ ...formData, a_masih: !formData.a_masih })}
      >
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            formData.a_masih
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-500"
          }`}
        >
          {formData.a_masih && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {formData.a_masih ? "Masih Aktif sebagai PJ" : "Sudah Selesai"}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formData.a_masih
              ? "PJ sedang aktif menangani aplikasi ini"
              : "PJ sudah selesai masa tugasnya"}
          </p>
        </div>
      </div>
    </div>
  );

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
          serverSide
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari nama, jabatan, atau email..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex items-center gap-2">
              <Select
                aria-label="Filter Aplikasi"
                placeholder="Semua Aplikasi"
                selectedKeys={filterApp ? [filterApp] : []}
                onSelectionChange={(keys) => {
                  setFilterApp(Array.from(keys)[0] as string || "");
                  setCurrentPage(1);
                }}
                size="sm"
                variant="bordered"
                classNames={{
                  base: "w-48",
                  trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
                  value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
                  innerWrapper: "!bg-white dark:!bg-gray-800",
                  popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
                  listbox: "!bg-white dark:!bg-gray-800",
                }}
                renderValue={(items) => {
                  if (!items || items.length === 0) return "Semua Aplikasi";
                  return items[0].textValue || "Semua Aplikasi";
                }}
              >
                {apps.map((a) => (
                  <SelectItem key={a.id_aplikasi} textValue={a.nm_aplikasi}>{a.nm_aplikasi}</SelectItem>
                ))}
              </Select>
            </div>
          }
          actionSlot={
              <Button
                size="sm"
                startContent={<FiPlus className="w-4 h-4" />}
                onPress={handleAdd}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
              >
                Tambah PJ
              </Button>
          }
        />
      </motion.div>

      {/* ============ ADD MODAL ============ */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg" scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah PJ Baru</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  Penanggung jawab aplikasi
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">{renderFormFields(false)}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onAddClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitAdd}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Tambah PJ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============ EDIT MODAL ============ */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <FiEdit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit PJ</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {selectedItem?.nm_pj} — {selectedItem?.nm_aplikasi}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">{renderFormFields(true)}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onEditClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitEdit}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus PJ</h3>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus PJ{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{selectedItem?.nm_pj}&quot;</strong>{" "}
              dari aplikasi{" "}
              <strong className="text-gray-900 dark:text-white">{selectedItem?.nm_aplikasi}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onDeleteClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Ya, Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
