"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
import { FiGlobe, FiServer, FiCode } from "react-icons/fi";
import {
  aplikasiService,
  type Aplikasi,
  type CreateAplikasiRequest,
} from "@/lib/services/manakses/aplikasiService";
import {
  unitOrganisasiService,
  type UnitOrganisasiOption,
} from "@/lib/services/manakses/unitOrganisasiService";

interface AplikasiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  aplikasi?: Aplikasi | null; // For edit mode
}

export default function AplikasiFormModal({
  isOpen,
  onClose,
  onSuccess,
  aplikasi,
}: AplikasiFormModalProps) {
  const isEditMode = !!aplikasi;

  const [loading, setLoading] = useState(false);
  const [unitOrganisasiList, setUnitOrganisasiList] = useState<UnitOrganisasiOption[]>([]);
  const [formData, setFormData] = useState<CreateAplikasiRequest>({
    nm_aplikasi: "",
    ket_aplikasi: "",
    id_organisasi: null,
    url: "",
    port: "",
    teknologi: "",
    endpoint_ws: "",
    a_generate_menu: false,
    a_integrasi_cas: false,
    a_sistem_internal_pt: false,
  });

  // Load unit organisasi for dropdown
  useEffect(() => {
    const loadUnitOrganisasi = async () => {
      try {
        const data = await unitOrganisasiService.getAll();
        setUnitOrganisasiList(data);
      } catch (error) {
        console.error("Error loading unit organisasi:", error);
      }
    };
    if (isOpen) {
      loadUnitOrganisasi();
    }
  }, [isOpen]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (aplikasi) {
      setFormData({
        nm_aplikasi: aplikasi.nm_aplikasi || "",
        ket_aplikasi: aplikasi.ket_aplikasi || "",
        id_organisasi: aplikasi.id_organisasi || null,
        url: aplikasi.url || "",
        port: aplikasi.port?.toString() || "",
        teknologi: aplikasi.teknologi || "",
        endpoint_ws: aplikasi.endpoint_ws || "",
        a_generate_menu: aplikasi.a_generate_menu || false,
        a_integrasi_cas: aplikasi.a_integrasi_cas || false,
        a_sistem_internal_pt: aplikasi.a_sistem_internal_pt || false,
      });
    } else {
      // Reset for create mode
      setFormData({
        nm_aplikasi: "",
        ket_aplikasi: "",
        id_organisasi: null,
        url: "",
        port: "",
        teknologi: "",
        endpoint_ws: "",
        a_generate_menu: false,
        a_integrasi_cas: false,
        a_sistem_internal_pt: false,
      });
    }
  }, [aplikasi, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nm_aplikasi.trim()) {
      alert("Nama aplikasi harus diisi");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && aplikasi) {
        await aplikasiService.update(aplikasi.id_aplikasi, formData);
      } else {
        await aplikasiService.create(formData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving aplikasi:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan aplikasi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              {isEditMode
                ? "Perbarui informasi aplikasi yang sudah ada"
                : "Daftarkan aplikasi baru ke sistem Manajemen Akses"}
            </p>
          </ModalHeader>

          <ModalBody className="gap-5 py-6">
            {/* Nama Aplikasi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Nama Aplikasi <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: SIAKAD, SIMPEG, dll"
                value={formData.nm_aplikasi}
                onChange={(e) =>
                  setFormData({ ...formData, nm_aplikasi: e.target.value })
                }
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Keterangan
              </label>
              <Textarea
                placeholder="Deskripsi singkat aplikasi (opsional)"
                value={formData.ket_aplikasi || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ket_aplikasi: e.target.value })
                }
                variant="bordered"
                minRows={2}
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
            </div>

            {/* Unit Organisasi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Unit Organisasi
              </label>
              <Select
                aria-label="Pilih Unit Organisasi"
                placeholder="Pilih unit organisasi"
                selectedKeys={formData.id_organisasi ? [formData.id_organisasi] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, id_organisasi: selected || null });
                }}
                variant="bordered"
                classNames={{
                  trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800",
                  value: "text-gray-900 dark:text-white",
                  popoverContent: "bg-white dark:bg-slate-800",
                }}
              >
                {unitOrganisasiList.map((unit) => (
                  <SelectItem key={unit.id_organisasi} textValue={unit.nm_lemb}>
                    {unit.nm_lemb}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* URL and Port */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  URL Aplikasi
                </label>
                <Input
                  placeholder="https://aplikasi.unila.ac.id"
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  variant="bordered"
                  startContent={<FiGlobe className="text-gray-400 flex-shrink-0" />}
                  classNames={{
                    input: "text-gray-900 dark:text-white",
                    inputWrapper: "border-gray-300 dark:border-slate-600",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Port
                </label>
                <Input
                  placeholder="8080"
                  value={formData.port || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, port: e.target.value })
                  }
                  variant="bordered"
                  startContent={<FiServer className="text-gray-400 flex-shrink-0" />}
                  classNames={{
                    input: "text-gray-900 dark:text-white",
                    inputWrapper: "border-gray-300 dark:border-slate-600",
                  }}
                />
              </div>
            </div>

            {/* Teknologi and Endpoint WS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Teknologi
                </label>
                <Input
                  placeholder="Laravel, React, Go, dll"
                  value={formData.teknologi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, teknologi: e.target.value })
                  }
                  variant="bordered"
                  startContent={<FiCode className="text-gray-400 flex-shrink-0" />}
                  classNames={{
                    input: "text-gray-900 dark:text-white",
                    inputWrapper: "border-gray-300 dark:border-slate-600",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Endpoint Web Service
                </label>
                <Input
                  placeholder="/api/v1"
                  value={formData.endpoint_ws || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint_ws: e.target.value })
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900 dark:text-white",
                    inputWrapper: "border-gray-300 dark:border-slate-600",
                  }}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Pengaturan Aplikasi
              </label>

              <div className="space-y-3">
                {/* Generate Menu */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Generate Menu
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Aktifkan jika aplikasi memerlukan auto-generate menu
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.a_generate_menu}
                    onValueChange={(value) =>
                      setFormData({ ...formData, a_generate_menu: value })
                    }
                    color="primary"
                    size="sm"
                  />
                </div>

                {/* Integrasi CAS */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Integrasi CAS/SSO
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Aktifkan jika aplikasi terintegrasi dengan SSO Unila
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.a_integrasi_cas}
                    onValueChange={(value) =>
                      setFormData({ ...formData, a_integrasi_cas: value })
                    }
                    color="success"
                    size="sm"
                  />
                </div>

                {/* Sistem Internal PT */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Sistem Internal PT
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Tandai sebagai sistem internal perguruan tinggi
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.a_sistem_internal_pt}
                    onValueChange={(value) =>
                      setFormData({ ...formData, a_sistem_internal_pt: value })
                    }
                    color="warning"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={loading}
              className="font-medium"
              size="lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isEditMode ? "Simpan Perubahan" : "Tambah Aplikasi"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
