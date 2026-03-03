
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import BloggerConnectForm from "./BloggerConnectForm";

interface SiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // Replace with Site type if available
}

export default function SiteFormModal({ isOpen, onClose, initialData }: SiteFormModalProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("");

    useEffect(() => {
        if (isOpen && initialData) {
            setSelectedPlatform(initialData.platform);
        } else if (isOpen) {
            setSelectedPlatform("");
        }
    }, [isOpen, initialData]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
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
                            {initialData ? "Edit Situs" : "Tambah Situs Baru"}
                        </ModalHeader>
                        <ModalBody>
                            <Input label="Nama Situs" placeholder="Contoh: Portal FMIPA" defaultValue={initialData?.name} />
                            <Input label="URL" placeholder="https://..." defaultValue={initialData?.url} />
                            {/* @ts-ignore */}
                            <Select
                                label="Platform"
                                placeholder="Pilih Platform"
                                selectedKeys={selectedPlatform ? [selectedPlatform] : []}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                            >
                                <SelectItem key="WordPress">WordPress</SelectItem>
                                <SelectItem key="Blogger">Blogger</SelectItem>
                                <SelectItem key="Joomla">Joomla</SelectItem>
                                <SelectItem key="Custom">Custom</SelectItem>
                            </Select>

                            {selectedPlatform === "Blogger" && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                    <BloggerConnectForm />
                                </div>
                            )}

                            <Select label="Unit/Fakultas" placeholder="Pilih Unit" defaultSelectedKeys={initialData ? [initialData.fakultas] : []}>
                                <SelectItem key="FMIPA">FMIPA</SelectItem>
                                <SelectItem key="FISIP">FISIP</SelectItem>
                                <SelectItem key="FT">Fakultas Teknik</SelectItem>
                                {/* Add more as needed */}
                            </Select>
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
