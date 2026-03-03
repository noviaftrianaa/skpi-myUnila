"use client";

import { useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Select, SelectItem } from "@heroui/react";
import { FiTrash2, FiAlertCircle } from "react-icons/fi";
import { gscService } from "@/lib/services/webmon/gscService";

interface GSCRemoveButtonProps {
    onSuccess?: () => void;
}

export default function GSCRemoveButton({ onSuccess }: GSCRemoveButtonProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [url, setUrl] = useState("");
    const [threatId, setThreatId] = useState("");
    const [action, setAction] = useState("URL_DELETED");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!url.trim() || !threatId.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await gscService.removeURL({
                threat_id: parseInt(threatId),
                url: url.trim(),
                action,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setUrl("");
                setThreatId("");
                onSuccess?.();
            }, 1500);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || "Gagal submit URL removal ke Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button color="danger" variant="flat" startContent={<FiTrash2 className="w-4 h-4" />} onPress={onOpen}>
                Request URL Removal
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalContent>
                    <ModalHeader className="text-base font-bold">Request Google URL Removal</ModalHeader>
                    <ModalBody className="gap-4">
                        <p className="text-sm text-gray-600">
                            Submit permintaan hapus URL dari hasil pencarian Google Search Console.
                            Quota: 200 request/hari.
                        </p>

                        <Input
                            label="URL Halaman"
                            placeholder="https://nama-unit.unila.ac.id/halaman-judol"
                            value={url}
                            onValueChange={setUrl}
                            type="url"
                            size="sm"
                        />

                        <Input
                            label="ID Ancaman (Threat ID)"
                            placeholder="contoh: 42"
                            value={threatId}
                            onValueChange={setThreatId}
                            type="number"
                            size="sm"
                        />

                        <Select
                            label="Aksi"
                            selectedKeys={[action]}
                            onSelectionChange={(keys) => setAction(Array.from(keys)[0] as string)}
                            size="sm"
                        >
                            <SelectItem key="URL_DELETED">URL_DELETED — Halaman sudah dihapus</SelectItem>
                            <SelectItem key="URL_UPDATED">URL_UPDATED — Konten sudah diperbarui</SelectItem>
                        </Select>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg">
                                ✓ Berhasil disubmit ke Google Search Console
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose} isDisabled={loading}>Batal</Button>
                        <Button
                            color="danger"
                            onPress={handleSubmit}
                            isLoading={loading}
                            isDisabled={!url.trim() || !threatId.trim()}
                        >
                            Submit Removal
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
