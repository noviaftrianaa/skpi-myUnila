"use client";

import { useEffect, useState } from "react";
import {
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader,
    Button, Chip, Divider, Spinner, Textarea,
} from "@heroui/react";
import { FiExternalLink, FiCheck, FiX, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { threatService, Threat } from "@/lib/services/webmon/threatService";
import { gscService } from "@/lib/services/webmon/gscService";
import { toast } from "react-hot-toast";

interface ThreatDetailModalProps {
    threatId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdated?: () => void;
}

const STATUS_COLOR: Record<string, "danger" | "warning" | "success" | "default"> = {
    pending: "danger",
    confirmed: "warning",
    resolved: "success",
    false_positive: "default",
};

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 15 ? "text-red-600 bg-red-50" : score >= 10 ? "text-orange-600 bg-orange-50" : "text-yellow-600 bg-yellow-50";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${color}`}>
            Skor {score}
        </span>
    );
}

export default function ThreatDetailModal({ threatId, isOpen, onClose, onStatusUpdated }: ThreatDetailModalProps) {
    const [threat, setThreat] = useState<Threat | null>(null);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && threatId) {
            setLoading(true);
            setThreat(null);
            threatService.getThreat(threatId)
                .then((t) => { setThreat(t); setNotes(t.notes || ""); })
                .catch(() => toast.error("Gagal memuat detail ancaman"))
                .finally(() => setLoading(false));
        }
    }, [isOpen, threatId]);

    const handleUpdateStatus = async (status: string) => {
        if (!threat) return;
        setActionLoading(status);
        try {
            await threatService.updateStatus(threat.id, status, notes || undefined);
            toast.success(`Status diubah ke "${status}"`);
            onStatusUpdated?.();
            onClose();
        } catch {
            toast.error("Gagal update status");
        } finally {
            setActionLoading(null);
        }
    };

    const handleGSCRemove = async () => {
        if (!threat) return;
        setActionLoading("gsc");
        try {
            await gscService.removeThreat(threat.id);
            toast.success("URL removal request dikirim ke Google Search Console");
        } catch {
            toast.error("Gagal mengirim GSC removal request");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex items-center gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-500" />
                    <span>Detail Ancaman #{threatId}</span>
                </ModalHeader>
                <ModalBody className="gap-4 pb-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spinner label="Memuat detail..." />
                        </div>
                    ) : !threat ? (
                        <div className="text-center text-gray-400 py-8">Data tidak ditemukan</div>
                    ) : (
                        <>
                            {/* Status & Score row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Chip color={STATUS_COLOR[threat.status] ?? "default"} variant="dot" size="sm">
                                    {threat.status}
                                </Chip>
                                <ScoreBadge score={threat.threat_score} />
                                <Chip variant="flat" size="sm">{threat.category}</Chip>
                            </div>

                            {/* Site & URL */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Situs</p>
                                        <p className="font-semibold text-gray-900 text-sm">{threat.site_name || threat.site_id}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">URL Halaman</p>
                                    <a
                                        href={threat.page_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1 break-all"
                                    >
                                        {threat.page_url} <FiExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                    </a>
                                </div>
                                {threat.page_title && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Judul Halaman</p>
                                        <p className="text-sm text-gray-800">{threat.page_title}</p>
                                    </div>
                                )}
                            </div>

                            {/* Keywords */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Kata Kunci Terdeteksi</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {threat.matched_keywords.split(",").map((k, i) => (
                                        <Chip key={i} size="sm" color="danger" variant="flat">{k.trim()}</Chip>
                                    ))}
                                </div>
                            </div>

                            {/* Snippet */}
                            {threat.snippet && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cuplikan Konten</p>
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-gray-700 italic leading-relaxed">
                                        &ldquo;{threat.snippet}&rdquo;
                                    </div>
                                </div>
                            )}

                            <Divider />

                            {/* Timeline */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Terdeteksi</p>
                                    <p className="font-medium">
                                        {threat.detected_at ? new Date(threat.detected_at).toLocaleString("id-ID") : "-"}
                                    </p>
                                </div>
                                {threat.confirmed_at && (
                                    <div>
                                        <p className="text-xs text-gray-500">Dikonfirmasi</p>
                                        <p className="font-medium">{new Date(threat.confirmed_at).toLocaleString("id-ID")}</p>
                                        {threat.confirmed_by && <p className="text-xs text-gray-400">oleh {threat.confirmed_by}</p>}
                                    </div>
                                )}
                                {threat.resolved_at && (
                                    <div>
                                        <p className="text-xs text-gray-500">Diselesaikan</p>
                                        <p className="font-medium">{new Date(threat.resolved_at).toLocaleString("id-ID")}</p>
                                        {threat.resolved_by && <p className="text-xs text-gray-400">oleh {threat.resolved_by}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {(threat.status === "pending" || threat.status === "confirmed") && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Catatan Tindakan</p>
                                    <Textarea
                                        placeholder="Tambah catatan tindakan yang diambil (opsional)..."
                                        value={notes}
                                        onValueChange={setNotes}
                                        minRows={2}
                                        size="sm"
                                    />
                                </div>
                            )}
                            {threat.notes && threat.status !== "pending" && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Catatan</p>
                                    <p className="text-sm text-gray-700">{threat.notes}</p>
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter className="flex-wrap gap-2">
                    {threat && (
                        <>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<FiTrash2 className="w-3.5 h-3.5" />}
                                isLoading={actionLoading === "gsc"}
                                onPress={handleGSCRemove}
                            >
                                Request GSC Removal
                            </Button>
                            {threat.status === "pending" && (
                                <>
                                    <Button
                                        size="sm"
                                        color="warning"
                                        variant="flat"
                                        startContent={<FiCheck className="w-3.5 h-3.5" />}
                                        isLoading={actionLoading === "confirmed"}
                                        onPress={() => handleUpdateStatus("confirmed")}
                                    >
                                        Konfirmasi
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        startContent={<FiX className="w-3.5 h-3.5" />}
                                        isLoading={actionLoading === "false_positive"}
                                        onPress={() => handleUpdateStatus("false_positive")}
                                    >
                                        False Positive
                                    </Button>
                                </>
                            )}
                            {threat.status === "confirmed" && (
                                <Button
                                    size="sm"
                                    color="success"
                                    startContent={<FiCheck className="w-3.5 h-3.5" />}
                                    isLoading={actionLoading === "resolved"}
                                    onPress={() => handleUpdateStatus("resolved")}
                                >
                                    Tandai Resolved
                                </Button>
                            )}
                        </>
                    )}
                    <Button variant="light" size="sm" onPress={onClose}>Tutup</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
