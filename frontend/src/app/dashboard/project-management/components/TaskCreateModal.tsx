"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Btn, TwInput, TwTextarea, TwSelect } from "./ui";
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

const TIPE_OPTIONS = [
  { value: 'feature', label: '✨ Feature' },
  { value: 'bugfix', label: '🐛 Bug Fix' },
  { value: 'improvement', label: '🔧 Improvement' },
  { value: 'chore', label: '📦 Chore' },
  { value: 'documentation', label: '📝 Documentation' },
];

const PRIORITAS_OPTIONS = [
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const STATUS_OPTIONS = [
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
  const [moduleId, setModuleId] = useState("");
  const [tipe, setTipe] = useState("feature");
  const [prioritas, setPrioritas] = useState("medium");
  const [status, setStatus] = useState(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setJudul(""); setDeskripsi(""); setModuleId(""); setTipe("feature");
    setPrioritas("medium"); setStatus(defaultStatus); setDueDate("");
    setAssigneeName(""); setError(""); onClose();
  };

  const handleSubmit = async () => {
    if (!judul.trim()) { setError("Judul task wajib diisi"); return; }
    setLoading(true); setError("");
    try {
      const created = await projectService.createTask(projectId, {
        judul, deskripsi: deskripsi || undefined, module_id: moduleId || undefined,
        tipe: tipe as Task['tipe'], prioritas: prioritas as Task['prioritas'],
        status: status as Task['status'], due_date: dueDate || undefined,
        assignee_name: assigneeName || undefined,
      });
      onCreated?.(created);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal membuat task");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Task Baru</h2>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <TwInput value={judul} onValueChange={setJudul} placeholder="Masukkan judul task..." label="Judul Task *" autoFocus />
        <TwTextarea value={deskripsi} onValueChange={setDeskripsi} placeholder="Deskripsi task (opsional)..." label="Deskripsi" rows={3} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TwSelect
            label="Modul"
            value={moduleId}
            onValueChange={setModuleId}
            placeholder="Pilih modul"
            options={modules.map(m => ({ value: m.id, label: m.nama }))}
          />
          <TwSelect label="Tipe" value={tipe} onValueChange={setTipe} options={TIPE_OPTIONS} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TwSelect label="Prioritas" value={prioritas} onValueChange={setPrioritas} options={PRIORITAS_OPTIONS} />
          <TwSelect label="Status" value={status} onValueChange={(v) => setStatus(v as Task['status'])} options={STATUS_OPTIONS} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TwInput value={assigneeName} onValueChange={setAssigneeName} placeholder="Nama assignee" label="Assignee" />
          <TwInput type="date" value={dueDate} onValueChange={setDueDate} label="Tanggal Deadline" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Btn variant="ghost" onClick={handleClose} disabled={loading}>Batal</Btn>
        <Btn onClick={handleSubmit} isLoading={loading} disabled={!judul.trim()}>Buat Task</Btn>
      </ModalFooter>
    </Modal>
  );
}
