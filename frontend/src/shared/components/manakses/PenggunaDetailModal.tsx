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
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FiUser className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Detail Pengguna</span>
          </div>
        </ModalHeader>
        <ModalBody className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : pengguna ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {pengguna.nm_pengguna?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {pengguna.nm_pengguna}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      @{pengguna.username}
                    </p>
                    <div className="flex gap-2 mt-2">
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

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Informasi Kontak
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {pengguna.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <FiPhone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">No. HP</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {pengguna.no_hp || pengguna.no_tel || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <FiMapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Alamat</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {pengguna.alamat || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Lahir</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {pengguna.tempat_lahir ? `${pengguna.tempat_lahir}, ` : ""}
                        {formatDate(pengguna.tgl_lahir)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Roles / Peran */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Peran & Unit Organisasi ({pengguna.roles?.length || 0})
                </h4>
                {pengguna.roles && pengguna.roles.length > 0 ? (
                  <div className="space-y-3">
                    {pengguna.roles.map((role, index) => (
                      <div
                        key={role.id_role_pengguna || index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
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
                            {role.nm_organisasi && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <FiGlobe className="w-3 h-3" />
                                {role.nm_organisasi}
                              </p>
                            )}
                            {role.last_active && (
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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
                  <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    Belum ada peran yang ditetapkan
                  </div>
                )}
              </div>

              <Divider />

              {/* Activity Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Aktivitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Terdaftar</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(pengguna.tgl_create)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Terakhir Update</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(pengguna.last_update)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Terakhir Login</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(pengguna.last_login_at)}
                    </p>
                    {pengguna.last_login_ip && (
                      <p className="text-xs text-gray-500">
                        IP: {pengguna.last_login_ip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="flat" onPress={onClose}>
            Tutup
          </Button>
          {pengguna && onEdit && (
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
              onPress={() => onEdit(pengguna)}
            >
              Edit Pengguna
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
