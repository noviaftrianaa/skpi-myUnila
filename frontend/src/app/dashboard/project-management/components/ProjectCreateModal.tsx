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
} from "@heroui/react";
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

export default function ProjectCreateModal({
  isOpen,
  onClose,
  onCreated,
}: ProjectCreateModalProps) {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [warna, setWarna] = useState("#0B5EA8");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalTarget, setTanggalTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setNama("");
    setDeskripsi("");
    setRepoUrl("");
    setWarna("#0B5EA8");
    setTanggalMulai("");
    setTanggalTarget("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!nama.trim()) {
      setError("Nama project wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await projectService.createProject({
        nama,
        deskripsi: deskripsi || undefined,
        repo_url: repoUrl || undefined,
        warna,
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_target: tanggalTarget || undefined,
        status: 'active',
      });
      onCreated?.(created);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal membuat project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Project Baru</h2>
        </ModalHeader>
        <ModalBody className="py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Nama Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Project <span className="text-red-500">*</span>
            </label>
            <Input
              value={nama}
              onValueChange={setNama}
              placeholder="cth. MyUnila Portal"
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
              placeholder="Deskripsi singkat tentang project..."
              variant="bordered"
              minRows={2}
            />
          </div>

          {/* Repo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Repository URL
            </label>
            <Input
              value={repoUrl}
              onValueChange={setRepoUrl}
              placeholder="https://github.com/org/repo"
              variant="bordered"
            />
          </div>

          {/* Warna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Warna Aksen
            </label>
            <div className="flex flex-wrap gap-2">
              {WARNA_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setWarna(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    warna === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={warna}
                onChange={e => setWarna(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                title="Pilih warna kustom"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Warna dipilih: <span className="font-mono">{warna}</span></p>
          </div>

          {/* Tanggal Mulai & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={tanggalMulai}
                onValueChange={setTanggalMulai}
                variant="bordered"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Target Selesai
              </label>
              <Input
                type="date"
                value={tanggalTarget}
                onValueChange={setTanggalTarget}
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
            isDisabled={!nama.trim()}
          >
            Buat Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
