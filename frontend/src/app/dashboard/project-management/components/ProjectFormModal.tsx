"use client";

import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Btn, TwInput, TwTextarea, useToast } from "./ui";
import type { Project } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (project: Project) => void;
  project?: Project | null; // null = create, object = edit
}

const WARNA_OPTIONS = [
  "#6366f1", "#0B5EA8", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316",
];

export default function ProjectFormModal({ isOpen, onClose, onSaved, project }: ProjectFormModalProps) {
  const isEdit = !!project;
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [warna, setWarna] = useState("#6366f1");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalTarget, setTanggalTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setNama(project.nama ?? "");
      setDeskripsi(project.deskripsi ?? "");
      setRepoUrl(project.repo_url ?? "");
      setWarna(project.warna ?? "#6366f1");
      setTanggalMulai(project.tanggal_mulai?.split("T")[0] ?? project.tgl_mulai?.split("T")[0] ?? "");
      setTanggalTarget(project.tanggal_target?.split("T")[0] ?? project.tgl_target?.split("T")[0] ?? "");
    } else {
      setNama(""); setDeskripsi(""); setRepoUrl(""); setWarna("#6366f1");
      setTanggalMulai(""); setTanggalTarget("");
    }
    setError("");
  }, [project, isOpen]);

  const handleClose = () => { setError(""); onClose(); };

  const handleSubmit = async () => {
    if (!nama.trim()) { setError("Nama project wajib diisi"); return; }
    setLoading(true); setError("");
    try {
      const data = {
        nama, deskripsi: deskripsi || undefined, repo_url: repoUrl || undefined,
        warna, tanggal_mulai: tanggalMulai || undefined,
        tanggal_target: tanggalTarget || undefined,
      };
      let saved: Project;
      if (isEdit) {
        saved = await projectService.updateProject(project!.id, data);
        toast("Project diupdate!", "success");
      } else {
        saved = await projectService.createProject({ ...data, status: "active" });
        toast("Project dibuat!", "success");
      }
      onSaved?.(saved);
      handleClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || `Gagal ${isEdit ? "update" : "membuat"} project`;
      setError(msg);
      toast(msg, "error");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Project" : "Buat Project Baru"}
        </h2>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <TwInput value={nama} onValueChange={setNama} placeholder="cth. MyUnila Portal" label="Nama Project *" autoFocus />
        <TwTextarea value={deskripsi} onValueChange={setDeskripsi} placeholder="Deskripsi singkat..." label="Deskripsi" rows={2} />
        <TwInput value={repoUrl} onValueChange={setRepoUrl} placeholder="https://bitbucket.org/org/repo" label="Repository URL" />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Warna Aksen</label>
          <div className="flex flex-wrap gap-2">
            {WARNA_OPTIONS.map(c => (
              <button key={c} type="button" onClick={() => setWarna(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${warna === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }} />
            ))}
            <input type="color" value={warna} onChange={e => setWarna(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TwInput type="date" value={tanggalMulai} onValueChange={setTanggalMulai} label="Tanggal Mulai" />
          <TwInput type="date" value={tanggalTarget} onValueChange={setTanggalTarget} label="Target Selesai" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Btn variant="ghost" onClick={handleClose} disabled={loading}>Batal</Btn>
        <Btn onClick={handleSubmit} isLoading={loading} disabled={!nama.trim()}>
          {isEdit ? "Simpan" : "Buat Project"}
        </Btn>
      </ModalFooter>
    </Modal>
  );
}
