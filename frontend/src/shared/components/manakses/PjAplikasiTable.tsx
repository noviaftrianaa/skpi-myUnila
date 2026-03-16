"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, useDisclosure,
} from "@heroui/react";
import { authClient } from "@/lib/api/client";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiPhone, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

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

export default function PjAplikasiTable() {
  const [data, setData] = useState<PjItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [apps, setApps] = useState<AppOption[]>([]);
  const [filterApp, setFilterApp] = useState("");

  // Form state
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [editItem, setEditItem] = useState<PjItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id_aplikasi: "",
    nm_pj: "",
    jabatan_pj: "",
    no_hp: "",
    email: "",
    a_masih: true,
  });

  // Load apps for dropdown
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await authClient.get("/manakses/aplikasi?limit=200");
        setApps((res.data.data || []).map((a: any) => ({
          id_aplikasi: a.id_aplikasi,
          nm_aplikasi: a.nm_aplikasi,
        })));
      } catch (e) { console.error(e); }
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
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterApp]);

  const handleAdd = () => {
    setEditItem(null);
    setFormData({ id_aplikasi: "", nm_pj: "", jabatan_pj: "", no_hp: "", email: "", a_masih: true });
    onFormOpen();
  };

  const handleEdit = (item: PjItem) => {
    setEditItem(item);
    setFormData({
      id_aplikasi: item.id_aplikasi,
      nm_pj: item.nm_pj,
      jabatan_pj: item.jabatan_pj,
      no_hp: item.no_hp,
      email: item.email,
      a_masih: item.a_masih === 1,
    });
    onFormOpen();
  };

  const handleSubmit = async () => {
    if (!formData.nm_pj || !formData.jabatan_pj || !formData.email || !formData.id_aplikasi) {
      toast.error("Lengkapi semua field yang wajib");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editItem) {
        await authClient.put(`/manakses/pj-aplikasi/${editItem.id_pj_aplikasi}`, formData);
        toast.success("PJ berhasil diperbarui");
      } else {
        await authClient.post("/manakses/pj-aplikasi", formData);
        toast.success("PJ berhasil ditambahkan");
      }
      onFormClose();
      setCurrentPage(1);
      // Trigger reload
      setSearchQuery(prev => prev + " ");
      setTimeout(() => setSearchQuery(prev => prev.trim()), 100);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PjItem) => {
    if (!confirm(`Hapus PJ "${item.nm_pj}" dari ${item.nm_aplikasi}?`)) return;
    try {
      await authClient.delete(`/manakses/pj-aplikasi/${item.id_pj_aplikasi}`);
      toast.success("PJ berhasil dihapus");
      setSearchQuery(prev => prev + " ");
      setTimeout(() => setSearchQuery(prev => prev.trim()), 100);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gagal menghapus");
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
          <div className="text-xs text-gray-500">{item.jabatan_pj}</div>
        </div>
      ),
    },
    {
      key: "nm_aplikasi",
      label: "APLIKASI",
      sortable: true,
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">{item.nm_aplikasi}</div>
      ),
    },
    {
      key: "email",
      label: "KONTAK",
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FiMail className="w-3 h-3" /> {item.email}
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FiPhone className="w-3 h-3" /> {item.no_hp}
          </div>
        </div>
      ),
    },
    {
      key: "a_masih",
      label: "STATUS",
      width: "90px",
      render: (item) => (
        <Chip size="sm" variant="flat" color={item.a_masih ? "success" : "default"} className="font-semibold">
          {item.a_masih ? "Aktif" : "Selesai"}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      width: "100px",
      render: (item) => (
        <div className="flex gap-1">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => handleEdit(item)}>
            <FiEdit2 className="w-3.5 h-3.5" />
          </Button>
          <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => handleDelete(item)}>
            <FiTrash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama/jabatan/email..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2">
              <Select
                aria-label="Filter Aplikasi"
                placeholder="Semua Aplikasi"
                selectedKeys={filterApp ? [filterApp] : []}
                onSelectionChange={(keys) => { setFilterApp(Array.from(keys)[0] as string || ""); setCurrentPage(1); }}
                size="sm" variant="bordered"
                classNames={{ base: "w-[200px]", trigger: "h-10" }}
              >
                {apps.map((a) => <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>)}
              </Select>
              <Button size="sm" color="primary" startContent={<FiPlus />} onPress={handleAdd} className="h-10">
                Tambah PJ
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalContent>
          <ModalHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{editItem ? "Edit PJ" : "Tambah PJ Baru"}</h3>
                <p className="text-sm text-gray-500 font-normal">Penanggung jawab aplikasi</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 space-y-4">
            <Select
              label="Aplikasi"
              placeholder="Pilih aplikasi"
              selectedKeys={formData.id_aplikasi ? [formData.id_aplikasi] : []}
              onSelectionChange={(keys) => setFormData({ ...formData, id_aplikasi: Array.from(keys)[0] as string || "" })}
              isRequired isDisabled={!!editItem}
            >
              {apps.map((a) => <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>)}
            </Select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama PJ" value={formData.nm_pj} onValueChange={(v) => setFormData({ ...formData, nm_pj: v })} isRequired />
              <Input label="Jabatan" value={formData.jabatan_pj} onValueChange={(v) => setFormData({ ...formData, jabatan_pj: v })} isRequired />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" value={formData.email} onValueChange={(v) => setFormData({ ...formData, email: v })} isRequired startContent={<FiMail className="w-4 h-4 text-gray-400" />} />
              <Input label="No HP" value={formData.no_hp} onValueChange={(v) => setFormData({ ...formData, no_hp: v })} isRequired startContent={<FiPhone className="w-4 h-4 text-gray-400" />} />
            </div>
            <label className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              formData.a_masih ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-600"
            }`}>
              <input type="checkbox" checked={formData.a_masih} onChange={(e) => setFormData({ ...formData, a_masih: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span className="text-sm font-medium">Masih Aktif sebagai PJ</span>
            </label>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button variant="flat" onPress={onFormClose}>Batal</Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
              {editItem ? "Simpan" : "Tambah"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
