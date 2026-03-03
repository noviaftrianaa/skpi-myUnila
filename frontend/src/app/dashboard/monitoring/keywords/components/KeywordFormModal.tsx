
"use client";

import React, { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem, Slider, Checkbox,
} from "@heroui/react";
import { keywordService, Keyword } from "@/lib/services/webmon/keywordService";
import { toast } from "react-hot-toast";

interface KeywordFormModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    initialData?: Keyword | null;
}

const CATEGORY_OPTIONS = [
    { key: "slot", label: "Judi Slot" },
    { key: "togel", label: "Judi Togel" },
    { key: "poker", label: "Judi Poker" },
    { key: "casino", label: "Judi Casino" },
    { key: "porn", label: "Pornografi" },
    { key: "scam", label: "Penipuan/Scam" },
    { key: "phishing", label: "Phishing" },
    { key: "other", label: "Lainnya" },
];

export default function KeywordFormModal({ isOpen, onClose, initialData }: KeywordFormModalProps) {
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");
    const [weight, setWeight] = useState<number>(5);
    const [isRegex, setIsRegex] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setKeyword(initialData?.keyword || "");
            setCategory(initialData?.category || "");
            setWeight(initialData?.weight || 5);
            setIsRegex(false);
            setNotes(initialData?.notes || "");
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!keyword.trim() || !category) {
            toast.error("Kata kunci dan kategori wajib diisi");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                keyword: keyword.trim(),
                category,
                weight,
                is_active: initialData?.is_active ?? 1,
                notes: notes || undefined,
            };
            if (initialData?.id) {
                await keywordService.updateKeyword(initialData.id, payload);
                toast.success("Keyword berhasil diperbarui");
            } else {
                await keywordService.createKeyword(payload);
                toast.success("Keyword berhasil ditambahkan");
            }
            onClose(true);
        } catch {
            toast.error("Gagal menyimpan keyword");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose()}
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
                        <ModalHeader className="text-base font-bold">
                            {initialData ? "Edit Keyword" : "Tambah Keyword Baru"}
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                label="Kata Kunci / Pola Regex"
                                placeholder="Contoh: slot gacor"
                                value={keyword}
                                onValueChange={setKeyword}
                                isRequired
                                size="sm"
                                variant="bordered"
                            />

                            {/* @ts-ignore */}
                            <Select
                                label="Kategori"
                                placeholder="Pilih Kategori"
                                selectedKeys={category ? [category] : []}
                                onChange={(e) => setCategory(e.target.value)}
                                isRequired
                                size="sm"
                                variant="bordered"
                                popoverProps={{
                                    classNames: {
                                        content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
                                    },
                                }}
                            >
                                {CATEGORY_OPTIONS.map((c) => (
                                    <SelectItem key={c.key}>{c.label}</SelectItem>
                                ))}
                            </Select>

                            <div className="py-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                    Bobot Ancaman: <span className="font-bold text-gray-900 dark:text-white">{weight}</span>
                                </label>
                                <Slider
                                    step={1}
                                    maxValue={10}
                                    minValue={1}
                                    value={weight}
                                    onChange={(v) => setWeight(Array.isArray(v) ? v[0] : v)}
                                    showSteps
                                    marks={[
                                        { value: 1, label: "1" },
                                        { value: 3, label: "3" },
                                        { value: 5, label: "5" },
                                        { value: 7, label: "7" },
                                        { value: 10, label: "10" },
                                    ]}
                                    classNames={{
                                        base: "max-w-full",
                                        track: "bg-gray-200 dark:bg-gray-700",
                                        filler: weight >= 8 ? "bg-red-500" : weight >= 5 ? "bg-orange-500" : "bg-green-500",
                                        mark: "text-gray-500 dark:text-gray-400 text-[10px]",
                                        step: "bg-gray-300 dark:bg-gray-600",
                                    }}
                                    size="sm"
                                />
                            </div>

                            <Checkbox
                                isSelected={isRegex}
                                onValueChange={setIsRegex}
                                size="sm"
                            >
                                <span className="text-sm text-gray-700 dark:text-gray-300">Gunakan Regular Expression (Regex)</span>
                            </Checkbox>

                            <Input
                                label="Catatan (opsional)"
                                placeholder="Keterangan tambahan..."
                                value={notes}
                                onValueChange={setNotes}
                                size="sm"
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                radius="md"
                                onPress={() => onClose()}
                                isDisabled={isSaving}
                            >
                                Batal
                            </Button>
                            <Button
                                color="primary"
                                radius="md"
                                onPress={handleSave}
                                isLoading={isSaving}
                            >
                                {isSaving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
