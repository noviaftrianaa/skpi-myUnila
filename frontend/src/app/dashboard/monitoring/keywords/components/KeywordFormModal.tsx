
"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Checkbox, Slider } from "@heroui/react";

interface KeywordFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

export default function KeywordFormModal({ isOpen, onClose, initialData }: KeywordFormModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            backdrop="blur"
            radius="lg"
            classNames={{
                base: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl",
                header: "border-b border-gray-100 dark:border-gray-800 p-6 pb-4",
                body: "py-6 px-6",
                footer: "border-t border-gray-100 dark:border-gray-800 p-6 pt-4",
                closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {initialData ? "Edit Keyword" : "Tambah Keyword Baru"}
                        </ModalHeader>
                        <ModalBody>
                            <Input label="Kata Kunci / Pola Regex" placeholder="Contoh: slot gacor" defaultValue={initialData?.keyword} />
                            <Select label="Kategori" placeholder="Pilih Kategori" defaultSelectedKeys={initialData ? [initialData.category] : []}>
                                <SelectItem key="slot">Judi Slot</SelectItem>
                                <SelectItem key="togel">Judi Togel</SelectItem>
                                <SelectItem key="poker">Judi Poker</SelectItem>
                                <SelectItem key="porn">Pornografi</SelectItem>
                                <SelectItem key="scam">Penipuan/Scam</SelectItem>
                            </Select>
                            <div className="py-2">
                                <label className="text-sm text-gray-500 mb-1 block">Bobot Ancaman (Severity)</label>
                                <Slider
                                    step={1}
                                    maxValue={10}
                                    minValue={1}
                                    defaultValue={initialData?.weight || 5}
                                    showSteps={true}
                                    marks={[
                                        { value: 1, label: "Low" },
                                        { value: 5, label: "Medium" },
                                        { value: 10, label: "Critical" },
                                    ]}
                                    className="max-w-md"
                                />
                            </div>
                            <Checkbox defaultSelected={initialData?.is_regex}>
                                Gunakan Regular Expression (Regex)
                            </Checkbox>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Batal
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
