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
  Code,
} from "@heroui/react";
import {
  FiUser,
  FiActivity,
  FiClock,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiFileText,
} from "react-icons/fi";
import { loggerService, type JwtAccessLogDetail } from "@/lib/services/manakses/loggerService";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface JwtAccessLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

export default function JwtAccessLogDetailModal({
  isOpen,
  onClose,
  logId,
}: JwtAccessLogDetailModalProps) {
  const [log, setLog] = useState<JwtAccessLogDetail | null>(null);
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
      const data = await loggerService.getJwtAccessLogDetail(logId);
      setLog(data);
    } catch (err) {
      console.error('Error loading JWT access log:', err);
      setError('Gagal memuat detail log akses JWT');
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
            <FiActivity className="w-5 h-5 text-rose-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Detail Log Akses JWT</span>
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
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
                        color={log.a_berhasil ? "success" : "danger"}
                        startContent={log.a_berhasil ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                      >
                        {log.status}
                      </Chip>
                      <Chip size="sm" variant="flat" color="primary">
                        {log.method}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Access Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  Informasi Akses
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <FiActivity className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Menu Akses</p>
                      <p className="text-sm text-gray-900 dark:text-white break-all">
                        {log.menu_akses}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiClock className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Waktu Akses</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.waktu_akses)}
                        </p>
                      </div>
                    </div>
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
                      <FiCheckCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {log.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  {log.ket && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiFileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Keterangan</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {log.ket}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* JWT Token Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  Informasi JWT Token
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">Token Dibuat</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.jwt_waktu_create)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <FiClock className="w-4 h-4 text-red-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Token Expired</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.jwt_waktu_expired)}
                        </p>
                      </div>
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

              {/* Request & Response */}
              {(log.request_list || log.hasil_akses) && (
                <>
                  <Divider />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FiFileText className="w-4 h-4" />
                      Request & Response
                    </h4>
                    <div className="space-y-3">
                      {log.request_list && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Request Data</p>
                          <Code className="w-full text-xs p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-x-auto">
                            {log.request_list}
                          </Code>
                        </div>
                      )}
                      {log.hasil_akses && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Response Data</p>
                          <Code className="w-full text-xs p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-x-auto">
                            {log.hasil_akses}
                          </Code>
                        </div>
                      )}
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
