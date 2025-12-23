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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  FiUser,
  FiLock,
  FiClock,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
} from "react-icons/fi";
import { loggerService, type JwtLogDetail } from "@/lib/services/manakses/loggerService";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface JwtLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

export default function JwtLogDetailModal({
  isOpen,
  onClose,
  logId,
}: JwtLogDetailModalProps) {
  const [log, setLog] = useState<JwtLogDetail | null>(null);
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
      const data = await loggerService.getJwtLogDetail(logId);
      setLog(data);
    } catch (err) {
      console.error('Error loading JWT log:', err);
      setError('Gagal memuat detail log JWT');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
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
            <FiLock className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Detail Log JWT</span>
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
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
                        color={log.is_expired ? "danger" : "success"}
                        startContent={log.is_expired ? <FiXCircle className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
                      >
                        {log.status}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Token Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  Informasi Token
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiLock className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Token Value</p>
                      <p className="text-xs text-gray-900 dark:text-white font-mono break-all">
                        {log.token_value}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiClock className="w-4 h-4 text-green-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Waktu Dibuat</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.waktu_create)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiClock className="w-4 h-4 text-red-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Waktu Expired</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.waktu_expired)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {log.valid_durasi_menit !== null && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiClock className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Durasi Valid</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {log.valid_durasi_menit} menit
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">
                        {log.ip_address}
                      </p>
                    </div>
                  </div>
                  {log.url && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">URL</p>
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {log.url}
                        </p>
                      </div>
                    </div>
                  )}
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

              {/* Access Logs */}
              {log.access_logs && log.access_logs.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FiActivity className="w-4 h-4" />
                      Riwayat Akses ({log.access_logs.length} aktivitas)
                    </h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <Table
                        removeWrapper
                        aria-label="Access logs table"
                        classNames={{
                          th: "bg-gray-50 dark:bg-slate-700 text-xs font-semibold",
                          td: "text-sm",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>WAKTU</TableColumn>
                          <TableColumn>MENU</TableColumn>
                          <TableColumn>METHOD</TableColumn>
                          <TableColumn>STATUS</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {log.access_logs.map((access) => (
                            <TableRow key={access.id_log_akses_jwt}>
                              <TableCell className="font-mono text-xs">
                                {formatDateTime(access.waktu_akses)}
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={access.menu_akses}>
                                {access.menu_akses}
                              </TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat" color="primary">
                                  {access.method}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={access.a_berhasil ? "success" : "danger"}
                                >
                                  {access.a_berhasil ? "Berhasil" : "Gagal"}
                                </Chip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
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
