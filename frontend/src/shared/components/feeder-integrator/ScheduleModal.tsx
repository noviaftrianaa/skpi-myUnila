"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
} from "@heroui/react";
import { FiClock, FiCalendar } from "react-icons/fi";
import {
  schedulerService,
  type CreateScheduleRequest,
  type ScheduledSync,
} from "@/lib/services/feeder/management/schedulerService";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  syncType: "mahasiswa" | "aktivitas_mahasiswa" | "kurikulum";
  schedule?: ScheduledSync; // For edit mode
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  syncType,
  schedule,
}: ScheduleModalProps) {
  const { user } = useAuth();
  const isEditMode = !!schedule;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule_date: "",
    schedule_time: "02:00",
    is_active: true,
  });

  // Initialize form data for edit mode
  useEffect(() => {
    if (schedule) {
      // Parse schedule_time to get date and time in UTC
      const scheduleDateTime = new Date(schedule.schedule_time || "");

      // Convert UTC to WIB (UTC+7)
      const wibDateTime = new Date(scheduleDateTime.getTime() + (7 * 60 * 60 * 1000));
      const date = wibDateTime.toISOString().split("T")[0];
      const hours = wibDateTime.getUTCHours();
      const minutes = wibDateTime.getUTCMinutes();
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      setFormData({
        name: schedule.name,
        description: schedule.description || "",
        schedule_date: date,
        schedule_time: time,
        is_active: schedule.is_active,
      });
    } else {
      // Reset for create mode
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      // Generate unique name with timestamp
      const timestamp = new Date().getTime();
      const getDefaultName = () => {
        switch (syncType) {
          case "mahasiswa":
            return `Mahasiswa Sync ${timestamp}`;
          case "aktivitas_mahasiswa":
            return `Aktivitas Mahasiswa Sync ${timestamp}`;
          case "kurikulum":
            return `Kurikulum Sync ${timestamp}`;
          default:
            return `Sync ${timestamp}`;
        }
      };

      const getDefaultDescription = () => {
        switch (syncType) {
          case "mahasiswa":
            return "Sync mahasiswa data every day";
          case "aktivitas_mahasiswa":
            return "Sync aktivitas mahasiswa data every day";
          case "kurikulum":
            return "Sync kurikulum data every day";
          default:
            return "Sync data every day";
        }
      };

      setFormData({
        name: getDefaultName(),
        description: getDefaultDescription(),
        schedule_date: dateStr,
        schedule_time: "02:00",
        is_active: true,
      });
    }
  }, [schedule, syncType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.username) {
      alert("User tidak ditemukan");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      alert("Nama schedule harus diisi");
      return;
    }

    if (!formData.schedule_date) {
      alert("Tanggal schedule harus diisi");
      return;
    }

    if (!formData.schedule_time) {
      alert("Jam schedule harus diisi");
      return;
    }

    setLoading(true);

    try {
      // Convert WIB time to UTC for backend
      // User inputs time in WIB (UTC+7), backend expects UTC
      const [hours, minutes] = formData.schedule_time.split(':').map(Number);
      let utcHours = hours - 7; // Convert WIB to UTC

      // Handle day rollover
      let adjustedDate = formData.schedule_date;
      if (utcHours < 0) {
        utcHours += 24;
        // Subtract one day
        const date = new Date(formData.schedule_date);
        date.setDate(date.getDate() - 1);
        adjustedDate = date.toISOString().split('T')[0];
      } else if (utcHours >= 24) {
        utcHours -= 24;
        // Add one day
        const date = new Date(formData.schedule_date);
        date.setDate(date.getDate() + 1);
        adjustedDate = date.toISOString().split('T')[0];
      }

      const utcTime = `${String(utcHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      if (isEditMode) {
        // Update existing schedule
        await schedulerService.updateSchedule(schedule.id, {
          name: formData.name,
          description: formData.description,
          schedule_date: adjustedDate,
          schedule_time: utcTime,
          is_active: formData.is_active,
        });
      } else {
        // Create new schedule
        const request: CreateScheduleRequest = {
          name: formData.name,
          description: formData.description,
          sync_type: syncType,
          schedule_date: adjustedDate,
          schedule_time: utcTime,
          is_active: formData.is_active,
          created_by: user.username,
        };

        await schedulerService.createSchedule(request);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Gagal menyimpan schedule"
      );
    } finally {
      setLoading(false);
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
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Schedule" : "Buat Schedule Baru"}
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              {syncType === "mahasiswa"
                ? "Schedule sync untuk data mahasiswa"
                : syncType === "aktivitas_mahasiswa"
                ? "Schedule sync untuk data aktivitas mahasiswa"
                : "Schedule sync untuk data kurikulum"}
            </p>
          </ModalHeader>

          <ModalBody className="gap-5 py-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Nama Schedule <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Daily Kurikulum Sync"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Deskripsi
              </label>
              <Textarea
                placeholder="Deskripsi schedule (opsional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                variant="bordered"
                minRows={2}
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-slate-600",
                }}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.schedule_date}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_date: e.target.value })
                  }
                  isRequired
                  variant="bordered"
                  startContent={<FiCalendar className="text-gray-400 flex-shrink-0" />}
                  classNames={{
                    input: "text-gray-900 dark:text-white text-base",
                    inputWrapper: "border-gray-300 dark:border-slate-600 h-12",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Jam Eksekusi (WIB) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_time: e.target.value })
                  }
                  isRequired
                  variant="bordered"
                  startContent={<FiClock className="text-gray-400 flex-shrink-0" />}
                  classNames={{
                    input: "text-gray-900 dark:text-white text-base [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100",
                    inputWrapper: "border-gray-300 dark:border-slate-600 h-12",
                  }}
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 Waktu dalam WIB (UTC+7). Schedule akan dijalankan setiap hari pada jam yang ditentukan.
              </p>
            </div>

            {/* Active Switch */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Status Schedule
              </label>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.is_active ? "Aktif" : "Tidak Aktif"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {formData.is_active
                      ? "Schedule akan dijalankan sesuai jadwal"
                      : "Schedule tidak akan dijalankan"}
                  </p>
                </div>
                <Switch
                  isSelected={formData.is_active}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                  color="success"
                  size="lg"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-green-500",
                  }}
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={loading}
              className="font-medium"
              size="lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isEditMode ? "Update Schedule" : "Buat Schedule"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
