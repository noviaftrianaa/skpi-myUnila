"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiServer } from "react-icons/fi";
import { endpointService, type Endpoint, type EndpointStats, type EndpointCreateData, type EndpointGroup } from "@/lib/services/manakses/endpointService";
import { authClient } from "@/lib/api/authClient";
import { toast } from "react-hot-toast";

interface EndpointTableProps {
  onStatsLoaded?: (stats: EndpointStats) => void;
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

export default function EndpointTable({ onStatsLoaded }: EndpointTableProps) {
  const [data, setData] = useState<Endpoint[]>([]);
  const [stats, setStats] = useState<EndpointStats | null>(null);
  const [groups, setGroups] = useState<EndpointGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterApp, setFilterApp] = useState<string>("all");
  const [apps, setApps] = useState<Array<{id_aplikasi: string; nm_aplikasi: string}>>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<Endpoint | null>(null);
  const [formData, setFormData] = useState<EndpointCreateData>({
    nm_endpoint: "", path_url: "", nm_group: null, nm_method: null, a_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, groupsData] = await Promise.all([endpointService.getStats(), endpointService.getGroups()]);
        setStats(statsData);
        setGroups(groupsData);
        if (onStatsLoadedRef.current) onStatsLoadedRef.current(statsData);
      } catch (error) { console.error('Error loading initial data:', error); }
    };
    loadInitialData();
  }, [reloadKey]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await authClient.get('/manakses/aplikasi?limit=100');
        const data = res.data?.data?.data || res.data?.data || [];
        const list = (Array.isArray(data) ? data : []).map((a: any) => ({
          id_aplikasi: a.id_aplikasi,
          nm_aplikasi: a.nm_aplikasi,
        }));
        setApps(list);
      } catch (e) { console.error('Error loading apps:', e); }
    };
    loadApps();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await endpointService.getList({
          page: currentPage, limit: rowsPerPage,
          search: searchQuery || undefined,
          nm_group: filterGroup !== "all" ? filterGroup : undefined,
          nm_method: filterMethod !== "all" ? filterMethod : undefined,
          id_aplikasi: filterApp !== "all" ? filterApp : undefined,
        });
        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) { console.error('Error:', error); toastError('Gagal memuat data endpoint'); }
      finally { setLoading(false); }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterGroup, filterMethod, filterApp, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try { return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return "-"; }
  };

  const getMethodColor = (method: string | null): "primary" | "success" | "warning" | "danger" | "default" => {
    switch (method?.toUpperCase()) {
      case "GET": return "primary"; case "POST": return "success";
      case "PUT": case "PATCH": return "warning"; case "DELETE": return "danger";
      default: return "default";
    }
  };

  const handleAdd = () => {
    setFormData({ nm_endpoint: "", path_url: "", nm_group: null, nm_method: null, a_active: true });
    onAddOpen();
  };
  const handleEdit = (item: Endpoint) => {
    setSelectedItem(item);
    setFormData({ nm_endpoint: item.nm_endpoint, path_url: item.path_url, nm_group: item.nm_group, nm_method: item.nm_method, a_active: item.a_active });
    onEditOpen();
  };
  const handleDelete = (item: Endpoint) => { setSelectedItem(item); onDeleteOpen(); };

  const handleSubmitAdd = async () => {
    if (!formData.path_url.trim()) { toastError('Path URL harus diisi'); return; }
    setIsSubmitting(true);
    try { await endpointService.create(formData); toastSuccess('Endpoint berhasil ditambahkan'); onAddClose(); reload(); }
    catch (e: any) { toastError(e.response?.data?.message || 'Gagal menambahkan endpoint'); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.path_url.trim()) { toastError('Path URL harus diisi'); return; }
    setIsSubmitting(true);
    try { await endpointService.update(selectedItem.id_endpoint, formData); toastSuccess('Endpoint berhasil diperbarui'); onEditClose(); reload(); }
    catch (e: any) { toastError(e.response?.data?.message || 'Gagal memperbarui endpoint'); }
    finally { setIsSubmitting(false); }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    const name = selectedItem.nm_endpoint || selectedItem.path_url;
    setIsSubmitting(true);
    try { await endpointService.delete(selectedItem.id_endpoint); toastSuccess(`Endpoint "${name}" berhasil dihapus`); onDeleteClose(); reload(); }
    catch (e: any) { toastError(e.response?.data?.message || 'Gagal menghapus endpoint'); }
    finally { setIsSubmitting(false); }
  };

  const columns: Column<Endpoint>[] = [
    { key: "path_url", label: "PATH URL", sortable: true, render: (item) => (
      <div>
        <div className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{item.path_url}</div>
        {item.nm_endpoint && <div className="text-xs text-gray-500 mt-0.5">{item.nm_endpoint}</div>}
      </div>
    )},
    { key: "nm_method", label: "METHOD", align: "center" as const, width: "90px", render: (item) => (
      <Chip size="sm" variant="flat" color={getMethodColor(item.nm_method)} className="font-mono font-semibold">{item.nm_method || "-"}</Chip>
    )},
    { key: "nm_group", label: "GROUP", width: "130px", render: (item) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">{item.nm_group || "-"}</span>
    )},
    { key: "a_active", label: "STATUS", align: "center" as const, width: "90px", render: (item) => (
      <Chip size="sm" variant="flat" color={item.a_active ? "success" : "default"} className="font-semibold">{item.a_active ? "Aktif" : "Nonaktif"}</Chip>
    )},
    { key: "last_update", label: "UPDATE", align: "center" as const, width: "120px", render: (item) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.last_update)}</span>
    )},
    { key: "actions", label: "", width: "60px", align: "center" as const, render: (item) => (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <FiMoreVertical className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Aksi" className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg">
          <DropdownItem key="edit" startContent={<FiEdit2 className="w-4 h-4" />} onPress={() => handleEdit(item)} className="text-gray-700 dark:text-gray-300">Edit</DropdownItem>
          <DropdownItem key="delete" startContent={<FiTrash2 className="w-4 h-4" />} onPress={() => handleDelete(item)} className="text-danger" color="danger">Hapus</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )},
  ];

  const renderFormFields = () => (
    <div className="space-y-5">
      <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Informasi Endpoint
        </h4>
        <div className="space-y-4">
          <Input label="Path URL" placeholder="/v1/referensi/agama" value={formData.path_url}
            onValueChange={(v) => setFormData({ ...formData, path_url: v })} isRequired variant="bordered"
            classNames={{ inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
          <Input label="Nama Endpoint (opsional)" placeholder="Deskripsi endpoint" value={formData.nm_endpoint}
            onValueChange={(v) => setFormData({ ...formData, nm_endpoint: v })} variant="bordered"
            classNames={{ inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Group" placeholder="referensi, auth, pdrd" value={formData.nm_group || ""}
              onValueChange={(v) => setFormData({ ...formData, nm_group: v || null })} variant="bordered"
              classNames={{ inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
            <Select label="Method" placeholder="Pilih method" variant="bordered"
              selectedKeys={formData.nm_method ? [formData.nm_method] : []}
              onSelectionChange={(keys) => setFormData({ ...formData, nm_method: Array.from(keys)[0] as string || null })}
              classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }}>
              <SelectItem key="GET">GET</SelectItem>
              <SelectItem key="POST">POST</SelectItem>
              <SelectItem key="PUT">PUT</SelectItem>
              <SelectItem key="PATCH">PATCH</SelectItem>
              <SelectItem key="DELETE">DELETE</SelectItem>
            </Select>
          </div>
        </div>
      </div>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
        formData.a_active ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600" : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
      }`} onClick={() => setFormData({ ...formData, a_active: !formData.a_active })}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          formData.a_active ? "bg-green-500 border-green-500 text-white" : "border-gray-300 dark:border-gray-500"
        }`}>
          {formData.a_active && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{formData.a_active ? "Endpoint Aktif" : "Endpoint Nonaktif"}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formData.a_active ? "Endpoint dapat diakses oleh user" : "Endpoint dinonaktifkan"}</p>
        </div>
      </div>
    </div>
  );

  const filterSlot = (
    <div className="flex items-center gap-2">
      <Select aria-label="Filter Aplikasi" placeholder="Semua Aplikasi" selectedKeys={[filterApp]}
        onChange={(e) => { setFilterApp(e.target.value || "all"); setCurrentPage(1); }}
        size="sm" variant="bordered"
        classNames={{
          base: "w-44",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[250px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        renderValue={(items) => {
          if (!items || items.length === 0 || items[0].key === "all") return "Semua Aplikasi";
          return items[0].textValue || "Semua Aplikasi";
        }}>
        <SelectItem key="all" textValue="Semua Aplikasi">Semua Aplikasi</SelectItem>
        {apps.map((a) => <SelectItem key={a.id_aplikasi} textValue={a.nm_aplikasi}>{a.nm_aplikasi}</SelectItem>)}
      </Select>
      <Select aria-label="Filter Group" placeholder="Semua Group" selectedKeys={[filterGroup]}
        onChange={(e) => { setFilterGroup(e.target.value || "all"); setCurrentPage(1); }}
        size="sm" variant="bordered"
        classNames={{
          base: "w-40",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[220px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        renderValue={(items) => {
          if (!items || items.length === 0 || items[0].key === "all") return "Semua Group";
          return items[0].textValue || "Semua Group";
        }}>
        <SelectItem key="all" textValue="Semua Group">Semua Group</SelectItem>
        {groups.map((g) => <SelectItem key={g.nm_group} textValue={g.nm_group}>{g.nm_group} ({g.total})</SelectItem>)}
      </Select>
      <Select aria-label="Filter Method" placeholder="Semua Method" selectedKeys={[filterMethod]}
        onChange={(e) => { setFilterMethod(e.target.value || "all"); setCurrentPage(1); }}
        size="sm" variant="bordered"
        classNames={{
          base: "w-36",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[180px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        renderValue={(items) => {
          if (!items || items.length === 0 || items[0].key === "all") return "Semua Method";
          return items[0].textValue || "Semua Method";
        }}>
        <SelectItem key="all" textValue="Semua Method">Semua Method</SelectItem>
        <SelectItem key="GET" textValue="GET">GET ({stats?.total_get || 0})</SelectItem>
        <SelectItem key="POST" textValue="POST">POST ({stats?.total_post || 0})</SelectItem>
        <SelectItem key="PUT" textValue="PUT">PUT ({stats?.total_put || 0})</SelectItem>
        <SelectItem key="DELETE" textValue="DELETE">DELETE ({stats?.total_delete || 0})</SelectItem>
      </Select>
    </div>
  );

  const actionSlot = (
    <Button startContent={<FiPlus className="w-4 h-4" />} onPress={handleAdd} size="sm"
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg">
      Tambah Endpoint
    </Button>
  );

  const modalClassNames = {
    backdrop: "bg-black/50 backdrop-blur-sm",
    base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
  };

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <DataTable data={data} columns={columns} searchPlaceholder="Cari path URL, nama endpoint..."
            defaultRowsPerPage={10} rowsPerPageOptions={[5, 10, 25, 50, 100]}
            loading={loading} serverSide totalRecords={totalRecords}
            onPageChange={setCurrentPage} onRowsPerPageChange={(r) => { setRowsPerPage(r); setCurrentPage(1); }}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            filterSlot={filterSlot} actionSlot={actionSlot} className="shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg" scrollBehavior="inside" classNames={modalClassNames}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <FiServer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Endpoint</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Tambah endpoint web service baru</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 px-3 sm:px-6">{renderFormFields()}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <Button variant="flat" onPress={onAddClose} className="font-medium">Batal</Button>
            <Button onPress={handleSubmitAdd} isLoading={isSubmitting}
              className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg">
              Tambah Endpoint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" scrollBehavior="inside" classNames={modalClassNames}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <FiEdit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Endpoint</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal font-mono">{selectedItem?.path_url}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 px-3 sm:px-6">{renderFormFields()}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <Button variant="flat" onPress={onEditClose} className="font-medium">Batal</Button>
            <Button onPress={handleSubmitEdit} isLoading={isSubmitting}
              className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg">
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm" classNames={modalClassNames}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Endpoint</h3></div>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 px-3 sm:px-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus endpoint{" "}
              <strong className="text-gray-900 dark:text-white font-mono">{selectedItem?.path_url}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <Button variant="flat" onPress={onDeleteClose} className="font-medium">Batal</Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting} className="font-medium">Ya, Hapus</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
