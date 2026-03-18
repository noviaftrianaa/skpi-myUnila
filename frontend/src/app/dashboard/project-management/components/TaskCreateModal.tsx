"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import type { Task, ProjectModule } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  modules: ProjectModule[];
  defaultStatus?: Task['status'];
  onCreated?: (task: Task) => void;
}

const TIPE_OPTIONS: { value: Task['tipe']; label: string }[] = [
  { value: 'feature', label: '✨ Feature' },
  { value: 'bugfix', label: '🐛 Bug Fix' },
  { value: 'improvement', label: '🔧 Improvement' },
  { value: 'chore', label: '📦 Chore' },
  { value: 'documentation', label: '📝 Documentation' },
];

const PRIORITAS_OPTIONS: { value: Task['prioritas']; label: string }[] = [
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export default function TaskCreateModal({
  isOpen,
  onClose,
  projectId,
  modules,
  defaultStatus = 'backlog',
  onCreated,
}: TaskCreateModalProps) {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [tipe, setTipe] = useState<Task['tipe']>("feature");
  const [prioritas, setPrioritas] = useState<Task['prioritas']>("medium");
  const [status, setStatus] = useState<Task['status']>(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setJudul("");
    setDeskripsi("");
    setModuleId("");
    setTipe("feature");
    setPrioritas("medium");
    setStatus(defaultStatus);
    setDueDate("");
    setAssigneeName("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!judul.trim()) {
      setError("Judul task wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await projectService.createTask(projectId, {
        judul,
        deskripsi: deskripsi || undefined,
        module_id: moduleId || undefined,
        tipe,
        prioritas,
        status,
        due_date: dueDate || undefined,
        assignee_name: assigneeName || undefined,
      });
      onCreated?.(created);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal membuat task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Task Baru</h2>
        </ModalHeader>
        <ModalBody className="py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Judul Task <span className="text-red-500">*</span>
            </label>
            <Input
              value={judul}
              onValueChange={setJudul}
              placeholder="Masukkan judul task..."
              variant="bordered"
              autoFocus
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Deskripsi
            </label>
            <Textarea
              value={deskripsi}
              onValueChange={setDeskripsi}
              placeholder="Deskripsi task (opsional)..."
              variant="bordered"
              minRows={3}
            />
          </div>

          {/* Module & Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Modul
              </label>
              <Select
                selectedKeys={moduleId ? new Set([moduleId]) : new Set()}
                onSelectionChange={(keys) => setModuleId(Array.from(keys)[0] as string ?? "")}
                placeholder="Pilih modul"
                variant="bordered"
              >
                {modules.map(m => (
                  <SelectItem key={m.id}>{m.nama}</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tipe
              </label>
              <Select
                selectedKeys={new Set([tipe])}
                onSelectionChange={(keys) => setTipe(Array.from(keys)[0] as Task['tipe'])}
                variant="bordered"
              >
                {TIPE_OPTIONS.map(o => (
                  <SelectItem key={o.value}>{o.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Prioritas & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Prioritas
              </label>
              <Select
                selectedKeys={new Set([prioritas])}
                onSelectionChange={(keys) => setPrioritas(Array.from(keys)[0] as Task['prioritas'])}
                variant="bordered"
              >
                {PRIORITAS_OPTIONS.map(o => (
                  <SelectItem key={o.value}>{o.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <Select
                selectedKeys={new Set([status])}
                onSelectionChange={(keys) => setStatus(Array.from(keys)[0] as Task['status'])}
                variant="bordered"
              >
                {STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value}>{o.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Assignee
              </label>
              <Input
                value={assigneeName}
                onValueChange={setAssigneeName}
                placeholder="Nama assignee"
                variant="bordered"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tanggal Deadline
              </label>
              <Input
                type="date"
                value={dueDate}
                onValueChange={setDueDate}
                variant="bordered"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
          <Button variant="light" onPress={handleClose} isDisabled={loading}>
            Batal
          </Button>
          <Button
            color="primary"
            className="bg-[#0B5EA8] text-white"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!judul.trim()}
          >
            Buat Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
