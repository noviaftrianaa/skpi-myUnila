"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Btn, TwInput, TwTextarea, useToast } from "./ui";
import type { Project } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

const WARNA_OPTIONS = [
  "#0B5EA8", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6B7280",
];

export default function ProjectCreateModal({ isOpen, onClose, onCreated }: ProjectCreateModalProps) {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [warna, setWarna] = useState("#0B5EA8");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalTarget, setTanggalTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleClose = () => {
    setNama(""); setDeskripsi(""); setRepoUrl(""); setWarna("#0B5EA8");
    setTanggalMulai(""); setTanggalTarget(""); setError(""); onClose();
  };

  const handleSubmit = async () => {
    if (!nama.trim()) { setError("Nama project wajib diisi"); return; }
    setLoading(true); setError("");
    try {
      const created = await projectService.createProject({
        nama, deskripsi: deskripsi || undefined, repo_url: repoUrl || undefined,
        warna, tanggal_mulai: tanggalMulai || undefined,
        tanggal_target: tanggalTarget || undefined, status: 'active',
      });
      onCreated?.(created);
      toast("Project berhasil dibuat!", "success");
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal membuat project";
      setError(msg);
      toast(msg, "error");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Project Baru</h2>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <TwInput value={nama} onValueChange={setNama} placeholder="cth. MyUnila Portal" label="Nama Project *" autoFocus />
        <TwTextarea value={deskripsi} onValueChange={setDeskripsi} placeholder="Deskripsi singkat tentang project..." label="Deskripsi" rows={2} />
        <TwInput value={repoUrl} onValueChange={setRepoUrl} placeholder="https://bitbucket.org/org/repo" label="Repository URL" />

        {/* Warna Aksen */}
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
            <input type="color" value={warna} onChange={e => setWarna(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Warna: <span className="font-mono">{warna}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TwInput type="date" value={tanggalMulai} onValueChange={setTanggalMulai} label="Tanggal Mulai" />
          <TwInput type="date" value={tanggalTarget} onValueChange={setTanggalTarget} label="Target Selesai" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Btn variant="ghost" onClick={handleClose} disabled={loading}>Batal</Btn>
        <Btn onClick={handleSubmit} isLoading={loading} disabled={!nama.trim()}>Buat Project</Btn>
      </ModalFooter>
    </Modal>
  );
}
