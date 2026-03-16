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
import toast from "react-hot-toast";

// Icon options for kategori - Iconify format (focused on category-relevant icons)
const ICON_OPTIONS = [
  // Education & Academic
  { key: "heroicons:academic-cap", label: "Academic Cap" },
  { key: "heroicons:book-open", label: "Book Open" },
  { key: "heroicons:building-library", label: "Library" },
  { key: "heroicons:clipboard-document-list", label: "Clipboard" },
  { key: "heroicons:document-text", label: "Document" },
  { key: "heroicons:presentation-chart-line", label: "Presentation" },
  { key: "heroicons:trophy", label: "Trophy" },
  { key: "heroicons:light-bulb", label: "Light Bulb" },
  { key: "ph:graduation-cap-fill", label: "Graduation Cap" },
  { key: "ph:student-fill", label: "Student" },
  { key: "ph:books-fill", label: "Books" },
  { key: "mdi:school", label: "School" },
  { key: "tabler:school", label: "School (Tabler)" },
  { key: "tabler:certificate", label: "Certificate" },
  { key: "tabler:award", label: "Award" },

  // Business & Office
  { key: "heroicons:briefcase", label: "Briefcase" },
  { key: "heroicons:building-office", label: "Office" },
  { key: "heroicons:building-office-2", label: "Office Building" },
  { key: "heroicons:identification", label: "ID Card" },
  { key: "heroicons:user-group", label: "User Group" },
  { key: "heroicons:users", label: "Users" },
  { key: "ph:buildings-fill", label: "Buildings" },
  { key: "ph:handshake-fill", label: "Handshake" },
  { key: "mdi:domain", label: "Domain" },
  { key: "tabler:building", label: "Building" },

  // Charts & Analytics
  { key: "heroicons:chart-bar", label: "Chart Bar" },
  { key: "heroicons:chart-pie", label: "Chart Pie" },
  { key: "heroicons:arrow-trending-up", label: "Trending Up" },
  { key: "heroicons:presentation-chart-bar", label: "Presentation Bar" },
  { key: "heroicons:table-cells", label: "Table Cells" },
  { key: "ph:chart-line-up-fill", label: "Chart Up" },
  { key: "ph:chart-pie-slice-fill", label: "Pie Chart" },
  { key: "mdi:monitor-dashboard", label: "Dashboard" },
  { key: "mdi:view-dashboard", label: "Dashboard View" },
  { key: "tabler:dashboard", label: "Dashboard (Tabler)" },
  { key: "tabler:report-analytics", label: "Analytics" },

  // Finance
  { key: "heroicons:banknotes", label: "Banknotes" },
  { key: "heroicons:credit-card", label: "Credit Card" },
  { key: "heroicons:currency-dollar", label: "Dollar" },
  { key: "heroicons:wallet", label: "Wallet" },
  { key: "heroicons:calculator", label: "Calculator" },
  { key: "ph:bank-fill", label: "Bank" },
  { key: "ph:money-fill", label: "Money" },
  { key: "mdi:cash", label: "Cash" },
  { key: "mdi:finance", label: "Finance" },
  { key: "tabler:cash", label: "Cash (Tabler)" },

  // Technology
  { key: "heroicons:server", label: "Server" },
  { key: "heroicons:server-stack", label: "Server Stack" },
  { key: "heroicons:computer-desktop", label: "Desktop" },
  { key: "heroicons:cpu-chip", label: "CPU Chip" },
  { key: "heroicons:cloud", label: "Cloud" },
  { key: "heroicons:code-bracket", label: "Code" },
  { key: "heroicons:command-line", label: "Terminal" },
  { key: "heroicons:cube", label: "Cube" },
  { key: "heroicons:link", label: "Link" },
  { key: "ph:database-fill", label: "Database" },
  { key: "ph:hard-drives-fill", label: "Hard Drives" },
  { key: "mdi:database", label: "Database (MDI)" },
  { key: "mdi:api", label: "API" },
  { key: "tabler:database", label: "Database (Tabler)" },
  { key: "tabler:server", label: "Server (Tabler)" },

  // Security
  { key: "heroicons:key", label: "Key" },
  { key: "heroicons:lock-closed", label: "Lock Closed" },
  { key: "heroicons:shield-check", label: "Shield Check" },
  { key: "heroicons:finger-print", label: "Fingerprint" },
  { key: "ph:shield-check-fill", label: "Shield (Ph)" },
  { key: "mdi:shield-lock", label: "Shield Lock" },
  { key: "tabler:shield-check", label: "Shield (Tabler)" },

  // Communication & Support
  { key: "heroicons:envelope", label: "Envelope" },
  { key: "heroicons:chat-bubble-left-right", label: "Chat" },
  { key: "heroicons:phone", label: "Phone" },
  { key: "heroicons:megaphone", label: "Megaphone" },
  { key: "heroicons:bell", label: "Bell" },
  { key: "heroicons:lifebuoy", label: "Lifebuoy" },
  { key: "heroicons:hand-raised", label: "Hand Raised" },
  { key: "ph:headset-fill", label: "Headset" },
  { key: "mdi:headset", label: "Headset (MDI)" },
  { key: "mdi:lifebuoy", label: "Lifebuoy (MDI)" },
  { key: "mdi:help-circle", label: "Help" },
  { key: "tabler:headset", label: "Headset (Tabler)" },

  // Navigation & Location
  { key: "heroicons:home", label: "Home" },
  { key: "heroicons:globe-alt", label: "Globe" },
  { key: "heroicons:globe-asia-australia", label: "Globe Asia" },
  { key: "heroicons:map", label: "Map" },
  { key: "heroicons:map-pin", label: "Map Pin" },
  { key: "ph:globe-fill", label: "Globe (Ph)" },
  { key: "mdi:earth", label: "Earth" },
  { key: "tabler:world", label: "World" },

  // Files & Documents
  { key: "heroicons:document", label: "Document" },
  { key: "heroicons:document-chart-bar", label: "Document Chart" },
  { key: "heroicons:folder", label: "Folder" },
  { key: "heroicons:archive-box", label: "Archive Box" },
  { key: "heroicons:newspaper", label: "Newspaper" },
  { key: "ph:file-text-fill", label: "File Text" },
  { key: "ph:folder-fill", label: "Folder (Ph)" },
  { key: "mdi:file-document", label: "File Document" },
  { key: "tabler:file-text", label: "File Text (Tabler)" },

  // Time & Calendar
  { key: "heroicons:calendar", label: "Calendar" },
  { key: "heroicons:calendar-days", label: "Calendar Days" },
  { key: "heroicons:clock", label: "Clock" },
  { key: "ph:calendar-check-fill", label: "Calendar Check" },
  { key: "mdi:calendar-check", label: "Calendar Check (MDI)" },
  { key: "tabler:calendar", label: "Calendar (Tabler)" },

  // Settings & Tools
  { key: "heroicons:cog-6-tooth", label: "Settings" },
  { key: "heroicons:adjustments-horizontal", label: "Adjustments" },
  { key: "heroicons:wrench", label: "Wrench" },
  { key: "heroicons:wrench-screwdriver", label: "Tools" },
  { key: "ph:gear-fill", label: "Gear" },
  { key: "ph:sliders-fill", label: "Sliders" },
  { key: "mdi:cog", label: "Cog" },
  { key: "mdi:tools", label: "Tools (MDI)" },
  { key: "tabler:settings", label: "Settings (Tabler)" },
  { key: "tabler:tool", label: "Tool" },

  // Actions & Status
  { key: "heroicons:check-circle", label: "Check Circle" },
  { key: "heroicons:magnifying-glass", label: "Search" },
  { key: "heroicons:rocket-launch", label: "Rocket" },
  { key: "heroicons:star", label: "Star" },
  { key: "heroicons:heart", label: "Heart" },
  { key: "heroicons:sparkles", label: "Sparkles" },
  { key: "heroicons:fire", label: "Fire" },
  { key: "heroicons:bolt", label: "Bolt" },
  { key: "ph:lightning-fill", label: "Lightning" },
  { key: "mdi:rocket", label: "Rocket (MDI)" },
  { key: "mdi:lightbulb", label: "Lightbulb" },
  { key: "tabler:rocket", label: "Rocket (Tabler)" },
  { key: "tabler:bulb", label: "Bulb" },

  // Commerce & Shopping
  { key: "heroicons:shopping-bag", label: "Shopping Bag" },
  { key: "heroicons:shopping-cart", label: "Shopping Cart" },
  { key: "heroicons:tag", label: "Tag" },
  { key: "heroicons:gift", label: "Gift" },
  { key: "mdi:cart", label: "Cart" },
  { key: "mdi:store", label: "Store" },
  { key: "tabler:shopping-cart", label: "Cart (Tabler)" },

  // Media
  { key: "heroicons:camera", label: "Camera" },
  { key: "heroicons:photo", label: "Photo" },
  { key: "heroicons:video-camera", label: "Video Camera" },
  { key: "heroicons:microphone", label: "Microphone" },
  { key: "heroicons:musical-note", label: "Music" },
  { key: "mdi:image", label: "Image" },
  { key: "mdi:video", label: "Video" },
  { key: "tabler:photo", label: "Photo (Tabler)" },

  // Objects
  { key: "heroicons:puzzle-piece", label: "Puzzle" },
  { key: "heroicons:rectangle-stack", label: "Stack" },
  { key: "heroicons:squares-2x2", label: "Grid" },
  { key: "heroicons:flag", label: "Flag" },
  { key: "heroicons:beaker", label: "Beaker" },
  { key: "mdi:puzzle", label: "Puzzle (MDI)" },
  { key: "mdi:cube", label: "Cube (MDI)" },
  { key: "mdi:package", label: "Package" },
  { key: "tabler:puzzle", label: "Puzzle (Tabler)" },
  { key: "tabler:cube", label: "Cube (Tabler)" },
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
      toast.error("Nama kategori harus diisi", {
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

    setLoading(true);

    try {
      if (isEditMode && kategori) {
        await kategoriAplikasiService.update(kategori.id_kategori, formData);
        toast.success("Kategori berhasil diperbarui", {
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
      } else {
        await kategoriAplikasiService.create(formData);
        toast.success("Kategori berhasil ditambahkan", {
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
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving kategori:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Gagal menyimpan kategori", {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              {isEditMode
                ? "Perbarui informasi kategori aplikasi"
                : "Tambahkan kategori baru untuk mengelompokkan aplikasi"}
            </p>
          </ModalHeader>

          <ModalBody className="px-3 sm:px-6 py-4 sm:py-5">
            <div className="space-y-5">
              {/* Data Kategori Section */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Informasi Kategori
                </h4>
                <div className="space-y-4">
                  {/* Nama Kategori */}
                  <div className="space-y-1.5">
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
                      size="sm"
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                  </div>

                  {/* Icon and Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
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
                        size="sm"
                        classNames={{
                          trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                          value: "text-gray-900 dark:text-white",
                          popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                        }}
                      >
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon.key} textValue={icon.label}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1.5">
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
                        size="sm"
                        classNames={{
                          trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                          value: "text-gray-900 dark:text-white",
                          popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
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
                  <div className="space-y-1.5">
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
                      size="sm"
                      startContent={<FiHash className="text-gray-400 flex-shrink-0" />}
                      classNames={{
                        input: "text-gray-900 dark:text-white",
                        inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                      }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Urutan tampil kategori (angka kecil = prioritas atas)</p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Status
                </h4>
                <label
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.a_aktif
                      ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.a_aktif}
                    onChange={(e) => setFormData({ ...formData, a_aktif: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Status Aktif</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Kategori akan tampil di portal jika aktif
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={loading}
              className="font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isEditMode ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
