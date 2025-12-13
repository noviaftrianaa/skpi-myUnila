"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Autocomplete,
  AutocompleteItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiPlus,
  FiTrash2,
  FiSave,
  FiSearch,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { penggunaService, type PenggunaDetail, type PenggunaUpdateData } from "@/lib/services/manakses/penggunaService";
import { rolePenggunaService, type RolePenggunaCreateData } from "@/lib/services/manakses/rolePenggunaService";
import { peranService, type PeranOption } from "@/lib/services/manakses/peranService";
import { unitOrganisasiService, type UnitOrganisasiOption } from "@/lib/services/manakses/unitOrganisasiService";

interface PenggunaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengguna: PenggunaDetail | null;
  onSuccess?: () => void;
}

export default function PenggunaEditModal({
  isOpen,
  onClose,
  pengguna,
  onSuccess,
}: PenggunaEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Form data
  const [formData, setFormData] = useState<PenggunaUpdateData>({});
  const [roles, setRoles] = useState<PenggunaDetail["roles"]>([]);

  // Dropdown options
  const [peranOptions, setPeranOptions] = useState<PeranOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOrganisasiOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // New role form
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState<RolePenggunaCreateData>({
    id_pengguna: "",
    id_peran: 0,
    id_organisasi: null,
  });
  const [addingRole, setAddingRole] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pengguna) {
      // Initialize form data
      setFormData({
        nm_pengguna: pengguna.nm_pengguna,
        email: pengguna.email || undefined,
        jenis_kelamin: pengguna.jenis_kelamin as 'L' | 'P' | undefined,
        tempat_lahir: pengguna.tempat_lahir || undefined,
        tgl_lahir: pengguna.tgl_lahir || undefined,
        alamat: pengguna.alamat || undefined,
        no_tel: pengguna.no_tel || undefined,
        no_hp: pengguna.no_hp || undefined,
        jabatan: pengguna.jabatan || undefined,
        a_aktif: pengguna.a_aktif,
        disable: pengguna.disable,
      });
      setRoles(pengguna.roles || []);
      setNewRole({
        id_pengguna: pengguna.id_pengguna,
        id_peran: 0,
        id_organisasi: null,
      });
      setActiveTab("personal");
      loadOptions();
    }
  }, [isOpen, pengguna]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [peranData, unitData] = await Promise.all([
        peranService.getAll(),
        unitOrganisasiService.getAll(),
      ]);
      setPeranOptions(peranData);
      setUnitOptions(unitData);
    } catch (err) {
      console.error("Error loading options:", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSave = async () => {
    if (!pengguna) return;

    setSaving(true);
    setError(null);
    try {
      await penggunaService.update(pengguna.id_pengguna, formData);
      toast.success("Pengguna berhasil diperbarui", {
        duration: 2000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error saving pengguna:", err);
      setError("Gagal menyimpan perubahan");
      toast.error("Gagal menyimpan perubahan", {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async () => {
    if (!pengguna || !newRole.id_peran || !newRole.id_organisasi) {
      toast.error("Peran dan Unit Organisasi harus diisi", {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
      return;
    }

    setAddingRole(true);
    setError(null);
    try {
      const created = await rolePenggunaService.create({
        ...newRole,
        id_pengguna: pengguna.id_pengguna,
      });

      // Add to local roles list
      const peran = peranOptions.find(p => p.id_peran === newRole.id_peran);
      const unit = unitOptions.find(u => u.id_organisasi === newRole.id_organisasi);

      setRoles([...roles, {
        id_role_pengguna: created.id_role_pengguna,
        id_peran: String(newRole.id_peran),
        nm_peran: peran?.nm_peran || "",
        id_organisasi: newRole.id_organisasi || null,
        nm_organisasi: unit?.nm_lemb || null,
        id_jns_lemb: null,
        nm_jns_lemb: unit?.nm_jns_lemb || null,
        jenjang: unit?.jenjang || null,
        display_organisasi: unit?.display_name || unit?.nm_lemb || null,
        approval_peran: false,
        tgl_create: new Date().toISOString(),
        last_active: null,
      }]);

      // Reset form
      setNewRole({
        id_pengguna: pengguna.id_pengguna,
        id_peran: 0,
        id_organisasi: null,
      });
      setShowAddRole(false);
      toast.success("Peran berhasil ditambahkan", {
        duration: 2000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } catch (err) {
      console.error("Error adding role:", err);
      setError("Gagal menambahkan peran");
      toast.error("Gagal menambahkan peran", {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setAddingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    setDeletingRoleId(roleId);
    setError(null);
    try {
      await rolePenggunaService.delete(roleId);
      setRoles(roles.filter(r => r.id_role_pengguna !== roleId));
      toast.success("Peran berhasil dihapus", {
        duration: 2000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } catch (err) {
      console.error("Error deleting role:", err);
      setError("Gagal menghapus peran");
      toast.error("Gagal menghapus peran", {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setDeletingRoleId(null);
    }
  };

  const handleInputChange = (key: keyof PenggunaUpdateData, value: string | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh]",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Pengguna
          </h3>
          {pengguna && (
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              @{pengguna.username} - {pengguna.nm_pengguna}
            </p>
          )}
        </ModalHeader>

        <ModalBody className="gap-0 py-0">
          {loading || loadingOptions ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : pengguna ? (
            <>
              {error && (
                <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                classNames={{
                  tabList: "bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg mx-6 mt-4",
                  cursor: "bg-white dark:bg-slate-600 shadow-sm",
                  tab: "px-4 py-2 text-sm font-medium",
                  tabContent: "group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400",
                  panel: "px-6 py-5",
                }}
              >
                {/* Tab: Informasi Pribadi */}
                <Tab key="personal" title="Info Pribadi">
                  <div className="space-y-5">
                    {/* Informasi Utama Section */}
                    <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Informasi Utama
                      </h4>
                      <div className="space-y-4">
                        {/* Nama & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Nama Lengkap
                            </label>
                            <Input
                              placeholder="Masukkan nama lengkap"
                              value={formData.nm_pengguna || ""}
                              onChange={(e) => handleInputChange("nm_pengguna", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiUser className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Email
                            </label>
                            <Input
                              type="email"
                              placeholder="Masukkan email"
                              value={formData.email || ""}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiMail className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                        </div>

                        {/* Jenis Kelamin & Jabatan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Jenis Kelamin
                            </label>
                            <Select
                              aria-label="Pilih Jenis Kelamin"
                              placeholder="Pilih jenis kelamin"
                              selectedKeys={formData.jenis_kelamin ? [formData.jenis_kelamin] : []}
                              onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as 'L' | 'P';
                                handleInputChange("jenis_kelamin", selected || undefined);
                              }}
                              variant="bordered"
                              size="sm"
                              classNames={{
                                trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                                value: "text-gray-900 dark:text-white",
                                popoverContent: "bg-white dark:bg-slate-800",
                              }}
                            >
                              <SelectItem key="L" textValue="Laki-laki">Laki-laki</SelectItem>
                              <SelectItem key="P" textValue="Perempuan">Perempuan</SelectItem>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Jabatan
                            </label>
                            <Input
                              placeholder="Masukkan jabatan"
                              value={formData.jabatan || ""}
                              onChange={(e) => handleInputChange("jabatan", e.target.value)}
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
                    </div>

                    {/* Kontak & Alamat Section */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Kontak & Alamat
                      </h4>
                      <div className="space-y-4">
                        {/* Tempat & Tanggal Lahir */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Tempat Lahir
                            </label>
                            <Input
                              placeholder="Masukkan tempat lahir"
                              value={formData.tempat_lahir || ""}
                              onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiMapPin className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Tanggal Lahir
                            </label>
                            <Input
                              type="date"
                              placeholder="Masukkan tanggal lahir"
                              value={formData.tgl_lahir || ""}
                              onChange={(e) => handleInputChange("tgl_lahir", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiCalendar className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                        </div>

                        {/* No HP & No Telepon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              No. HP
                            </label>
                            <Input
                              placeholder="Masukkan no. HP"
                              value={formData.no_hp || ""}
                              onChange={(e) => handleInputChange("no_hp", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiPhone className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              No. Telepon
                            </label>
                            <Input
                              placeholder="Masukkan no. telepon"
                              value={formData.no_tel || ""}
                              onChange={(e) => handleInputChange("no_tel", e.target.value)}
                              variant="bordered"
                              size="sm"
                              startContent={<FiPhone className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              }}
                            />
                          </div>
                        </div>

                        {/* Alamat */}
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Alamat
                          </label>
                          <Input
                            placeholder="Masukkan alamat lengkap"
                            value={formData.alamat || ""}
                            onChange={(e) => handleInputChange("alamat", e.target.value)}
                            variant="bordered"
                            size="sm"
                            startContent={<FiMapPin className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>

                {/* Tab: Status Akun */}
                <Tab key="status" title="Status Akun">
                  <div className="space-y-5">
                    {/* Status Akun Section */}
                    <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Status Akun
                      </h4>
                      <div className="space-y-3">
                        {/* Status Aktif */}
                        <label
                          className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                            formData.a_aktif
                              ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.a_aktif || false}
                            onChange={(e) => handleInputChange("a_aktif", e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Status Aktif</span>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                              Aktifkan untuk mengizinkan pengguna login ke sistem
                            </p>
                          </div>
                        </label>

                        {/* Disable Akun */}
                        <label
                          className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                            formData.disable
                              ? "border-danger-400 bg-white dark:bg-danger-900/20 shadow-sm"
                              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.disable || false}
                            onChange={(e) => handleInputChange("disable", e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-danger-600 focus:ring-danger-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Disable Akun</span>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                              Nonaktifkan sementara akun pengguna (tidak bisa login)
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Info Sumber Data */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Informasi Akun
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
                          <p className="text-gray-500 dark:text-slate-400 text-xs mb-1">Sumber Data</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pengguna.has_sso ? "SSO Radius" : "Manajemen Akses"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
                          <p className="text-gray-500 dark:text-slate-400 text-xs mb-1">Status Saat Ini</p>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={pengguna.a_aktif && !pengguna.disable ? "success" : "danger"}
                          >
                            {pengguna.a_aktif && !pengguna.disable ? "Aktif" : "Tidak Aktif"}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>

                {/* Tab: Peran */}
                <Tab key="roles" title="Peran">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <FiShield className="w-4 h-4" />
                        Peran & Unit Organisasi ({roles.length})
                      </label>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FiPlus className="w-4 h-4" />}
                        onPress={() => setShowAddRole(true)}
                      >
                        Tambah Peran
                      </Button>
                    </div>

                    {/* Add Role Form */}
                    {showAddRole && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Tambah Peran Baru
                        </h5>
                        <div className="space-y-4 mb-4">
                          {/* Peran */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Pilih Peran <span className="text-red-500">*</span>
                            </label>
                            <Autocomplete
                              aria-label="Pilih Peran"
                              placeholder="Cari peran..."
                              selectedKey={newRole.id_peran ? String(newRole.id_peran) : undefined}
                              onSelectionChange={(key) => setNewRole(prev => ({
                                ...prev,
                                id_peran: key ? Number(key) : 0
                              }))}
                              variant="bordered"
                              size="sm"
                              classNames={{
                                base: "w-full",
                                listboxWrapper: "max-h-[300px]",
                                popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                              }}
                              inputProps={{
                                classNames: {
                                  input: "text-gray-900 dark:text-white",
                                  inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                                },
                              }}
                              listboxProps={{
                                emptyContent: "Tidak ada peran ditemukan",
                                className: "bg-white dark:bg-slate-800",
                              }}
                            >
                              {peranOptions.map((peran) => (
                                <AutocompleteItem key={String(peran.id_peran)} textValue={peran.nm_peran}>
                                  {peran.nm_peran}
                                </AutocompleteItem>
                              ))}
                            </Autocomplete>
                          </div>

                          {/* Unit Organisasi */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Unit Organisasi <span className="text-red-500">*</span>
                            </label>
                            <Autocomplete
                              aria-label="Pilih Unit Organisasi"
                              placeholder="Ketik untuk mencari unit organisasi..."
                              selectedKey={newRole.id_organisasi || undefined}
                              onSelectionChange={(key) => setNewRole(prev => ({
                                ...prev,
                                id_organisasi: key ? String(key) : null
                              }))}
                              variant="bordered"
                              size="sm"
                              startContent={<FiSearch className="text-gray-400 flex-shrink-0" />}
                              classNames={{
                                base: "w-full",
                                listboxWrapper: "max-h-[300px]",
                                popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                              }}
                              inputProps={{
                                classNames: {
                                  input: "text-gray-900 dark:text-white",
                                  inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                                },
                              }}
                              listboxProps={{
                                emptyContent: "Tidak ada unit ditemukan",
                                className: "bg-white dark:bg-slate-800",
                              }}
                            >
                              {unitOptions.map((unit) => (
                                <AutocompleteItem
                                  key={unit.id_organisasi}
                                  textValue={unit.display_name || unit.nm_lemb}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{unit.nm_lemb}</span>
                                    {(unit.nm_jns_lemb || unit.jenjang) && (
                                      <span className="text-xs text-gray-500 dark:text-slate-400">
                                        {unit.nm_jns_lemb}
                                        {unit.nm_jns_lemb && unit.jenjang && " - "}
                                        {unit.jenjang}
                                      </span>
                                    )}
                                  </div>
                                </AutocompleteItem>
                              ))}
                            </Autocomplete>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Ketik minimal 2 karakter untuk mencari</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setShowAddRole(false);
                              setNewRole({
                                id_pengguna: pengguna.id_pengguna,
                                id_peran: 0,
                                id_organisasi: null,
                              });
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={handleAddRole}
                            isLoading={addingRole}
                            isDisabled={!newRole.id_peran || !newRole.id_organisasi}
                          >
                            Tambahkan
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Roles List */}
                    {roles.length > 0 ? (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {roles.map((role, index) => (
                          <div
                            key={role.id_role_pengguna || index}
                            className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {role.nm_peran}
                                  </span>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={role.approval_peran ? "success" : "warning"}
                                  >
                                    {role.approval_peran ? "Approved" : "Pending"}
                                  </Chip>
                                </div>
                                {(role.display_organisasi || role.nm_organisasi) && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    {role.display_organisasi || role.nm_organisasi}
                                  </p>
                                )}
                                {role.jenjang && !role.display_organisasi?.includes(role.jenjang) && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                    Jenjang: {role.jenjang}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                isIconOnly
                                onPress={() => handleDeleteRole(role.id_role_pengguna)}
                                isLoading={deletingRoleId === role.id_role_pengguna}
                                className="flex-shrink-0"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                        Belum ada peran yang ditetapkan
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </>
          ) : null}
        </ModalBody>

        <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={saving}
            className="font-medium"
            size="lg"
          >
            Batal
          </Button>
          <Button
            onPress={handleSave}
            isLoading={saving}
            startContent={!saving && <FiSave className="w-4 h-4" />}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
