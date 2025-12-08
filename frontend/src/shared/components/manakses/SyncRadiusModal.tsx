"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Card,
  CardBody,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiDatabase,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { syncService, type SyncProgress, type SyncLog, type RadiusStats } from "@/lib/services/manakses/syncService";

interface SyncRadiusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export default function SyncRadiusModal({
  isOpen,
  onClose,
  onSyncComplete,
}: SyncRadiusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [radiusStats, setRadiusStats] = useState<RadiusStats | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    stats?: Record<string, number>;
  } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statusData, logsData, statsData] = await Promise.all([
        syncService.getStatus(),
        syncService.getLogs(5),
        syncService.getRadiusStats(),
      ]);

      setProgress(statusData.progress);
      setIsSyncing(statusData.is_running);
      setLogs(logsData.logs);
      setRadiusStats(statsData);

      // Start polling if sync is running
      if (statusData.is_running) {
        startPolling();
      }
    } catch (err: unknown) {
      console.error('Error loading sync data:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data sync');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for progress updates
  const pollProgress = useCallback(async () => {
    try {
      const statusData = await syncService.getStatus();
      setProgress(statusData.progress);
      setIsSyncing(statusData.is_running);

      // Stop polling if sync completed
      if (!statusData.is_running && statusData.progress.status !== 'running') {
        stopPolling();
        // Reload logs
        const logsData = await syncService.getLogs(5);
        setLogs(logsData.logs);

        // Notify parent of completion
        if (statusData.progress.status === 'completed') {
          onSyncComplete?.();
        }
      }
    } catch (err) {
      console.error('Error polling progress:', err);
    }
  }, [onSyncComplete]);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(pollProgress, 2000);
  }, [pollProgress]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isOpen, loadInitialData, stopPolling]);

  // Start sync
  const handleStartSync = async () => {
    setError(null);
    setSyncResult(null);
    setIsSyncing(true);

    try {
      // Start sync in background
      await syncService.startSyncBackground();

      // Start polling for progress
      startPolling();

    } catch (err: unknown) {
      console.error('Error starting sync:', err);
      setError(err instanceof Error ? err.message : 'Gagal memulai sync');
      setIsSyncing(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format duration from ms
  const formatDurationMs = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    return formatDuration(seconds);
  };

  // Get status color
  const getStatusColor = (status: string): "success" | "danger" | "warning" | "primary" => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'running':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isSyncing}
      hideCloseButton={isSyncing}
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-gray-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isSyncing
                ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                : "bg-gradient-to-br from-blue-500 to-cyan-600"
            }`}>
              <MdSync className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Sync Data dari Radius
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                Sinkronisasi data pengguna dari SSO ke Manajemen Akses
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <FiAlertCircle className="w-8 h-8 text-danger" />
              </div>
              <p className="text-danger font-medium mb-4">{error}</p>
              <Button
                color="primary"
                variant="flat"
                onPress={loadInitialData}
                startContent={<FiRefreshCw className="w-4 h-4" />}
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Radius Stats */}
              {radiusStats && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FiDatabase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-800 dark:text-white">Database Radius (SSO)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total User Aktif</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {radiusStats.total_active.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">By Domain (Top 5)</p>
                      <div className="space-y-1">
                        {radiusStats.by_domain.slice(0, 5).map((item) => (
                          <div key={item.domain} className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">@{item.domain}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sync Progress */}
              {isSyncing && progress && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                      <span className="font-semibold text-gray-800 dark:text-white">Sync Sedang Berjalan</span>
                    </div>
                    <Chip size="sm" color="primary" variant="flat">
                      Chunk {progress.current_chunk}/{progress.total_chunks}
                    </Chip>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {progress.percentage}%
                      </span>
                    </div>
                    <Progress
                      aria-label="Sync progress"
                      value={progress.percentage}
                      color="primary"
                      className="h-2"
                      classNames={{
                        indicator: "animate-pulse",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="font-bold text-gray-800 dark:text-white">{progress.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Diproses</p>
                      <p className="font-bold text-gray-800 dark:text-white">{progress.processed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Berhasil</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{progress.success.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gagal</p>
                      <p className="font-bold text-red-600 dark:text-red-400">{progress.failed.toLocaleString()}</p>
                    </div>
                  </div>

                  {progress.elapsed_time > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>Waktu berjalan: {formatDuration(progress.elapsed_time)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sync Result */}
              {syncResult && (
                <div className={`p-4 rounded-xl border ${
                  syncResult.success
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {syncResult.success ? (
                      <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                    <p className={`font-semibold ${
                      syncResult.success
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }`}>
                      {syncResult.message}
                    </p>
                  </div>
                  {syncResult.stats && (
                    <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mahasiswa</p>
                        <p className="font-bold text-gray-800 dark:text-white">{syncResult.stats.mahasiswa?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dosen</p>
                        <p className="font-bold text-gray-800 dark:text-white">{syncResult.stats.dosen?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tendik</p>
                        <p className="font-bold text-gray-800 dark:text-white">{syncResult.stats.tendik?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Guest</p>
                        <p className="font-bold text-gray-800 dark:text-white">{syncResult.stats.guest?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Divider className="my-4" />

              {/* Recent Sync Logs */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                  <FiClock className="w-4 h-4" />
                  Riwayat Sync Terakhir
                </h4>
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    Belum ada riwayat sync
                  </p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              color={getStatusColor(log.status)}
                              variant="flat"
                            >
                              {log.status}
                            </Chip>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(log.synced_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Total: <span className="font-semibold text-gray-700 dark:text-gray-300">{log.total_records.toLocaleString()}</span></span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">+{log.inserted_count.toLocaleString()}</span>
                            {log.failed_count > 0 && (
                              <span className="text-red-600 dark:text-red-400 font-semibold">-{log.failed_count}</span>
                            )}
                            <span>{formatDurationMs(log.duration_ms)}</span>
                          </div>
                        </div>
                        {log.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{log.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isSyncing}
            className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Tutup
          </Button>
          <Button
            color="primary"
            onPress={handleStartSync}
            isDisabled={isSyncing || isLoading}
            startContent={isSyncing ? <Spinner size="sm" color="white" /> : <FiRefreshCw className="w-4 h-4" />}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isSyncing ? 'Sync Berjalan...' : 'Mulai Sinkronisasi'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
