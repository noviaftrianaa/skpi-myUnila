"use client";

import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Btn, TwInput, TwTextarea, TwSelect, useToast } from "./ui";
import type { Project } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdated?: (project: Project) => void;
}

const WARNA_OPTIONS = [
  "#0B5EA8", "#6366f1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6B7280",
];

export default function ProjectEditModal({ isOpen, onClose, project, onUpdated }: ProjectEditModalProps) {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [warna, setWarna] = useState("#6366f1");
  const [status, setStatus] = useState("active");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalTarget, setTanggalTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (project && isOpen) {
      setNama(project.nama ?? "");
      setDeskripsi(project.deskripsi ?? "");
      setRepoUrl(project.repo_url ?? "");
      setWarna(project.warna ?? "#6366f1");
      setStatus(project.status ?? "active");
      setTanggalMulai((project.tanggal_mulai ?? project.tgl_mulai ?? "").split("T")[0]);
      setTanggalTarget((project.tanggal_target ?? project.tgl_target ?? "").split("T")[0]);
      setError("");
    }
  }, [project, isOpen]);

  const handleSubmit = async () => {
    if (!project || !nama.trim()) return;
    setLoading(true);
    setError("");
    try {
      const updated = await projectService.updateProject(project.id, {
        nama,
        deskripsi: deskripsi || undefined,
        repo_url: repoUrl || undefined,
        warna,
        status: status as Project["status"],
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_target: tanggalTarget || undefined,
      });
      onUpdated?.(updated);
      toast("Project berhasil diupdate!", "success");
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal update project";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Project</h2>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <TwInput value={nama} onValueChange={setNama} placeholder="Nama project" label="Nama Project *" />
        <TwTextarea value={deskripsi} onValueChange={setDeskripsi} placeholder="Deskripsi..." label="Deskripsi" rows={2} />
        <TwInput value={repoUrl} onValueChange={setRepoUrl} placeholder="https://..." label="Repository URL" />
        <TwSelect
          value={status}
          onValueChange={setStatus}
          label="Status"
          options={[
            { value: "active", label: "Aktif" },
            { value: "completed", label: "Selesai" },
            { value: "archived", label: "Diarsipkan" },
          ]}
        />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Warna Aksen</label>
          <div className="flex flex-wrap gap-2">
            {WARNA_OPTIONS.map(c => (
              <button
                key={c} type="button" onClick={() => setWarna(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${warna === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TwInput type="date" value={tanggalMulai} onValueChange={setTanggalMulai} label="Tanggal Mulai" />
          <TwInput type="date" value={tanggalTarget} onValueChange={setTanggalTarget} label="Target Selesai" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Batal</Btn>
        <Btn onClick={handleSubmit} isLoading={loading} disabled={!nama.trim()}>Simpan</Btn>
      </ModalFooter>
    </Modal>
  );
}
