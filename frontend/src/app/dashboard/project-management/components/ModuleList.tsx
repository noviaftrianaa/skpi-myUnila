"use client";

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from "react-icons/fi";
import type { ProjectModule } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface ModuleListProps {
  projectId: string;
  modules: ProjectModule[];
  onModulesChange?: (modules: ProjectModule[]) => void;
}

export default function ModuleList({ projectId, modules, onModulesChange }: ModuleListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editModule, setEditModule] = useState<ProjectModule | null>(null);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  const openAdd = () => {
    setNama("");
    setDeskripsi("");
    setIsAddOpen(true);
  };

  const openEdit = (m: ProjectModule) => {
    setEditModule(m);
    setNama(m.nama);
    setDeskripsi(m.deskripsi ?? "");
  };

  const handleSave = async () => {
    if (!nama.trim()) return;
    setLoading(true);
    try {
      if (editModule) {
        const updated = await projectService.updateModule(projectId, editModule.id, { nama, deskripsi });
        onModulesChange?.(modules.map(m => m.id === updated.id ? updated : m));
        setEditModule(null);
      } else {
        const created = await projectService.createModule(projectId, { nama, deskripsi });
        onModulesChange?.([...modules, created]);
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (m: ProjectModule) => {
    if (!confirm(`Hapus modul "${m.nama}"?`)) return;
    try {
      await projectService.deleteModule(projectId, m.id);
      onModulesChange?.(modules.filter(mod => mod.id !== m.id));
    } catch (err) {
      console.error(err);
    }
  };

  const ModuleFormModal = ({ isOpen, onClose, title }: { isOpen: boolean; onClose: () => void; title: string }) => (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">{title}</h2>
        </ModalHeader>
        <ModalBody className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Modul <span className="text-red-500">*</span>
            </label>
            <Input
              value={nama}
              onValueChange={setNama}
              placeholder="cth. Manajemen Akses"
              variant="bordered"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Deskripsi
            </label>
            <Input
              value={deskripsi}
              onValueChange={setDeskripsi}
              placeholder="Deskripsi modul (opsional)"
              variant="bordered"
            />
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
          <Button variant="light" onPress={onClose} isDisabled={loading}>Batal</Button>
          <Button
            color="primary"
            className="bg-[#0B5EA8]"
            onPress={handleSave}
            isLoading={loading}
            isDisabled={!nama.trim()}
          >
            Simpan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-[#0B5EA8]" />
          Daftar Modul
        </h3>
        <Button
          size="sm"
          color="primary"
          className="bg-[#0B5EA8] text-white"
          startContent={<FiPlus className="w-3.5 h-3.5" />}
          onPress={openAdd}
        >
          Tambah Modul
        </Button>
      </div>

      {/* Module list */}
      {modules.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <FiLayers className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Belum ada modul. Tambahkan modul pertama!</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {modules.map((m, i) => (
            <Card key={m.id} className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0B5EA8]/10 text-[#0B5EA8] flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.nama}</p>
                      {m.deskripsi && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.deskripsi}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => openEdit(m)}
                      className="text-gray-500"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(m)}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add modal */}
      <ModuleFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Modul"
      />

      {/* Edit modal */}
      <ModuleFormModal
        isOpen={!!editModule}
        onClose={() => setEditModule(null)}
        title="Edit Modul"
      />
    </div>
  );
}
