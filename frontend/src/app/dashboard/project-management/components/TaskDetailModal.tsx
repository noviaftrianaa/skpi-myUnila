"use client";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  Select,
  SelectItem,
  Input,
  Textarea,
  Spinner,
} from "@heroui/react";
import {
  FiStar,
  FiAlertCircle,
  FiTool,
  FiPackage,
  FiFileText,
  FiSend,
  FiGitCommit,
  FiActivity,
  FiX,
  FiCalendar,
  FiClock,
  FiTag,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import type { Task, Comment, Commit, ProjectModule, Label } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
  modules: ProjectModule[];
  onTaskUpdated?: (task: Task) => void;
}

const STATUS_OPTIONS: { value: Task['status']; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-slate-100 text-slate-600' },
  { value: 'todo', label: 'To Do', color: 'bg-blue-100 text-blue-600' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-600' },
  { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-600' },
  { value: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-600' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-100 text-red-600' },
];

const PRIORITAS_OPTIONS: { value: Task['prioritas']; label: string }[] = [
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const TIPE_ICONS: Record<string, React.ReactNode> = {
  feature: <FiStar className="w-3.5 h-3.5" />,
  bugfix: <FiAlertCircle className="w-3.5 h-3.5" />,
  improvement: <FiTool className="w-3.5 h-3.5" />,
  chore: <FiPackage className="w-3.5 h-3.5" />,
  documentation: <FiFileText className="w-3.5 h-3.5" />,
};

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "Baru saja";
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  } catch {
    return "";
  }
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectId,
  modules,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'komentar' | 'commits' | 'aktivitas'>('komentar');

  // Labels state
  const [taskLabels, setTaskLabels] = useState<Label[]>([]);
  const [projectLabels, setProjectLabels] = useState<Label[]>([]);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6B7280");
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setEditTask({ ...task });
      loadComments(task.id);
      loadCommits(task.id);
      loadTaskLabels(task.id);
      loadProjectLabels();
    }
  }, [task]);

  // Close label dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
        setShowLabelDropdown(false);
        setShowCreateLabel(false);
        setNewLabelName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const data = await projectService.getComments(projectId, taskId);
      setComments(data);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const loadCommits = async (taskId: string) => {
    try {
      const data = await projectService.getCommits(projectId, taskId);
      setCommits(data);
    } catch {
      // ignore
    }
  };

  const loadTaskLabels = async (taskId: string) => {
    try {
      const data = await projectService.getTaskLabels(projectId, taskId);
      setTaskLabels(data);
    } catch {
      setTaskLabels([]);
    }
  };

  const loadProjectLabels = async () => {
    try {
      const data = await projectService.getProjectLabels(projectId);
      setProjectLabels(data);
    } catch {
      setProjectLabels([]);
    }
  };

  const handleAddLabel = async (labelId: string) => {
    if (!task) return;
    const alreadyAdded = taskLabels.some((l) => l.id_label === labelId);
    if (alreadyAdded) {
      // remove
      setLabelLoading(true);
      try {
        await projectService.removeTaskLabel(projectId, task.id, labelId);
        setTaskLabels((prev) => prev.filter((l) => l.id_label !== labelId));
      } catch {}
      finally { setLabelLoading(false); }
    } else {
      // add
      setLabelLoading(true);
      try {
        await projectService.addTaskLabel(projectId, task.id, labelId);
        const label = projectLabels.find((l) => l.id_label === labelId);
        if (label) setTaskLabels((prev) => [...prev, label]);
      } catch {}
      finally { setLabelLoading(false); }
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!task) return;
    setLabelLoading(true);
    try {
      await projectService.removeTaskLabel(projectId, task.id, labelId);
      setTaskLabels((prev) => prev.filter((l) => l.id_label !== labelId));
    } catch {}
    finally { setLabelLoading(false); }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    setLabelLoading(true);
    try {
      const created = await projectService.createProjectLabel(projectId, newLabelName.trim(), newLabelColor);
      setProjectLabels((prev) => [...prev, created]);
      // Immediately add to task
      if (task) {
        await projectService.addTaskLabel(projectId, task.id, created.id_label);
        setTaskLabels((prev) => [...prev, created]);
      }
      setNewLabelName("");
      setShowCreateLabel(false);
    } catch {}
    finally { setLabelLoading(false); }
  };

  const handleFieldChange = async (field: keyof Task, value: any) => {
    if (!editTask) return;
    const updated = { ...editTask, [field]: value };
    setEditTask(updated);
    setSavingField(field);
    try {
      const saved = await projectService.updateTask(projectId, editTask.id, { [field]: value });
      setEditTask(saved);
      onTaskUpdated?.(saved);
    } catch {
      // revert
      setEditTask(editTask);
    } finally {
      setSavingField(null);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !task) return;
    setSendingComment(true);
    try {
      const created = await projectService.createComment(projectId, task.id, newComment.trim());
      setComments(prev => [...prev, created]);
      setNewComment("");
    } catch {
      // ignore
    } finally {
      setSendingComment(false);
    }
  };

  if (!task || !editTask) return null;

  const statusConfig = STATUS_OPTIONS.find(s => s.value === editTask.status);
  const tipeIcon = TIPE_ICONS[editTask.tipe];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        {/* Header */}
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-col gap-1 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {editTask.kode}
              </span>
              <div className="flex items-center gap-1 text-gray-500">
                {tipeIcon}
                <span className="text-xs capitalize">{editTask.tipe}</span>
              </div>
            </div>
            <Button isIconOnly size="sm" variant="light" onPress={onClose}>
              <FiX className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight pr-8">
            {editTask.judul}
          </h2>
        </ModalHeader>

        <ModalBody className="py-4 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Detail */}
            <div className="lg:col-span-2 space-y-4">
              {/* Deskripsi */}
              {editTask.deskripsi && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Deskripsi
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {editTask.deskripsi}
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div>
                <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-3">
                  {(['komentar', 'commits', 'aktivitas'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                        ${activeTab === tab
                          ? 'border-[#0B5EA8] text-[#0B5EA8]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                      {tab === 'komentar' && `Komentar (${comments.length})`}
                      {tab === 'commits' && `Commits (${commits.length})`}
                      {tab === 'aktivitas' && 'Aktivitas'}
                    </button>
                  ))}
                </div>

                {/* Comments tab */}
                {activeTab === 'komentar' && (
                  <div className="space-y-3">
                    {loadingComments ? (
                      <div className="flex justify-center py-6">
                        <Spinner size="sm" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Belum ada komentar</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0B5EA8] text-white text-[11px] flex items-center justify-center font-bold shrink-0">
                            {c.user_initial || c.user_name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.user_name}</span>
                              <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                              {c.isi}
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Comment input */}
                    <div className="flex gap-2 mt-3">
                      <Input
                        value={newComment}
                        onValueChange={setNewComment}
                        placeholder="Tulis komentar..."
                        variant="bordered"
                        size="sm"
                        className="flex-1"
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                      />
                      <Button
                        size="sm"
                        color="primary"
                        className="bg-[#0B5EA8]"
                        isIconOnly
                        onPress={handleSendComment}
                        isLoading={sendingComment}
                        isDisabled={!newComment.trim()}
                      >
                        <FiSend className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Commits tab */}
                {activeTab === 'commits' && (
                  <div className="space-y-2">
                    {commits.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Belum ada commit terkait</p>
                    ) : (
                      commits.map(c => (
                        <div key={c.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <FiGitCommit className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{c.message}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono text-[#0B5EA8]">{c.sha.slice(0, 7)}</span>
                              <span className="text-xs text-gray-400">by {c.author}</span>
                              <span className="text-xs text-gray-400">{formatDate(c.committed_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Activity tab */}
                {activeTab === 'aktivitas' && (
                  <div className="text-sm text-gray-500 text-center py-6">
                    <FiActivity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Riwayat aktivitas task
                  </div>
                )}
              </div>
            </div>

            {/* Right: Properties */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                {/* Status */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status</p>
                  <Select
                    selectedKeys={new Set([editTask.status])}
                    onSelectionChange={(keys) => handleFieldChange('status', Array.from(keys)[0])}
                    variant="bordered"
                    size="sm"
                    isDisabled={savingField === 'status'}
                  >
                    {STATUS_OPTIONS.map(o => (
                      <SelectItem key={o.value}>{o.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Prioritas */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Prioritas</p>
                  <Select
                    selectedKeys={new Set([editTask.prioritas])}
                    onSelectionChange={(keys) => handleFieldChange('prioritas', Array.from(keys)[0])}
                    variant="bordered"
                    size="sm"
                    isDisabled={savingField === 'prioritas'}
                  >
                    {PRIORITAS_OPTIONS.map(o => (
                      <SelectItem key={o.value}>{o.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Module */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Modul</p>
                  <Select
                    selectedKeys={editTask.module_id ? new Set([editTask.module_id]) : new Set()}
                    onSelectionChange={(keys) => handleFieldChange('module_id', Array.from(keys)[0] ?? null)}
                    variant="bordered"
                    size="sm"
                    placeholder="Pilih modul"
                    isDisabled={savingField === 'module_id'}
                  >
                    {modules.map(m => (
                      <SelectItem key={m.id}>{m.nama}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Due Date */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    <FiCalendar className="inline w-3 h-3 mr-1" />
                    Deadline
                  </p>
                  <Input
                    type="date"
                    value={editTask.due_date?.split('T')[0] ?? ""}
                    onValueChange={(v) => handleFieldChange('due_date', v)}
                    variant="bordered"
                    size="sm"
                    isDisabled={savingField === 'due_date'}
                  />
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Assignee</p>
                  {editTask.assignee_name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0B5EA8] text-white text-[10px] flex items-center justify-center font-bold">
                        {editTask.assignee_initial || editTask.assignee_name[0]}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{editTask.assignee_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Unassigned</span>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <FiTag className="w-3 h-3" />
                    Labels
                  </p>
                  {/* Assigned labels */}
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {taskLabels.map((label) => (
                      <span
                        key={label.id_label}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: label.warna || "#6B7280" }}
                      >
                        {label.nm_label}
                        <button
                          onClick={() => handleRemoveLabel(label.id_label)}
                          className="opacity-70 hover:opacity-100 ml-0.5"
                        >
                          <FiX className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add label dropdown */}
                  <div className="relative" ref={labelDropdownRef}>
                    <Button
                      size="sm"
                      variant="flat"
                      className="text-xs h-6 min-w-0 px-2"
                      startContent={<FiPlus className="w-3 h-3" />}
                      onPress={() => setShowLabelDropdown((v) => !v)}
                      isDisabled={labelLoading}
                    >
                      Label
                    </Button>

                    {showLabelDropdown && (
                      <div className="absolute z-50 top-7 left-0 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                          {projectLabels.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">Belum ada label</p>
                          )}
                          {projectLabels.map((label) => {
                            const isAdded = taskLabels.some((l) => l.id_label === label.id_label);
                            return (
                              <button
                                key={label.id_label}
                                onClick={() => handleAddLabel(label.id_label)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left"
                              >
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: label.warna || "#6B7280" }}
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{label.nm_label}</span>
                                {isAdded && <FiCheck className="w-3 h-3 text-[#0B5EA8]" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                          {!showCreateLabel ? (
                            <button
                              onClick={() => setShowCreateLabel(true)}
                              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#0B5EA8] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            >
                              <FiPlus className="w-3 h-3" />
                              Buat label baru
                            </button>
                          ) : (
                            <div className="space-y-1.5">
                              <Input
                                size="sm"
                                placeholder="Nama label"
                                value={newLabelName}
                                onValueChange={setNewLabelName}
                                variant="bordered"
                                className="text-xs"
                                autoFocus
                              />
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={newLabelColor}
                                  onChange={(e) => setNewLabelColor(e.target.value)}
                                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                                />
                                <Button
                                  size="sm"
                                  color="primary"
                                  className="bg-[#0B5EA8] text-white text-xs flex-1 h-7"
                                  onPress={handleCreateLabel}
                                  isDisabled={!newLabelName.trim() || labelLoading}
                                >
                                  Buat
                                </Button>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  className="text-xs h-7"
                                  onPress={() => { setShowCreateLabel(false); setNewLabelName(""); }}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Tracking */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    Time Tracking
                  </p>
                  <div className="space-y-2">
                    <Input
                      label="Estimasi (jam)"
                      type="number"
                      step={0.5}
                      min={0}
                      size="sm"
                      variant="bordered"
                      value={editTask.estimasi_jam !== undefined ? String(editTask.estimasi_jam) : ""}
                      onValueChange={(v) => {
                        const num = v === "" ? undefined : parseFloat(v);
                        setEditTask(prev => prev ? { ...prev, estimasi_jam: num } : prev);
                      }}
                      onBlur={() => {
                        handleFieldChange('estimasi_jam', editTask.estimasi_jam ?? null);
                      }}
                      isDisabled={savingField === 'estimasi_jam'}
                    />
                    <Input
                      label="Actual (jam)"
                      type="number"
                      step={0.5}
                      min={0}
                      size="sm"
                      variant="bordered"
                      value={editTask.actual_jam !== undefined ? String(editTask.actual_jam) : ""}
                      onValueChange={(v) => {
                        const num = v === "" ? undefined : parseFloat(v);
                        setEditTask(prev => prev ? { ...prev, actual_jam: num } : prev);
                      }}
                      onBlur={() => {
                        handleFieldChange('actual_jam', editTask.actual_jam ?? null);
                      }}
                      isDisabled={savingField === 'actual_jam'}
                    />
                    {/* Visual comparison bar */}
                    {editTask.estimasi_jam !== undefined && editTask.estimasi_jam > 0 &&
                     editTask.actual_jam !== undefined && editTask.actual_jam > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Actual vs Estimasi</span>
                          <span className={editTask.actual_jam > editTask.estimasi_jam ? "text-red-500 font-semibold" : "text-emerald-500 font-semibold"}>
                            {editTask.actual_jam > editTask.estimasi_jam
                              ? `+${(editTask.actual_jam - editTask.estimasi_jam).toFixed(1)}j overrun`
                              : `${(editTask.estimasi_jam - editTask.actual_jam).toFixed(1)}j tersisa`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              editTask.actual_jam > editTask.estimasi_jam ? "bg-red-500" : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (editTask.actual_jam / editTask.estimasi_jam) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>0</span>
                          <span>{editTask.estimasi_jam}j</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Created */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    <FiClock className="inline w-3 h-3 mr-1" />
                    Dibuat
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDateTime(editTask.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
