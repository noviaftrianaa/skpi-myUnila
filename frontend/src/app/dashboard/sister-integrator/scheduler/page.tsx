"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Switch,
  useDisclosure,
} from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  schedulerService,
  schedulerHelpers,
  type ScheduledSync,
  type CreateScheduleRequest,
  type UpdateScheduleRequest,
} from "@/lib/services/schedulerService";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";

export default function SchedulerPage() {
  const [data, setData] = useState<ScheduledSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterSyncType, setFilterSyncType] = useState<string>("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledSync | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sync_type: "pendidikan" as "dosen" | "referensi" | "penugasan" | "penelitian" | "pengabdian" | "pendidikan",
    endpoint_key: "",
    schedule_date: "",
    schedule_time: "",
    is_active: true,
    created_by: "admin",
  });

  const syncTypeOptions = [
    { value: "dosen", label: "Dosen" },
    { value: "referensi", label: "Referensi" },
    { value: "penugasan", label: "Penugasan" },
    { value: "penelitian", label: "Penelitian" },
    { value: "pengabdian", label: "Pengabdian" },
    { value: "pendidikan", label: "Pendidikan Formal" },
  ];

  // Load schedules
  useEffect(() => {
    loadSchedules();
  }, [currentPage, rowsPerPage, filterSyncType, filterActive]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (filterSyncType) params.sync_type = filterSyncType;
      if (filterActive !== undefined) params.is_active = filterActive;

      const response = await schedulerService.getSchedules(params);
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Gagal memuat data schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      description: "",
      sync_type: "pendidikan",
      endpoint_key: "",
      schedule_date: "",
      schedule_time: "",
      is_active: true,
      created_by: "admin",
    });
    setSelectedSchedule(null);
    onOpen();
  };

  const handleEdit = (schedule: ScheduledSync) => {
    setModalMode("edit");
    setSelectedSchedule(schedule);

    // Parse schedule_time to get date and time
    const scheduleTime = schedule.schedule_time ? new Date(schedule.schedule_time) : new Date();
    const date = scheduleTime.toISOString().split('T')[0];
    const time = scheduleTime.toTimeString().slice(0, 5);

    setFormData({
      name: schedule.name,
      description: schedule.description,
      sync_type: schedule.sync_type,
      endpoint_key: schedule.endpoint_key || "",
      schedule_date: date,
      schedule_time: time,
      is_active: schedule.is_active,
      created_by: "admin",
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await schedulerService.createSchedule(formData as CreateScheduleRequest);
        toast.success("Schedule berhasil dibuat");
      } else if (selectedSchedule) {
        const updateData: UpdateScheduleRequest = {
          name: formData.name,
          description: formData.description,
          schedule_date: formData.schedule_date,
          schedule_time: formData.schedule_time,
          is_active: formData.is_active,
        };
        await schedulerService.updateSchedule(selectedSchedule.id, updateData);
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
      toast.success(
        `Schedule ${!schedule.is_active ? "diaktifkan" : "dinonaktifkan"}`
      );
      loadSchedules();
    } catch (error) {
      console.error("Error toggling schedule:", error);
      toast.error("Gagal mengubah status schedule");
    }
  };

  const columns: Column<ScheduledSync>[] = [
    {
      key: "name",
      label: "NAMA SCHEDULE",
      sortable: false,
      minWidth: "200px",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.description}
          </div>
        </div>
      ),
    },
    {
      key: "sync_type",
      label: "TIPE SYNC",
      align: "center",
      width: "150px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={schedulerHelpers.getSyncTypeColor(item.sync_type)}
        >
          {schedulerHelpers.getSyncTypeLabel(item.sync_type)}
        </Chip>
      ),
    },
    {
      key: "schedule_time",
      label: "WAKTU SCHEDULE",
      align: "center",
      width: "120px",
      render: (item) => (
        <div className="flex items-center justify-center gap-1 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{schedulerHelpers.formatTime(item.schedule_time)}</span>
        </div>
      ),
    },
    {
      key: "next_run_at",
      label: "NEXT RUN",
      align: "center",
      minWidth: "180px",
      render: (item) => (
        <div className="text-xs">
          {item.next_run_at ? (
            <div>
              <div className="flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span>{schedulerHelpers.formatDate(item.next_run_at)}</span>
              </div>
              <div className="text-gray-500 mt-1">
                {schedulerHelpers.formatTime(item.next_run_at)}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "last_run_at",
      label: "LAST RUN",
      align: "center",
      minWidth: "180px",
      render: (item) => (
        <div className="text-xs">
          {item.last_run_at ? (
            <div>
              <div className="flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span>{schedulerHelpers.formatDate(item.last_run_at)}</span>
              </div>
              <div className="text-gray-500 mt-1">
                {schedulerHelpers.formatTime(item.last_run_at)}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Belum pernah run</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.is_active ? "success" : "default"}
        >
          {item.is_active ? "Aktif" : "Nonaktif"}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "180px",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="flat"
            color={item.is_active ? "warning" : "success"}
            isIconOnly
            onPress={() => handleToggle(item)}
          >
            {item.is_active ? (
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
            onPress={() => handleEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            isIconOnly
            onPress={() => handleDelete(item)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scheduler Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola jadwal sync otomatis dari SISTER API
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleCreate}
        >
          Buat Schedule Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <Select
              label="Filter Tipe Sync"
              placeholder="Semua tipe"
              value={filterSyncType}
              onChange={(e) => {
                setFilterSyncType(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-xs"
            >
              <SelectItem key="" value="">
                Semua Tipe
              </SelectItem>
              {syncTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Filter Status"
              placeholder="Semua status"
              value={filterActive === undefined ? "" : filterActive ? "true" : "false"}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(
                  value === "" ? undefined : value === "true"
                );
                setCurrentPage(1);
              }}
              className="max-w-xs"
            >
              <SelectItem key="" value="">
                Semua Status
              </SelectItem>
              <SelectItem key="true" value="true">
                Aktif
              </SelectItem>
              <SelectItem key="false" value="false">
                Nonaktif
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody>
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            serverSide={true}
            totalRecords={totalRecords}
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isRequired
              />

              <Textarea
                label="Deskripsi"
                placeholder="Deskripsi schedule"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Select
                label="Tipe Sync"
                value={formData.sync_type}
                onChange={(e) =>
                  setFormData({ ...formData, sync_type: e.target.value as any })
                }
                isRequired
                isDisabled={modalMode === "edit"}
              >
                {syncTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>

              {(formData.sync_type === "referensi" ||
                formData.sync_type === "penelitian" ||
                formData.sync_type === "pengabdian" ||
                formData.sync_type === "pendidikan") && (
                <Input
                  label="Endpoint Key / ID SDM"
                  placeholder={
                    formData.sync_type === "referensi"
                      ? "Contoh: agama, negara"
                      : "Contoh: id_sdm dosen"
                  }
                  value={formData.endpoint_key}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint_key: e.target.value })
                  }
                  isRequired
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
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value })
                }
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
    </div>
  );
}
