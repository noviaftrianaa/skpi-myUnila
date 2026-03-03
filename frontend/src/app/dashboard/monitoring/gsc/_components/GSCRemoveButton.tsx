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

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="md"
                backdrop="blur"
                radius="lg"
                classNames={{
                    backdrop: "bg-black/50 backdrop-blur-sm",
                    base: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl",
                    header: "border-b border-gray-100 dark:border-gray-800 px-6 py-4",
                    body: "px-6 py-4 space-y-4",
                    footer: "border-t border-gray-100 dark:border-gray-800 px-6 py-4",
                    closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800",
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="text-base font-bold">Request Google URL Removal</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Submit permintaan hapus URL ke Google via Indexing API.
                                    Default quota: 200 request/hari (bisa ditingkatkan di Google Cloud Console).
                                </p>

                                <Input
                                    label="URL Halaman"
                                    placeholder="https://nama-unit.unila.ac.id/halaman-judol"
                                    value={url}
                                    onValueChange={setUrl}
                                    type="url"
                                    size="sm"
                                    variant="bordered"
                                />

                                <Input
                                    label="ID Ancaman (Threat ID)"
                                    placeholder="contoh: 42"
                                    value={threatId}
                                    onValueChange={setThreatId}
                                    type="number"
                                    size="sm"
                                    variant="bordered"
                                />

                                {/* @ts-ignore */}
                                <Select
                                    label="Aksi"
                                    selectedKeys={action ? [action] : []}
                                    onChange={(e) => setAction(e.target.value)}
                                    size="sm"
                                    variant="bordered"
                                >
                                    <SelectItem key="URL_DELETED">URL_DELETED — Halaman sudah dihapus</SelectItem>
                                    <SelectItem key="URL_UPDATED">URL_UPDATED — Konten sudah diperbarui</SelectItem>
                                </Select>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="text-emerald-600 text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        Berhasil disubmit ke Google Search Console
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" radius="md" onPress={onClose} isDisabled={loading}>Batal</Button>
                                <Button
                                    color="danger"
                                    radius="md"
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                    isDisabled={!url.trim() || !threatId.trim()}
                                >
                                    Submit Removal
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
