"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "@heroui/react";
import {
  FiClock,
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  schedulerService,
  type ScheduledSync,
} from "@/lib/services/myunila/management/schedulerService";
import ScheduleModal from "./ScheduleModal";

interface ScheduleListProps {
  syncType?: "pegawai" | "radius" | "unit_organisasi";
  endpointKey?: string;
  showCreateButton?: boolean;
}

export default function ScheduleList({
  syncType,
  endpointKey,
  showCreateButton = true,
}: ScheduleListProps) {
  const [schedules, setSchedules] = useState<ScheduledSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledSync | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulerService.getSchedules({
        page: 1,
        limit: 100,
        sync_type: syncType,
        // is_active: undefined means get all (both active and inactive)
      });

      // Filter by endpoint if specified
      let filteredSchedules = response.data;
      if (endpointKey) {
        filteredSchedules = filteredSchedules.filter(
          (s) => s.endpoint_key === endpointKey
        );
      }

      setSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [syncType, endpointKey]);

  const handleToggle = async (schedule: ScheduledSync) => {
    try {
      await schedulerService.toggleSchedule(schedule.id, !schedule.is_active);
      await loadSchedules();
    } catch (error: any) {
      console.error("Error toggling schedule:", error);
      alert(error.response?.data?.message || "Gagal toggle schedule");
    }
  };

  const handleDelete = async (schedule: ScheduledSync) => {
    if (!confirm(`Yakin ingin menghapus schedule "${schedule.name}"?`)) {
      return;
    }

    try {
      await schedulerService.deleteSchedule(schedule.id);
      await loadSchedules();
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      alert(error.response?.data?.message || "Gagal menghapus schedule");
    }
  };

  const handleEdit = (schedule: ScheduledSync) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSchedule(undefined);
  };

  const handleModalSuccess = () => {
    loadSchedules();
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScheduleTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSyncTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pegawai: "Pegawai SIKEP",
      radius: "Radius SSO",
      unit_organisasi: "Unit Organisasi",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-slate-700">
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">
            Loading schedules...
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200 dark:border-slate-700">
        <CardBody className="p-0">
          {/* Header - Always Visible */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-unit-8 w-8 h-8"
              >
                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Scheduled Syncs
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {schedules?.length || 0} schedule(s) terdaftar
                </p>
              </div>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Tooltip content="Refresh">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={loadSchedules}
                >
                  <FiRefreshCw />
                </Button>
              </Tooltip>
              {showCreateButton && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
                  onPress={() => setIsModalOpen(true)}
                >
                  + Buat Schedule
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-slate-700">

          {!schedules || schedules.length === 0 ? (
            <div className="text-center py-8">
              <FiClock className="mx-auto text-4xl text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400">
                Belum ada schedule terdaftar
              </p>
              {showCreateButton && (
                <Button
                  size="sm"
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onPress={() => setIsModalOpen(true)}
                >
                  Buat Schedule Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  {/* Status Indicator */}
                  <div className="pt-1">
                    {schedule.is_active ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                  </div>

                  {/* Schedule Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {schedule.name}
                        </h4>
                        {schedule.description && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={schedule.is_active ? "success" : "default"}
                      >
                        {schedule.is_active ? "Active" : "Inactive"}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {/* Type */}
                      <div>
                        <p className="text-gray-500 dark:text-slate-500 text-xs">
                          Tipe
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium capitalize">
                          {getSyncTypeLabel(schedule.sync_type)}
                        </p>
                      </div>

                      {/* Endpoint (if exists) */}
                      {schedule.endpoint_key && (
                        <div>
                          <p className="text-gray-500 dark:text-slate-500 text-xs">
                            Endpoint
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {schedule.endpoint_key.replace(/_/g, " ")}
                          </p>
                        </div>
                      )}

                      {/* Schedule Time */}
                      <div>
                        <p className="text-gray-500 dark:text-slate-500 text-xs flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          Jam Eksekusi
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatScheduleTime(schedule.schedule_time)}
                        </p>
                      </div>

                      {/* Last Run */}
                      <div>
                        <p className="text-gray-500 dark:text-slate-500 text-xs flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          Terakhir Dijalankan
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {schedule.last_run_at
                            ? formatDateTime(schedule.last_run_at)
                            : "Belum pernah"}
                        </p>
                      </div>

                      {/* Next Run */}
                      <div>
                        <p className="text-gray-500 dark:text-slate-500 text-xs">
                          Jadwal Berikutnya
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDateTime(schedule.next_run_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <FiMoreVertical />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Schedule actions">
                      <DropdownItem
                        key="toggle"
                        startContent={
                          schedule.is_active ? (
                            <FiToggleLeft />
                          ) : (
                            <FiToggleRight />
                          )
                        }
                        onPress={() => handleToggle(schedule)}
                      >
                        {schedule.is_active
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<FiEdit2 />}
                        onPress={() => handleEdit(schedule)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<FiTrash2 />}
                        onPress={() => handleDelete(schedule)}
                      >
                        Hapus
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
            </div>
          )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal for Create/Edit */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        syncType={syncType || "unit_organisasi"}
        endpointKey={endpointKey}
        schedule={editingSchedule}
      />
    </>
  );
}
