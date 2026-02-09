"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Checkbox,
  Tabs,
  Tab,
  Input,
} from "@heroui/react";
import {
  FiDatabase,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { BsCloudUpload, BsCloudDownload } from "react-icons/bs";
import { feederIntegratorMenuConfig } from "../config/menuConfig";

const APP_KEY = "feeder-integrator";

interface SyncEntity {
  id: string;
  name: string;
  table: string;
  totalRecords: number;
  lastSync: string;
  status: "idle" | "syncing" | "success" | "error";
  direction: "upload" | "download" | "both";
  priority: "high" | "medium" | "low";
  syncDuration?: string;
  errorCount?: number;
}

export default function SyncManagementPage() {
  useRequireAuth();
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const syncEntities: SyncEntity[] = [
    {
      id: "mahasiswa",
      name: "Data Mahasiswa",
      table: "mahasiswa",
      totalRecords: 15420,
      lastSync: "2 menit yang lalu",
      status: "success",
      direction: "both",
      priority: "high",
      syncDuration: "12.3s",
    },
    {
      id: "dosen",
      name: "Data Dosen",
      table: "dosen",
      totalRecords: 856,
      lastSync: "15 menit yang lalu",
      status: "success",
      direction: "both",
      priority: "high",
      syncDuration: "3.2s",
    },
    {
      id: "matakuliah",
      name: "Mata Kuliah",
      table: "matakuliah",
      totalRecords: 342,
      lastSync: "30 menit yang lalu",
      status: "idle",
      direction: "upload",
      priority: "medium",
    },
    {
      id: "kelas",
      name: "Kelas Kuliah",
      table: "kelas_kuliah",
      totalRecords: 1250,
      lastSync: "Sedang berjalan",
      status: "syncing",
      direction: "upload",
      priority: "high",
    },
    {
      id: "nilai",
      name: "Nilai Mahasiswa",
      table: "nilai_mahasiswa",
      totalRecords: 45230,
      lastSync: "1 jam yang lalu",
      status: "error",
      direction: "upload",
      priority: "high",
      errorCount: 23,
    },
    {
      id: "kurikulum",
      name: "Kurikulum",
      table: "kurikulum",
      totalRecords: 45,
      lastSync: "2 jam yang lalu",
      status: "success",
      direction: "both",
      priority: "low",
      syncDuration: "1.5s",
    },
    {
      id: "ruang",
      name: "Data Ruangan",
      table: "ruang",
      totalRecords: 128,
      lastSync: "3 jam yang lalu",
      status: "idle",
      direction: "upload",
      priority: "low",
    },
    {
      id: "prodi",
      name: "Program Studi",
      table: "prodi",
      totalRecords: 23,
      lastSync: "1 hari yang lalu",
      status: "success",
      direction: "download",
      priority: "medium",
      syncDuration: "0.8s",
    },
  ];

  const filteredEntities = syncEntities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.table.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "upload") return matchesSearch && entity.direction !== "download";
    if (activeTab === "download") return matchesSearch && entity.direction !== "upload";
    if (activeTab === "high") return matchesSearch && entity.priority === "high";

    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedEntities.length === filteredEntities.length) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(filteredEntities.map(e => e.id));
    }
  };

  const handleSelectEntity = (id: string) => {
    if (selectedEntities.includes(id)) {
      setSelectedEntities(selectedEntities.filter(e => e !== id));
    } else {
      setSelectedEntities([...selectedEntities, id]);
    }
  };

  const handleSyncSelected = () => {
    console.log("Syncing:", selectedEntities);
    // Implement sync logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "error": return "danger";
      case "syncing": return "primary";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <FiCheckCircle className="w-4 h-4" />;
      case "error": return <FiAlertCircle className="w-4 h-4" />;
      case "syncing": return <FiRefreshCw className="w-4 h-4 animate-spin" />;
      default: return <FiPause className="w-4 h-4" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "upload": return <BsCloudUpload className="w-4 h-4" />;
      case "download": return <BsCloudDownload className="w-4 h-4" />;
      default: return <FiRefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Feeder Integrator"
      appIcon={<FiDatabase className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={feederIntegratorMenuConfig}
      pageTitle="Sync"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sync Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola sinkronisasi data dengan PDDIKTI Feeder
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              variant="flat"
              startContent={<FiRefreshCw className="w-4 h-4" />}
            >
              Refresh Status
            </Button>
            <Button
              color="primary"
              startContent={<FiPlay className="w-4 h-4" />}
              isDisabled={selectedEntities.length === 0}
              onClick={handleSyncSelected}
            >
              Sync Selected ({selectedEntities.length})
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-none shadow-md">
          <CardBody className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="light"
                color="primary"
              >
                <Tab key="all" title="All Entities" />
                <Tab key="upload" title={
                  <div className="flex items-center gap-2">
                    <BsCloudUpload className="w-4 h-4" />
                    <span>Upload</span>
                  </div>
                } />
                <Tab key="download" title={
                  <div className="flex items-center gap-2">
                    <BsCloudDownload className="w-4 h-4" />
                    <span>Download</span>
                  </div>
                } />
                <Tab key="high" title="High Priority" />
              </Tabs>

              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                className="max-w-xs"
                size="sm"
              />
            </div>
          </CardBody>
        </Card>

        {/* Entities Grid */}
        <div className="space-y-3">
          {/* Select All */}
          <Card className="border-none shadow-sm bg-gray-50 dark:bg-gray-800/50">
            <CardBody className="p-3">
              <div className="flex items-center justify-between">
                <Checkbox
                  isSelected={selectedEntities.length === filteredEntities.length && filteredEntities.length > 0}
                  isIndeterminate={selectedEntities.length > 0 && selectedEntities.length < filteredEntities.length}
                  onChange={handleSelectAll}
                >
                  <span className="text-sm font-medium">
                    Select All ({filteredEntities.length} entities)
                  </span>
                </Checkbox>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{selectedEntities.length} selected</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Entity Cards */}
          {filteredEntities.map((entity) => (
            <Card
              key={entity.id}
              className={`border-none shadow-md hover:shadow-lg transition-all ${
                selectedEntities.includes(entity.id)
                  ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : ""
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    isSelected={selectedEntities.includes(entity.id)}
                    onChange={() => handleSelectEntity(entity.id)}
                    className="mt-1"
                  />

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    entity.priority === "high"
                      ? "bg-gradient-to-br from-red-500 to-orange-600"
                      : entity.priority === "medium"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-gray-500 to-gray-600"
                  } text-white`}>
                    <FiDatabase className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {entity.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Table: {entity.table}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(entity.status)}
                          startContent={getStatusIcon(entity.status)}
                        >
                          {entity.status}
                        </Chip>
                        <Chip size="sm" variant="flat" startContent={getDirectionIcon(entity.direction)}>
                          {entity.direction}
                        </Chip>
                        <Chip
                          size="sm"
                          variant="dot"
                          color={
                            entity.priority === "high"
                              ? "danger"
                              : entity.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                        >
                          {entity.priority}
                        </Chip>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Records</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entity.totalRecords.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entity.lastSync}
                        </p>
                      </div>
                      {entity.syncDuration && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {entity.syncDuration}
                          </p>
                        </div>
                      )}
                      {entity.errorCount && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
                          <p className="text-sm font-semibold text-red-600">
                            {entity.errorCount} failed
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress bar for syncing */}
                    {entity.status === "syncing" && (
                      <Progress
                        value={65}
                        className="mb-3"
                        classNames={{
                          indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                        }}
                        size="sm"
                      />
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FiPlay className="w-3 h-3" />}
                        isDisabled={entity.status === "syncing"}
                      >
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<FiRefreshCw className="w-3 h-3" />}
                      >
                        Check Status
                      </Button>
                      {entity.errorCount && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<FiAlertCircle className="w-3 h-3" />}
                        >
                          View Errors
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEntities.length === 0 && (
          <Card className="border-none shadow-md">
            <CardBody className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FiDatabase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No entities found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
