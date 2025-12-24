"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Switch,
  Tooltip,
} from "@heroui/react";
import { FiPlus, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { myunilaClient } from "@/lib/api/myunilaClient";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface Scheduler {
  id_scheduler: string;
  nama_scheduler: string;
  deskripsi: string | null;
  jenis_sync: string;
  cron_expression: string;
  is_active: number;
  username_filter: string | null;
  role_filter: string | null;
  date_from: string | null;
  date_to: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
  last_run_status: string | null;
  last_run_message: string | null;
  created_by: string;
  tgl_create: string;
  last_update: string;
}

interface SchedulerFormData {
  nama_scheduler: string;
  deskripsi: string;
  jenis_sync: string;
  cron_expression: string;
  is_active: number;
  username_filter: string;
  role_filter: string;
  date_from: string;
  date_to: string;
}

export default function SsoRadiusSchedulerTable() {
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingScheduler, setEditingScheduler] = useState<Scheduler | null>(null);
  const [deletingScheduler, setDeletingScheduler] = useState<Scheduler | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<SchedulerFormData>({
    nama_scheduler: "",
    deskripsi: "",
    jenis_sync: "radius",
    cron_expression: "0 2 * * *",
    is_active: 1,
    username_filter: "",
    role_filter: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    fetchSchedulers();
  }, [page]);

  const fetchSchedulers = async () => {
    try {
      setIsLoading(true);
      const response = await myunilaClient.get("/radius/schedulers", {
        params: { page, limit: 10, jenis_sync: "radius" },
      });

      if (response.data.success) {
        setSchedulers(response.data.data);
        setTotalPages(response.data.meta.total_pages);
      }
    } catch (error) {
      console.error("Error fetching schedulers:", error);
      toast.error("Gagal memuat data scheduler");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (scheduler?: Scheduler) => {
    if (scheduler) {
      setEditingScheduler(scheduler);
      setFormData({
        nama_scheduler: scheduler.nama_scheduler,
        deskripsi: scheduler.deskripsi || "",
        jenis_sync: scheduler.jenis_sync,
        cron_expression: scheduler.cron_expression,
        is_active: scheduler.is_active,
        username_filter: scheduler.username_filter || "",
        role_filter: scheduler.role_filter || "",
        date_from: scheduler.date_from || "",
        date_to: scheduler.date_to || "",
      });
    } else {
      setEditingScheduler(null);
      setFormData({
        nama_scheduler: "",
        deskripsi: "",
        jenis_sync: "radius",
        cron_expression: "0 2 * * *",
        is_active: 1,
        username_filter: "",
        role_filter: "",
        date_from: "",
        date_to: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScheduler(null);
  };

  const handleSubmit = async () => {
    if (!formData.nama_scheduler.trim()) {
      toast.error("Nama scheduler wajib diisi");
      return;
    }
    if (!formData.cron_expression.trim()) {
      toast.error("Cron expression wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        username_filter: formData.username_filter || null,
        role_filter: formData.role_filter || null,
        date_from: formData.date_from || null,
        date_to: formData.date_to || null,
      };

      if (editingScheduler) {
        await myunilaClient.put(`/radius/schedulers/${editingScheduler.id_scheduler}`, payload);
        toast.success("Scheduler berhasil diupdate");
      } else {
        await myunilaClient.post("/radius/schedulers", payload);
        toast.success("Scheduler berhasil dibuat");
      }

      handleCloseModal();
      fetchSchedulers();
    } catch (error: any) {
      console.error("Error saving scheduler:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan scheduler");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (scheduler: Scheduler) => {
    try {
      const newStatus = scheduler.is_active === 1 ? 0 : 1;
      await myunilaClient.patch(`/radius/schedulers/${scheduler.id_scheduler}/toggle`, {
        is_active: newStatus,
      });
      toast.success(`Scheduler ${newStatus === 1 ? "diaktifkan" : "dinonaktifkan"}`);
      fetchSchedulers();
    } catch (error: any) {
      console.error("Error toggling scheduler:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah status scheduler");
    }
  };

  const handleDelete = async () => {
    if (!deletingScheduler) return;

    try {
      setIsSubmitting(true);
      await myunilaClient.delete(`/radius/schedulers/${deletingScheduler.id_scheduler}`);
      toast.success("Scheduler berhasil dihapus");
      setIsDeleteModalOpen(false);
      setDeletingScheduler(null);
      fetchSchedulers();
    } catch (error: any) {
      console.error("Error deleting scheduler:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus scheduler");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return "-";
    }
  };

  const cronPresets = [
    { label: "Setiap hari jam 02:00", value: "0 2 * * *" },
    { label: "Setiap hari jam 06:00", value: "0 6 * * *" },
    { label: "Setiap Senin jam 02:00", value: "0 2 * * 1" },
    { label: "Setiap tanggal 1 jam 02:00", value: "0 2 1 * *" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Scheduler Sync</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kelola jadwal otomatis untuk sinkronisasi data
          </p>
        </div>
        <Button
          color="primary"
          startContent={<FiPlus />}
          onPress={() => handleOpenModal()}
        >
          Tambah Scheduler
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : (
        <Table aria-label="Scheduler table">
          <TableHeader>
            <TableColumn>NAMA SCHEDULER</TableColumn>
            <TableColumn>CRON EXPRESSION</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>LAST RUN</TableColumn>
            <TableColumn>NEXT RUN</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Belum ada scheduler">
            {schedulers.map((scheduler) => (
              <TableRow key={scheduler.id_scheduler}>
                <TableCell>
                  <div>
                    <div className="font-medium">{scheduler.nama_scheduler}</div>
                    {scheduler.deskripsi && (
                      <div className="text-xs text-gray-500">{scheduler.deskripsi}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {scheduler.cron_expression}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Chip
                      size="sm"
                      color={scheduler.is_active === 1 ? "success" : "default"}
                      variant="flat"
                      startContent={scheduler.is_active === 1 ? <FiCheckCircle /> : <FiClock />}
                    >
                      {scheduler.is_active === 1 ? "Aktif" : "Nonaktif"}
                    </Chip>
                    {scheduler.last_run_status && (
                      <Chip
                        size="sm"
                        color={
                          scheduler.last_run_status === "success"
                            ? "success"
                            : scheduler.last_run_status === "failed"
                            ? "danger"
                            : "warning"
                        }
                        variant="flat"
                      >
                        {scheduler.last_run_status}
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(scheduler.last_run_at)}</TableCell>
                <TableCell>{formatDateTime(scheduler.next_run_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content={scheduler.is_active === 1 ? "Nonaktifkan" : "Aktifkan"}>
                      <Switch
                        size="sm"
                        isSelected={scheduler.is_active === 1}
                        onValueChange={() => handleToggleActive(scheduler)}
                      />
                    </Tooltip>
                    <Tooltip content="Edit">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleOpenModal(scheduler)}
                      >
                        <FiEdit />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Hapus">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => {
                          setDeletingScheduler(scheduler);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingScheduler ? "Edit Scheduler" : "Tambah Scheduler"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nama Scheduler"
                    placeholder="Contoh: Daily Radius Sync"
                    value={formData.nama_scheduler}
                    onChange={(e) => setFormData({ ...formData, nama_scheduler: e.target.value })}
                    isRequired
                  />

                  <Textarea
                    label="Deskripsi"
                    placeholder="Deskripsi scheduler (opsional)"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Cron Expression (Preset)"
                      placeholder="Pilih preset atau custom"
                      selectedKeys={cronPresets.find((p) => p.value === formData.cron_expression) ? [formData.cron_expression] : []}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, cron_expression: e.target.value });
                        }
                      }}
                    >
                      {cronPresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Cron Expression (Custom)"
                      placeholder="0 2 * * *"
                      value={formData.cron_expression}
                      onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                      description="Format: minute hour day month weekday"
                      isRequired
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Filter Sync (Opsional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Filter Username"
                        placeholder="Contoh: john.doe"
                        value={formData.username_filter}
                        onChange={(e) => setFormData({ ...formData, username_filter: e.target.value })}
                      />

                      <Input
                        label="Filter Role"
                        placeholder="Contoh: Dosen"
                        value={formData.role_filter}
                        onChange={(e) => setFormData({ ...formData, role_filter: e.target.value })}
                      />

                      <Input
                        label="Tanggal Dari"
                        type="date"
                        value={formData.date_from}
                        onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                      />

                      <Input
                        label="Tanggal Sampai"
                        type="date"
                        value={formData.date_to}
                        onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
                  {editingScheduler ? "Update" : "Simpan"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Konfirmasi Hapus</ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus scheduler{" "}
                  <strong>{deletingScheduler?.nama_scheduler}</strong>?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="danger" onPress={handleDelete} isLoading={isSubmitting}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
