"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
  Divider,
} from "@heroui/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { penggunaService, type PenggunaDetail } from "@/lib/services/manakses/penggunaService";

interface PenggunaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  penggunaId: string | null;
  onEdit?: (pengguna: PenggunaDetail) => void;
}

export default function PenggunaDetailModal({
  isOpen,
  onClose,
  penggunaId,
  onEdit,
}: PenggunaDetailModalProps) {
  const [pengguna, setPengguna] = useState<PenggunaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && penggunaId) {
      loadPengguna();
    }
  }, [isOpen, penggunaId]);

  const loadPengguna = async () => {
    if (!penggunaId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await penggunaService.getDetail(penggunaId);
      setPengguna(data);
    } catch (err) {
      console.error('Error loading pengguna:', err);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[85vh]",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-5 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiUser className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Detail Pengguna</span>
          </div>
        </ModalHeader>
        <ModalBody className="px-5 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : pengguna ? (
            <div className="space-y-4">
              {/* Header Info - More compact */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {pengguna.nm_pengguna?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {pengguna.nm_pengguna}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      @{pengguna.username}
                    </p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={pengguna.a_aktif && !pengguna.disable ? "success" : "danger"}
                      >
                        {pengguna.status}
                      </Chip>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={pengguna.has_sso ? "primary" : "warning"}
                      >
                        {pengguna.sumber_data}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info - More compact grid */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Informasi Kontak
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">Email</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {pengguna.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">No. HP</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {pengguna.no_hp || pengguna.no_tel || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">Alamat</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {pengguna.alamat || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">Tanggal Lahir</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {pengguna.tempat_lahir ? `${pengguna.tempat_lahir}, ` : ""}
                        {formatDate(pengguna.tgl_lahir)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-2" />

              {/* Roles / Peran - Compact list */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiShield className="w-3.5 h-3.5" />
                  Peran & Unit Organisasi ({pengguna.roles?.length || 0})
                </h4>
                {pengguna.roles && pengguna.roles.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {pengguna.roles.map((role, index) => (
                      <div
                        key={role.id_role_pengguna || index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {role.nm_peran}
                              </span>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={role.approval_peran ? "success" : "warning"}
                                className="h-5"
                              >
                                {role.approval_peran ? "Approved" : "Pending"}
                              </Chip>
                            </div>
                            {(role.display_organisasi || role.nm_organisasi) && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <FiGlobe className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{role.display_organisasi || role.nm_organisasi}</span>
                              </p>
                            )}
                            {role.last_active && (
                              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                Terakhir aktif: {formatDateTime(role.last_active)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    Belum ada peran yang ditetapkan
                  </div>
                )}
              </div>

              <Divider className="my-2" />

              {/* Activity Info - Compact */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Aktivitas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">Terdaftar</p>
                    <p className="font-medium text-gray-900 dark:text-white text-[11px]">
                      {formatDateTime(pengguna.tgl_create)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">Terakhir Update</p>
                    <p className="font-medium text-gray-900 dark:text-white text-[11px]">
                      {formatDateTime(pengguna.last_update)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">Terakhir Login</p>
                    <p className="font-medium text-gray-900 dark:text-white text-[11px]">
                      {formatDateTime(pengguna.last_login_at)}
                    </p>
                    {pengguna.last_login_ip && (
                      <p className="text-[10px] text-gray-500">
                        IP: {pengguna.last_login_ip}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">Ganti Password</p>
                    <p className="font-medium text-gray-900 dark:text-white text-[11px]">
                      {formatDateTime(pengguna.tgl_ganti_pwd)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="gap-2 px-5 py-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
          <Button variant="flat" onPress={onClose} size="sm">
            Tutup
          </Button>
          {pengguna && onEdit && (
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
              onPress={() => onEdit(pengguna)}
              size="sm"
            >
              Edit Pengguna
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
