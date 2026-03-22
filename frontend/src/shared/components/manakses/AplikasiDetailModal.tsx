"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Tabs,
  Tab,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";
import { FiEdit2, FiInfo, FiList, FiUsers, FiDatabase, FiCalendar, FiSettings } from "react-icons/fi";
import { type AplikasiDetail } from "@/lib/services/manakses/aplikasiService";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { menuService, type Menu } from "@/lib/services/manakses/menuService";
import MenuTreeView from "./MenuTreeView";

interface AplikasiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  aplikasi: AplikasiDetail | null;
  isLoading: boolean;
  onEdit?: (aplikasi: AplikasiDetail) => void;
}

export default function AplikasiDetailModal({
  isOpen,
  onClose,
  aplikasi,
  isLoading,
  onEdit,
}: AplikasiDetailModalProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [menusLoaded, setMenusLoaded] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("info");
      setMenus([]);
      setMenusLoaded(false);
    }
  }, [isOpen]);

  // Load menus when tab changes to "menu"
  useEffect(() => {
    if (activeTab === "menu" && aplikasi && !menusLoaded) {
      loadMenus();
    }
  }, [activeTab, aplikasi, menusLoaded]);

  const loadMenus = async () => {
    if (!aplikasi) return;
    setMenusLoading(true);
    try {
      const result = await menuService.getByAplikasi(aplikasi.id_aplikasi, "tree");
      setMenus(result.menus);
      setMenusLoaded(true);
    } catch (error) {
      console.error("Error loading menus:", error);
    } finally {
      setMenusLoading(false);
    }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh] mx-2 sm:mx-4",
        body: "px-3 sm:px-6",
        header: "px-3 sm:px-6",
        footer: "px-3 sm:px-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Detail Aplikasi
          </h3>
          {aplikasi && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {aplikasi.nm_aplikasi}
            </p>
          )}
        </ModalHeader>
        <ModalBody className="py-4 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" color="primary" />
              <span className="ml-3 text-gray-500 dark:text-gray-400">Memuat detail...</span>
            </div>
          ) : aplikasi ? (
            <div className="space-y-4">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-2.5 sm:p-3 rounded-xl text-center border border-indigo-200/50 dark:border-indigo-700/30">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{aplikasi.jumlah_table || 0}</div>
                  <div className="text-[10px] sm:text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Tabel</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-2.5 sm:p-3 rounded-xl text-center border border-green-200/50 dark:border-green-700/30">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{aplikasi.jumlah_pj || 0}</div>
                  <div className="text-[10px] sm:text-xs text-green-600/70 dark:text-green-400/70 font-medium">PJ</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-2.5 sm:p-3 rounded-xl text-center border border-purple-200/50 dark:border-purple-700/30">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{menusLoaded ? menus.length : (aplikasi.menus?.length || 0)}</div>
                  <div className="text-[10px] sm:text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">Menu</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-2.5 sm:p-3 rounded-xl text-center border border-orange-200/50 dark:border-orange-700/30">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{aplikasi.urutan || 0}</div>
                  <div className="text-[10px] sm:text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">Urutan</div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                aria-label="Detail tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                classNames={{
                  tabList: "gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl flex-wrap sm:flex-nowrap",
                  cursor: "bg-white dark:bg-slate-600 shadow-sm",
                  tab: "max-w-fit px-2 sm:px-3 h-8 text-[10px] sm:text-xs font-medium",
                  tabContent: "group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400",
                }}
              >
                <Tab
                  key="info"
                  title={
                    <div className="flex items-center gap-1.5">
                      <FiInfo className="w-3.5 h-3.5" />
                      <span>Info</span>
                    </div>
                  }
                >
                  <div className="pt-4 space-y-4">
                    {/* Basic Info & Teknis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {/* Informasi Dasar */}
                      <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-600/50">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Informasi Dasar
                        </h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">ID Aplikasi</span>
                            <span className="text-gray-900 dark:text-white font-mono text-xs bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">{aplikasi.id_aplikasi.substring(0, 12)}...</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                            <Chip size="sm" color={aplikasi.status === "Aktif" ? "success" : "danger"} variant="flat">
                              {aplikasi.status}
                            </Chip>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Jenis</span>
                            <span className="text-gray-900 dark:text-white font-medium">{aplikasi.jenis || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Kategori</span>
                            <span className="text-gray-900 dark:text-white font-medium">{aplikasi.nm_kategori || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Organisasi</span>
                            <span className="text-gray-900 dark:text-white font-medium text-right max-w-[120px] sm:max-w-[150px] truncate" title={aplikasi.nm_organisasi || "-"}>{aplikasi.nm_organisasi || "-"}</span>
                          </div>
                          {aplikasi.ket_aplikasi && (
                            <div className="pt-1">
                              <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1.5 px-2">Keterangan:</span>
                              <p className="text-gray-800 dark:text-gray-200 text-xs bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-gray-200 dark:border-slate-600">{aplikasi.ket_aplikasi}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Teknis */}
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 sm:p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Informasi Teknis
                        </h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">URL</span>
                            <span className="text-right max-w-[140px] sm:max-w-[180px] truncate">
                              {aplikasi.url ? (
                                <a href={aplikasi.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-mono">
                                  {aplikasi.url}
                                </a>
                              ) : <span className="text-gray-400">-</span>}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Port</span>
                            <span className="text-gray-900 dark:text-white font-mono">{aplikasi.port || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Teknologi</span>
                            <span className="text-gray-900 dark:text-white">{aplikasi.teknologi || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">App Slug</span>
                            <span className="text-gray-900 dark:text-white font-mono text-xs">{aplikasi.app_slug || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                            <span className="text-gray-500 dark:text-gray-400">Endpoint WS</span>
                            <span className="text-gray-900 dark:text-white font-mono text-xs max-w-[120px] sm:max-w-[150px] truncate" title={aplikasi.endpoint_ws || "-"}>{aplikasi.endpoint_ws || "-"}</span>
                          </div>
                          {aplikasi.app_key && (
                            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                              <span className="text-gray-500 dark:text-gray-400">App Key</span>
                              <span className="text-gray-900 dark:text-white font-mono text-xs bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">{aplikasi.app_key.substring(0, 16)}...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pengaturan */}
                    <div className="bg-slate-50/80 dark:bg-slate-700/20 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-600/50">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <FiSettings className="w-4 h-4 text-slate-500" />
                        Pengaturan
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[
                          { label: "Production", active: aplikasi.a_live, color: "green" },
                          { label: "Portal", active: aplikasi.a_tampil_portal, color: "blue" },
                          { label: "myUnila", active: aplikasi.a_terintegrasi, color: "purple" },
                          { label: "SSO/CAS", active: aplikasi.a_integrasi_cas, color: "teal" },
                          { label: "Maintenance", active: aplikasi.a_maintenance, color: "yellow" },
                          { label: "Coming Soon", active: aplikasi.a_coming_soon, color: "cyan" },
                          { label: "Gen Menu", active: aplikasi.a_generate_menu, color: "indigo" },
                          { label: "Internal PT", active: aplikasi.a_sistem_internal_pt, color: "rose" },
                        ].map((flag) => (
                          <div key={flag.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${flag.active ? `bg-${flag.color}-50 dark:bg-${flag.color}-900/20 border-${flag.color}-200 dark:border-${flag.color}-800/30` : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${flag.active ? `bg-${flag.color}-500` : "bg-gray-300 dark:bg-slate-500"}`}></span>
                            <span className={`text-xs font-medium ${flag.active ? `text-${flag.color}-700 dark:text-${flag.color}-400` : "text-gray-500 dark:text-slate-400"}`}>{flag.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tanggal */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3 sm:p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-amber-500" />
                        Tanggal
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Dibuat</span>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(aplikasi.tgl_create)}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Update Terakhir</span>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(aplikasi.last_update)}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Sync Terakhir</span>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(aplikasi.last_sync)}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Expired</span>
                          <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(aplikasi.expired_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="menu"
                  title={
                    <div className="flex items-center gap-1.5">
                      <FiList className="w-3.5 h-3.5" />
                      <span>Menu</span>
                      <Chip size="sm" variant="flat" className="h-4 text-[10px] px-1">{menusLoaded ? menus.length : (aplikasi.menus?.length || 0)}</Chip>
                    </div>
                  }
                >
                  <div className="pt-4">
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 min-h-[200px] max-h-[400px] overflow-y-auto">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Daftar Menu Aplikasi
                      </h4>
                      <MenuTreeView
                        menus={menus}
                        loading={menusLoading}
                        readOnly={true}
                      />
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="pj"
                  title={
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3.5 h-3.5" />
                      <span>PJ</span>
                      <Chip size="sm" variant="flat" className="h-4 text-[10px] px-1">{aplikasi.pj_list?.length || 0}</Chip>
                    </div>
                  }
                >
                  <div className="pt-4">
                    {aplikasi.pj_list && aplikasi.pj_list.length > 0 ? (
                      <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30 max-h-[400px] overflow-y-auto">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2 sticky top-0 bg-green-50/90 dark:bg-green-900/30 py-1 -mt-1 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Penanggung Jawab ({aplikasi.pj_list.length})
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-green-200/50 dark:border-green-800/30">
                          <table className="w-full text-sm">
                            <thead className="bg-green-100/50 dark:bg-green-900/30 sticky top-0">
                              <tr>
                                <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Nama</th>
                                <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Username</th>
                                <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Email</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800/50">
                              {aplikasi.pj_list.map((pj) => (
                                <tr key={pj.id_pj_aplikasi} className="border-t border-green-100 dark:border-green-900/30">
                                  <td className="py-2 px-3 text-gray-900 dark:text-white">{pj.nm_pengguna}</td>
                                  <td className="py-2 px-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{pj.username}</td>
                                  <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{pj.email || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Belum ada penanggung jawab
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab
                  key="tables"
                  title={
                    <div className="flex items-center gap-1.5">
                      <FiDatabase className="w-3.5 h-3.5" />
                      <span>Tabel</span>
                      <Chip size="sm" variant="flat" className="h-4 text-[10px] px-1">{aplikasi.tables?.length || 0}</Chip>
                    </div>
                  }
                >
                  <div className="pt-4">
                    {aplikasi.tables && aplikasi.tables.length > 0 ? (
                      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/30 max-h-[400px] overflow-y-auto">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2 sticky top-0 bg-indigo-50/90 dark:bg-indigo-900/30 py-1 -mt-1 backdrop-blur-sm z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Tabel Akses ({aplikasi.tables.length})
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-indigo-200/50 dark:border-indigo-800/30">
                          <table className="w-full text-sm">
                            <thead className="bg-indigo-100/50 dark:bg-indigo-900/30 sticky top-8 z-[5]">
                              <tr>
                                <th className="text-left py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">Nama Tabel</th>
                                <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">GET</th>
                                <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">INSERT</th>
                                <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">UPDATE</th>
                                <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">DELETE</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800/50">
                              {aplikasi.tables.map((table) => (
                                <tr key={table.id_akses_table_app} className="border-t border-indigo-100 dark:border-indigo-900/30">
                                  <td className="py-2 px-3 text-gray-900 dark:text-white font-mono text-xs">{table.nm_table}</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_get ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_insert ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_update ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_delete ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Belum ada tabel akses
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Tab Organisasi Whitelist */}
                {aplikasi?.a_filter_organisasi && (
                  <Tab
                    key="organisasi"
                    title={
                      <div className="flex items-center gap-1.5">
                        <FiUsers className="w-3.5 h-3.5" />
                        <span>Organisasi</span>
                      </div>
                    }
                  >
                    <OrganisasiWhitelist aplikasiId={aplikasi?.id_aplikasi || ""} />
                  </Tab>
                )}
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Gagal memuat detail aplikasi
            </div>
          )}
        </ModalBody>
        <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="flat"
            onPress={onClose}
          >
            Tutup
          </Button>
          {aplikasi && onEdit && (
            <Button
              color="primary"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => onEdit(aplikasi)}
            >
              Edit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Organisasi Whitelist sub-component
function OrganisasiWhitelist({ aplikasiId }: { aplikasiId: string }) {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [adding, setAdding] = useState(false);

  const loadOrgs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authClient.get(`/manakses/aplikasi/${aplikasiId}/organisasi`);
      setOrgs(res.data.data || []);
    } catch (e) {
      console.error("Error loading orgs:", e);
    } finally {
      setLoading(false);
    }
  }, [aplikasiId]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await authClient.get("/manakses/unit-organisasi?limit=200");
      setAllUnits(res.data.data || []);
    } catch (e) {
      console.error("Error loading units:", e);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
    loadUnits();
  }, [loadOrgs, loadUnits]);

  const handleAdd = async () => {
    if (!selectedOrg) return;
    setAdding(true);
    try {
      await authClient.post(`/manakses/aplikasi/${aplikasiId}/organisasi`, {
        id_organisasi: selectedOrg,
        a_include_children: true,
      });
      toast.success("Organisasi berhasil ditambahkan");
      setSelectedOrg("");
      loadOrgs();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gagal menambah organisasi");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (orgId: string) => {
    try {
      await authClient.delete(`/manakses/aplikasi/${aplikasiId}/organisasi/${orgId}`);
      toast.success("Organisasi dihapus dari whitelist");
      loadOrgs();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gagal menghapus");
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;

  const existingOrgIds = orgs.map((o: any) => o.id_organisasi);
  const availableUnits = allUnits.filter((u: any) => !existingOrgIds.includes(u.id_organisasi));

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Hanya organisasi di bawah ini yang bisa mengakses aplikasi ini. Role universal (Mahasiswa, Dosen, Tendik, Rektor, dll) tetap bisa akses tanpa whitelist.
        </p>
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Select
          aria-label="Pilih Organisasi"
          placeholder="Pilih organisasi untuk ditambahkan..."
          selectedKeys={selectedOrg ? [selectedOrg] : []}
          onSelectionChange={(keys) => setSelectedOrg(Array.from(keys)[0] as string || "")}
          size="sm"
          variant="bordered"
          classNames={{ base: "flex-1" }}
        >
          {availableUnits.map((u: any) => (
            <SelectItem key={u.id_organisasi}>
              {u.nm_lemb}
            </SelectItem>
          ))}
        </Select>
        <Button
          size="sm"
          color="primary"
          startContent={<FiPlus className="w-3.5 h-3.5" />}
          onPress={handleAdd}
          isLoading={adding}
          isDisabled={!selectedOrg}
        >
          Tambah
        </Button>
      </div>

      {/* List */}
      {orgs.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Belum ada organisasi yang di-whitelist
        </div>
      ) : (
        <div className="space-y-2">
          {orgs.map((org: any) => (
            <div key={org.id_organisasi} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{org.nm_organisasi}</p>
                  {org.a_include_children ? (
                    <p className="text-xs text-gray-500">Termasuk sub-organisasi</p>
                  ) : null}
                </div>
              </div>
              <Button
                isIconOnly size="sm" variant="flat" color="danger"
                onPress={() => handleRemove(org.id_organisasi)}
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
