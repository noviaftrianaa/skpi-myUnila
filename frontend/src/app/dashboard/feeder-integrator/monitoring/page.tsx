"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Progress,
  Chip,
  Button,
  Badge,
} from "@heroui/react";
import {
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiZap,
  FiDatabase,
  FiTrendingUp,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { feederIntegratorMenuConfig } from "../config/menuConfig";

interface SyncProgress {
  id: string;
  entity: string;
  status: "running" | "completed" | "failed" | "queued";
  progress: number;
  current: number;
  total: number;
  speed: string;
  eta: string;
  startTime: string;
  errors: number;
  warnings: number;
}

export default function MonitoringPage() {
  useRequireAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  // Simulated real-time data
  const [syncProgresses, setSyncProgresses] = useState<SyncProgress[]>([
    {
      id: "1",
      entity: "Mahasiswa",
      status: "running",
      progress: 75,
      current: 11565,
      total: 15420,
      speed: "234 records/s",
      eta: "16s",
      startTime: "14:23:45",
      errors: 2,
      warnings: 5,
    },
    {
      id: "2",
      entity: "Nilai Mahasiswa",
      status: "running",
      progress: 42,
      current: 19012,
      total: 45230,
      speed: "512 records/s",
      eta: "51s",
      startTime: "14:24:12",
      errors: 0,
      warnings: 12,
    },
    {
      id: "3",
      entity: "Dosen",
      status: "completed",
      progress: 100,
      current: 856,
      total: 856,
      speed: "142 records/s",
      eta: "0s",
      startTime: "14:22:30",
      errors: 0,
      warnings: 0,
    },
    {
      id: "4",
      entity: "Kelas Kuliah",
      status: "queued",
      progress: 0,
      current: 0,
      total: 1250,
      speed: "-",
      eta: "-",
      startTime: "-",
      errors: 0,
      warnings: 0,
    },
    {
      id: "5",
      entity: "Mata Kuliah",
      status: "failed",
      progress: 23,
      current: 79,
      total: 342,
      speed: "-",
      eta: "-",
      startTime: "14:21:15",
      errors: 15,
      warnings: 3,
    },
  ]);

  // System metrics
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    networkIn: "12.3 MB/s",
    networkOut: "8.7 MB/s",
    queueSize: 47,
    activeWorkers: 8,
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSyncProgresses((prev) =>
        prev.map((item) => {
          if (item.status === "running" && item.progress < 100) {
            const newProgress = Math.min(item.progress + Math.random() * 10, 100);
            const newCurrent = Math.floor((newProgress / 100) * item.total);
            return {
              ...item,
              progress: newProgress,
              current: newCurrent,
              status: newProgress >= 100 ? "completed" : "running",
            };
          }
          return item;
        })
      );

      // Update system metrics
      setSystemMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(40, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 8)),
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "failed": return "danger";
      case "running": return "primary";
      case "queued": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <FiCheckCircle className="w-4 h-4" />;
      case "failed": return <FiXCircle className="w-4 h-4" />;
      case "running": return <FiRefreshCw className="w-4 h-4 animate-spin" />;
      case "queued": return <FiClock className="w-4 h-4" />;
      default: return <FiPause className="w-4 h-4" />;
    }
  };

  const totalRunning = syncProgresses.filter(s => s.status === "running").length;
  const totalCompleted = syncProgresses.filter(s => s.status === "completed").length;
  const totalFailed = syncProgresses.filter(s => s.status === "failed").length;
  const totalQueued = syncProgresses.filter(s => s.status === "queued").length;

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSync className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Monitoring"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiActivity className="w-7 h-7 text-primary-600" />
              Real-time Monitoring
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitor progress sinkronisasi secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? "solid" : "flat"}
              color="primary"
              startContent={autoRefresh ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Pause" : "Resume"} Auto-refresh
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<FiRefreshCw className="w-4 h-4" />}
            >
              Manual Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Chip size="sm" variant="flat" color="primary">
                  Running
                </Chip>
                <Badge content={totalRunning} color="primary" size="sm">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalRunning}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active syncs</p>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Chip size="sm" variant="flat" color="success">
                  Completed
                </Chip>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCompleted}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Success today</p>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Chip size="sm" variant="flat" color="danger">
                  Failed
                </Chip>
                <Badge content={totalFailed} color="danger" size="sm" isInvisible={totalFailed === 0}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                    <FiXCircle className="w-5 h-5" />
                  </div>
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalFailed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Errors today</p>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Chip size="sm" variant="flat" color="default">
                  Queued
                </Chip>
                <Badge content={totalQueued} color="warning" size="sm" isInvisible={totalQueued === 0}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white">
                    <FiClock className="w-5 h-5" />
                  </div>
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalQueued}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">In queue</p>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress List - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiDatabase className="w-5 h-5 text-primary-600" />
                  Sync Progress
                </h3>

                <div className="space-y-4">
                  {syncProgresses.map((sync) => (
                    <div
                      key={sync.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            sync.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : sync.status === "failed"
                              ? "bg-red-100 text-red-600"
                              : sync.status === "running"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {getStatusIcon(sync.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {sync.entity}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sync.current.toLocaleString()} / {sync.total.toLocaleString()} records
                            </p>
                          </div>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(sync.status)}
                          startContent={getStatusIcon(sync.status)}
                        >
                          {sync.status}
                        </Chip>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {sync.progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={sync.progress}
                          classNames={{
                            indicator: sync.status === "failed"
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : sync.status === "completed"
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600",
                          }}
                          size="sm"
                        />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Speed</p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <FiZap className="w-3 h-3" />
                            {sync.speed}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">ETA</p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {sync.eta}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Start Time</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {sync.startTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Issues</p>
                          <p className="font-semibold">
                            <span className="text-red-600">{sync.errors} errors</span>
                            {" / "}
                            <span className="text-yellow-600">{sync.warnings} warnings</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {sync.status === "running" && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button size="sm" color="warning" variant="flat">
                            Pause
                          </Button>
                          <Button size="sm" color="danger" variant="flat">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* System Metrics - 1/3 width */}
          <div className="space-y-6">
            {/* System Resources */}
            <Card className="border-none shadow-md">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  System Resources
                </h3>

                <div className="space-y-4">
                  {/* CPU */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {systemMetrics.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemMetrics.cpuUsage}
                      classNames={{
                        indicator: systemMetrics.cpuUsage > 70
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : systemMetrics.cpuUsage > 50
                          ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                          : "bg-gradient-to-r from-green-500 to-green-600",
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {systemMetrics.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemMetrics.memoryUsage}
                      classNames={{
                        indicator: systemMetrics.memoryUsage > 80
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : systemMetrics.memoryUsage > 60
                          ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                          : "bg-gradient-to-r from-green-500 to-green-600",
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Network */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Network In</span>
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        <FiTrendingUp className="w-3 h-3 text-green-600" />
                        {systemMetrics.networkIn}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Network Out</span>
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        <FiTrendingUp className="w-3 h-3 text-blue-600" />
                        {systemMetrics.networkOut}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Queue Info */}
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Queue Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Queue Size</span>
                    <Badge content={systemMetrics.queueSize} color="primary" size="lg">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {systemMetrics.queueSize}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Workers</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {systemMetrics.activeWorkers} / 10
                    </span>
                  </div>
                  <Progress
                    value={(systemMetrics.activeWorkers / 10) * 100}
                    classNames={{
                      indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                    }}
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Auto Refresh Info */}
            <Card className="border-none shadow-md">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {autoRefresh ? "Auto-refresh Active" : "Auto-refresh Paused"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Refresh interval: {refreshInterval}s
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
