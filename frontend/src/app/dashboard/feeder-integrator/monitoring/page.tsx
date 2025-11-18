"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederMonitoringService as monitoringService, type SyncProgress, type MonitoringStats } from "@/lib/services/feederMonitoringService";
import { Card, CardBody, Spinner, Progress, Chip } from "@heroui/react";
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiZap,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function MonitoringPage() {
  useRequireAuth();

  const [activeSyncs, setActiveSyncs] = useState<SyncProgress[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = useCallback(async () => {
    try {
      const data = await monitoringService.getActiveSyncs();
      setActiveSyncs(data.active_syncs || []);
      setStats(data.stats);
      setLastUpdate(new Date(data.updated_at));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      if (isLoading) {
        toast.error("Gagal memuat data monitoring");
      }
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial fetch
  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoringData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "primary";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <FiRefreshCw className="w-4 h-4 animate-spin" />;
      case "completed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "failed":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const formatDuration = (startedAt: string) => {
    try {
      const started = new Date(startedAt);
      return formatDistanceToNow(started, { addSuffix: true, locale: localeId });
    } catch {
      return "-";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <DashboardLayout
      menuConfig={feederIntegratorMenuConfig}
      appName="Feeder Integrator"
      appIcon={<FiActivity className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiActivity className="w-8 h-8 text-blue-600" />
              Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time monitoring proses sinkronisasi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Update: {formatTime(lastUpdate.toISOString())}
            </div>
            <Chip
              size="sm"
              color={autoRefresh ? "success" : "default"}
              variant="flat"
              startContent={autoRefresh ? <FiZap className="w-3 h-3" /> : null}
              className="cursor-pointer"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Chip>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Syncs */}
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiRefreshCw className={`w-7 h-7 text-white ${stats.active_syncs > 0 ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-100">Active Syncs</p>
                    <h3 className="text-3xl font-bold text-white">{stats.active_syncs}</h3>
                    <p className="text-[10px] text-blue-100/80">Proses berjalan</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Completed Today */}
            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-100">Completed Today</p>
                    <h3 className="text-3xl font-bold text-white">{stats.completed_today}</h3>
                    <p className="text-[10px] text-green-100/80">Berhasil hari ini</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Failed Today */}
            <Card className="bg-gradient-to-br from-red-500 via-red-600 to-pink-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiXCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-red-100">Failed Today</p>
                    <h3 className="text-3xl font-bold text-white">{stats.failed_today}</h3>
                    <p className="text-[10px] text-red-100/80">Gagal hari ini</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Active Syncs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Sync Operations
            </h2>
            {activeSyncs.length > 0 && (
              <Chip size="sm" color="primary" variant="flat">
                {activeSyncs.length} active
              </Chip>
            )}
          </div>

          {activeSyncs.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardBody className="p-12">
                <div className="text-center">
                  <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Tidak ada proses sinkronisasi yang sedang berjalan
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Data akan muncul otomatis saat ada proses sync
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeSyncs.map((sync) => (
                <Card
                  key={sync.id}
                  className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <CardBody className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {sync.endpoint_name}
                            </h3>
                            <Chip
                              size="sm"
                              color={getStatusColor(sync.status)}
                              variant="flat"
                              startContent={getStatusIcon(sync.status)}
                              className="capitalize"
                            >
                              {sync.status}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {formatDuration(sync.started_at)}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{sync.endpoint_key}</span>
                            <span>•</span>
                            <span className="capitalize">{sync.sync_type}</span>
                            <span>•</span>
                            <span>by {sync.synced_by}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {sync.progress}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {sync.current_record.toLocaleString()} / {sync.total_records.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <Progress
                          value={sync.progress}
                          color={getStatusColor(sync.status)}
                          size="md"
                          className="w-full"
                        />
                      </div>

                      {/* Message */}
                      <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <FiAlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {sync.message}
                        </p>
                      </div>

                      {/* Error */}
                      {sync.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <FiXCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-mono">
                              {sync.error}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
