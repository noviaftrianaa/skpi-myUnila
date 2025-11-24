"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  useDisclosure,
  Divider,
} from "@heroui/react";
import {
  schedulerService,
  schedulerHelpers,
  type ScheduledSync,
  type CreateScheduleRequest,
} from "@/lib/services/sister/management/schedulerService";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Activity,
} from "lucide-react";

interface ScheduledSyncsCardProps {
  syncType: "dosen" | "referensi" | "penugasan" | "penelitian" | "pengabdian" | "pendidikan";
  title?: string;
}

export default function ScheduledSyncsCard({ syncType, title }: ScheduledSyncsCardProps) {
  const [schedules, setSchedules] = useState<ScheduledSync[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledSync | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    endpoint_key: "",
    schedule_date: "",
    schedule_time: "",
    is_active: true,
  });

  useEffect(() => {
    loadSchedules();
  }, [syncType]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulerService.getSchedules({
        page: 1,
        limit: 100,
        sync_type: syncType,
      });
      setSchedules(response.data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      description: "",
      endpoint_key: "",
      schedule_date: "",
      schedule_time: "",
      is_active: true,
    });
    setSelectedSchedule(null);
    onOpen();
  };

  const handleEdit = (schedule: ScheduledSync) => {
    setModalMode("edit");
    setSelectedSchedule(schedule);

    // Parse schedule_time
    const scheduleTime = schedule.schedule_time ? new Date(schedule.schedule_time) : new Date();
    const date = scheduleTime.toISOString().split("T")[0];
    const time = scheduleTime.toTimeString().slice(0, 5);

    setFormData({
      name: schedule.name,
      description: schedule.description,
      endpoint_key: schedule.endpoint_key || "",
      schedule_date: date,
      schedule_time: time,
      is_active: schedule.is_active,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        const createData: CreateScheduleRequest = {
          name: formData.name,
          description: formData.description,
          sync_type: syncType,
          endpoint_key: formData.endpoint_key || undefined,
          schedule_date: formData.schedule_date,
          schedule_time: formData.schedule_time,
          is_active: formData.is_active,
          created_by: "admin",
        };
        await schedulerService.createSchedule(createData);
        toast.success("Schedule berhasil dibuat");
      } else if (selectedSchedule) {
        await schedulerService.updateSchedule(selectedSchedule.id, {
          name: formData.name,
          description: formData.description,
          schedule_date: formData.schedule_date,
          schedule_time: formData.schedule_time,
          is_active: formData.is_active,
        });
        toast.success("Schedule berhasil diupdate");
      }
      onClose();
      loadSchedules();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan schedule");
    }
  };

  const handleDelete = async (schedule: ScheduledSync) => {
    if (!confirm(`Hapus schedule "${schedule.name}"?`)) return;

    try {
      await schedulerService.deleteSchedule(schedule.id);
      toast.success("Schedule berhasil dihapus");
      loadSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Gagal menghapus schedule");
    }
  };

  const handleToggle = async (schedule: ScheduledSync) => {
    try {
      await schedulerService.toggleSchedule(schedule.id, !schedule.is_active);
      toast.success(`Schedule ${!schedule.is_active ? "diaktifkan" : "dinonaktifkan"}`);
      loadSchedules();
    } catch (error) {
      console.error("Error toggling schedule:", error);
      toast.error("Gagal mengubah status schedule");
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title || "Scheduled Syncs"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Jadwal sinkronisasi otomatis
              </p>
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleCreate}
          >
            Tambah Schedule
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat schedule...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Belum ada schedule untuk sync ini
              </p>
              <Button
                size="sm"
                color="primary"
                variant="light"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleCreate}
                className="mt-3"
              >
                Buat Schedule Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {schedule.name}
                        </h4>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={schedule.is_active ? "success" : "default"}
                        >
                          {schedule.is_active ? "Aktif" : "Nonaktif"}
                        </Chip>
                      </div>
                      {schedule.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {schedule.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Waktu: {schedulerHelpers.formatTime(schedule.schedule_time)}</span>
                        </div>
                        {schedule.next_run_at && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Next: {schedulerHelpers.formatDateTime(schedule.next_run_at)}</span>
                          </div>
                        )}
                        {schedule.last_run_at && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <span>Last: {schedulerHelpers.formatDateTime(schedule.last_run_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="flat"
                        color={schedule.is_active ? "warning" : "success"}
                        isIconOnly
                        onPress={() => handleToggle(schedule)}
                      >
                        {schedule.is_active ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        isIconOnly
                        onPress={() => handleEdit(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        onPress={() => handleDelete(schedule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalContent>
          <ModalHeader>
            {modalMode === "create" ? "Buat Schedule Baru" : "Edit Schedule"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Schedule"
                placeholder="Contoh: Sync Pendidikan Formal Harian"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />

              <Textarea
                label="Deskripsi"
                placeholder="Deskripsi schedule (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />

              {(syncType === "referensi" ||
                syncType === "penelitian" ||
                syncType === "pengabdian" ||
                syncType === "pendidikan") && (
                <Input
                  label="Endpoint Key / ID SDM"
                  placeholder={
                    syncType === "referensi"
                      ? "Contoh: agama, negara"
                      : "Contoh: id_sdm dosen"
                  }
                  value={formData.endpoint_key}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint_key: e.target.value })
                  }
                  isRequired
                  isDisabled={modalMode === "edit"}
                  description={
                    modalMode === "edit"
                      ? "Endpoint key tidak bisa diubah setelah schedule dibuat"
                      : undefined
                  }
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Tanggal Schedule"
                  value={formData.schedule_date}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_date: e.target.value })
                  }
                  isRequired
                />

                <Input
                  type="time"
                  label="Waktu Schedule"
                  value={formData.schedule_time}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_time: e.target.value })
                  }
                  isRequired
                />
              </div>

              <Switch
                isSelected={formData.is_active}
                onValueChange={(value) => setFormData({ ...formData, is_active: value })}
              >
                Aktifkan schedule
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSave}>
              {modalMode === "create" ? "Buat Schedule" : "Simpan Perubahan"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
