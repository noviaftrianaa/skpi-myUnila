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
  FiLogIn,
  FiLogOut,
  FiClock,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { loggerService, type LoginLogDetail } from "@/lib/services/manakses/loggerService";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface LoginLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

export default function LoginLogDetailModal({
  isOpen,
  onClose,
  logId,
}: LoginLogDetailModalProps) {
  const [log, setLog] = useState<LoginLogDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && logId) {
      loadLog();
    }
  }, [isOpen, logId]);

  const loadLog = async () => {
    if (!logId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await loggerService.getLoginLogDetail(logId);
      setLog(data);
    } catch (err) {
      console.error('Error loading login log:', err);
      setError('Gagal memuat detail log login');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy HH:mm:ss", { locale: localeId });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number | null, seconds: number | null) => {
    if (minutes === null || minutes === undefined) return "-";
    if (minutes < 60) {
      return `${minutes} menit ${seconds || 0} detik`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit ${seconds || 0} detik`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4 max-h-[85vh]",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-5 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiLogIn className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Detail Log Login</span>
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
          ) : log ? (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {log.nm_pengguna?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {log.nm_pengguna}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      @{log.username}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={log.a_sesi_aktif ? "success" : "default"}
                        startContent={log.a_sesi_aktif ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                      >
                        {log.status_sesi}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* User Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Informasi Pengguna
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiUser className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {log.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiUser className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Jabatan</p>
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {log.jabatan || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Application Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  Informasi Aplikasi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nama Aplikasi</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {log.nm_aplikasi}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">App Key</p>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">
                        {log.app_key}
                      </p>
                    </div>
                  </div>
                  {log.aplikasi_url && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:col-span-2">
                      <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">URL Aplikasi</p>
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {log.aplikasi_url}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Session Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Informasi Sesi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiLogIn className="w-4 h-4 text-green-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Waktu Login</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDateTime(log.waktu_login)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiLogOut className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Waktu Logout</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDateTime(log.waktu_logout)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiClock className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Durasi Sesi</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(log.durasi_menit, log.durasi_detik)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiCheckCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status Sesi</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {log.status_sesi}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Device Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiMonitor className="w-4 h-4" />
                  Informasi Perangkat
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">
                        {log.ip_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiMonitor className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Browser</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {log.browser || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg md:col-span-2">
                    <FiSmartphone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sistem Operasi</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {log.os || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 dark:border-slate-700 flex-shrink-0 px-5 py-3">
          <Button
            color="default"
            variant="flat"
            onPress={onClose}
          >
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
