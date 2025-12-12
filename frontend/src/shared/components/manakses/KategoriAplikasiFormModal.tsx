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
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
import { FiHash } from "react-icons/fi";
import {
  kategoriAplikasiService,
  type KategoriAplikasiListItem,
  type CreateKategoriAplikasiRequest,
} from "@/lib/services/manakses/kategoriAplikasiService";

// Icon options for kategori
const ICON_OPTIONS = [
  { key: "heroicons:academic-cap", label: "Academic Cap" },
  { key: "heroicons:arrow-trending-up", label: "Trending Up" },
  { key: "heroicons:banknotes", label: "Banknotes" },
  { key: "heroicons:book-open", label: "Book Open" },
  { key: "heroicons:briefcase", label: "Briefcase" },
  { key: "heroicons:building-office", label: "Building Office" },
  { key: "heroicons:building-library", label: "Building Library" },
  { key: "heroicons:calendar", label: "Calendar" },
  { key: "heroicons:chart-bar", label: "Chart Bar" },
  { key: "heroicons:chart-pie", label: "Chart Pie" },
  { key: "heroicons:clipboard-document-list", label: "Clipboard" },
  { key: "heroicons:cog-6-tooth", label: "Settings" },
  { key: "heroicons:computer-desktop", label: "Desktop" },
  { key: "heroicons:cube", label: "Cube" },
  { key: "heroicons:document-text", label: "Document" },
  { key: "heroicons:folder", label: "Folder" },
  { key: "heroicons:globe-alt", label: "Globe" },
  { key: "heroicons:home", label: "Home" },
  { key: "heroicons:identification", label: "ID Card" },
  { key: "heroicons:key", label: "Key" },
  { key: "heroicons:map", label: "Map" },
  { key: "heroicons:newspaper", label: "Newspaper" },
  { key: "heroicons:presentation-chart-line", label: "Presentation" },
  { key: "heroicons:server", label: "Server" },
  { key: "heroicons:shopping-cart", label: "Shopping Cart" },
  { key: "heroicons:user-group", label: "User Group" },
  { key: "heroicons:users", label: "Users" },
  { key: "heroicons:wallet", label: "Wallet" },
  { key: "heroicons:wrench-screwdriver", label: "Tools" },
];

// Color class options (Tailwind colors)
const COLOR_OPTIONS = [
  { key: "text-blue-500", label: "Blue", color: "#3B82F6" },
  { key: "text-indigo-500", label: "Indigo", color: "#6366F1" },
  { key: "text-purple-500", label: "Purple", color: "#A855F7" },
  { key: "text-pink-500", label: "Pink", color: "#EC4899" },
  { key: "text-red-500", label: "Red", color: "#EF4444" },
  { key: "text-orange-500", label: "Orange", color: "#F97316" },
  { key: "text-amber-500", label: "Amber", color: "#F59E0B" },
  { key: "text-yellow-500", label: "Yellow", color: "#EAB308" },
  { key: "text-lime-500", label: "Lime", color: "#84CC16" },
  { key: "text-green-500", label: "Green", color: "#22C55E" },
  { key: "text-emerald-500", label: "Emerald", color: "#10B981" },
  { key: "text-teal-500", label: "Teal", color: "#14B8A6" },
  { key: "text-cyan-500", label: "Cyan", color: "#06B6D4" },
  { key: "text-sky-500", label: "Sky", color: "#0EA5E9" },
  { key: "text-gray-500", label: "Gray", color: "#6B7280" },
  { key: "text-slate-500", label: "Slate", color: "#64748B" },
];

interface KategoriAplikasiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kategori?: KategoriAplikasiListItem | null;
}

export default function KategoriAplikasiFormModal({
  isOpen,
  onClose,
  onSuccess,
  kategori,
}: KategoriAplikasiFormModalProps) {
  const isEditMode = !!kategori;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateKategoriAplikasiRequest>({
    nm_kategori: "",
    icon_kategori: null,
    icon_color: null,
    urutan: 0,
    a_aktif: true,
  });

  // Initialize form data
  useEffect(() => {
    if (kategori) {
      setFormData({
        nm_kategori: kategori.nm_kategori || "",
        icon_kategori: kategori.icon_kategori || null,
        icon_color: kategori.icon_color || null,
        urutan: kategori.urutan || 0,
        a_aktif: kategori.a_aktif ?? true,
      });
    } else {
      setFormData({
        nm_kategori: "",
        icon_kategori: null,
        icon_color: null,
        urutan: 0,
        a_aktif: true,
      });
    }
  }, [kategori, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nm_kategori.trim()) {
      alert("Nama kategori harus diisi");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && kategori) {
        await kategoriAplikasiService.update(kategori.id_kategori, formData);
      } else {
        await kategoriAplikasiService.create(formData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving kategori:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan kategori"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
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
              {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              {isEditMode
                ? "Perbarui informasi kategori aplikasi"
                : "Tambahkan kategori baru untuk mengelompokkan aplikasi"}
            </p>
          </ModalHeader>

          <ModalBody className="gap-5 py-6">
            {/* Nama Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Akademik, Keuangan, SDM"
                value={formData.nm_kategori}
                onChange={(e) =>
                  setFormData({ ...formData, nm_kategori: e.target.value })
                }
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
            </div>

            {/* Icon and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Icon Kategori
                </label>
                <Select
                  aria-label="Pilih Icon"
                  placeholder="Pilih icon"
                  selectedKeys={formData.icon_kategori ? [formData.icon_kategori] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, icon_kategori: selected || null });
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800",
                    value: "text-gray-900 dark:text-white",
                    popoverContent: "bg-white dark:bg-slate-800",
                  }}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon.key} textValue={icon.label}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Warna Icon
                </label>
                <Select
                  aria-label="Pilih Warna"
                  placeholder="Pilih warna"
                  selectedKeys={formData.icon_color ? [formData.icon_color] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, icon_color: selected || null });
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800",
                    value: "text-gray-900 dark:text-white",
                    popoverContent: "bg-white dark:bg-slate-800",
                  }}
                  renderValue={(items) => {
                    const item = items[0];
                    const colorOption = COLOR_OPTIONS.find(c => c.key === item?.key);
                    return (
                      <div className="flex items-center gap-2">
                        {colorOption && (
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: colorOption.color }}
                          />
                        )}
                        <span>{colorOption?.label || "Pilih warna"}</span>
                      </div>
                    );
                  }}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.key} textValue={color.label}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color.color }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Urutan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Urutan
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.urutan?.toString() || "0"}
                onChange={(e) =>
                  setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })
                }
                variant="bordered"
                startContent={<FiHash className="text-gray-400 flex-shrink-0" />}
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
              <p className="text-xs text-gray-500">Urutan tampil kategori (angka kecil = prioritas atas)</p>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Status Aktif
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Kategori akan tampil di portal jika aktif
                </p>
              </div>
              <Switch
                isSelected={formData.a_aktif}
                onValueChange={(value) =>
                  setFormData({ ...formData, a_aktif: value })
                }
                color="success"
                size="sm"
              />
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
              {isEditMode ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
