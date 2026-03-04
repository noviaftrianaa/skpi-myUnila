
"use client";

import React, { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem, Autocomplete, AutocompleteItem,
} from "@heroui/react";
import { siteService, Site, SMSUnit } from "@/lib/services/webmon/siteService";
import { toast } from "react-hot-toast";

interface SiteFormModalProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    initialData?: Site | null;
}

const PLATFORM_OPTIONS = [
    { key: "blogger", label: "Blogger" },
    { key: "wordpress", label: "WordPress" },
    { key: "joomla", label: "Joomla" },
    { key: "drupal", label: "Drupal" },
    { key: "custom", label: "Custom" },
];

const labelCls = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
const requiredCls = "text-red-500 ml-0.5";

export default function SiteFormModal({ isOpen, onClose, initialData }: SiteFormModalProps) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [platform, setPlatform] = useState("");
    const [bloggerBlogId, setBloggerBlogId] = useState("");
    const [bloggerApiKey, setBloggerApiKey] = useState("");
    const [idSms, setIdSms] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminWhatsApp, setAdminWhatsApp] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [smsUnits, setSmsUnits] = useState<SMSUnit[]>([]);
    const [smsLoading, setSmsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setUrl(initialData?.url || "");
            setPlatform(initialData?.platform || "");
            setBloggerBlogId(initialData?.blogger_blog_id || "");
            setBloggerApiKey(initialData?.blogger_api_key || "");
            setIdSms(initialData?.id_sms || "");
            setAdminName(initialData?.admin_name || "");
            setAdminEmail(initialData?.admin_email || "");
            setAdminWhatsApp(initialData?.admin_whatsapp || "");
            setSmsLoading(true);
            siteService.listSMSUnits()
                .then((units) => setSmsUnits(units))
                .catch(() => setSmsUnits([]))
                .finally(() => setSmsLoading(false));
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!name.trim() || !url.trim() || !platform) {
            toast.error("Nama, URL, dan Platform wajib diisi");
            return;
        }
        setIsSaving(true);
        try {
            const payload: Partial<Site> = {
                name: name.trim(),
                url: url.trim(),
                platform,
                blogger_blog_id: bloggerBlogId || undefined,
                blogger_api_key: bloggerApiKey || undefined,
                id_sms: idSms || undefined,
                admin_name: adminName || undefined,
                admin_email: adminEmail || undefined,
                admin_whatsapp: adminWhatsApp || undefined,
            };
            if (initialData?.id) {
                await siteService.updateSite(initialData.id, payload);
                toast.success("Situs berhasil diperbarui");
            } else {
                await siteService.createSite(payload);
                toast.success("Situs berhasil ditambahkan");
            }
            onClose(true);
        } catch {
            toast.error("Gagal menyimpan situs");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose()}
            size="lg"
            backdrop="blur"
            radius="lg"
            scrollBehavior="inside"
            classNames={{
                backdrop: "bg-black/50 backdrop-blur-sm",
                base: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl",
                header: "border-b border-gray-100 dark:border-gray-800 px-6 py-4",
                body: "px-6 py-5",
                footer: "border-t border-gray-100 dark:border-gray-800 px-6 py-4",
                closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="text-base font-bold">
                            {initialData ? "Edit Situs" : "Tambah Situs Baru"}
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Nama Situs<span className={requiredCls}>*</span></label>
                                        <Input
                                            placeholder="Contoh: Portal FMIPA"
                                            value={name}
                                            onValueChange={setName}
                                            size="sm"
                                            variant="bordered"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>URL<span className={requiredCls}>*</span></label>
                                        <Input
                                            placeholder="https://fmipa.unila.ac.id"
                                            value={url}
                                            onValueChange={setUrl}
                                            size="sm"
                                            variant="bordered"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Platform<span className={requiredCls}>*</span></label>
                                    {/* @ts-ignore */}
                                    <Select
                                        placeholder="Pilih Platform"
                                        selectedKeys={platform ? [platform] : []}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        size="sm"
                                        variant="bordered"
                                        popoverProps={{
                                            classNames: {
                                                content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
                                            },
                                        }}
                                    >
                                        {PLATFORM_OPTIONS.map((p) => (
                                            <SelectItem key={p.key}>{p.label}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {platform === "blogger" && (
                                    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Konfigurasi Blogger API</p>
                                        <div>
                                            <label className={labelCls}>Blog ID</label>
                                            <Input
                                                placeholder="Contoh: 123456789"
                                                value={bloggerBlogId}
                                                onValueChange={setBloggerBlogId}
                                                size="sm"
                                                variant="bordered"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>API Key</label>
                                            <Input
                                                placeholder="Google API Key"
                                                value={bloggerApiKey}
                                                onValueChange={setBloggerApiKey}
                                                size="sm"
                                                variant="bordered"
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelCls}>Unit/Fakultas (pdrd.sms)</label>
                                    {/* @ts-ignore */}
                                    <Autocomplete
                                        placeholder={smsLoading ? "Memuat unit..." : "Cari unit..."}
                                        isLoading={smsLoading}
                                        selectedKey={idSms || null}
                                        onSelectionChange={(key) => setIdSms(key as string || "")}
                                        size="sm"
                                        variant="bordered"
                                        popoverProps={{
                                            classNames: {
                                                content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
                                            },
                                        }}
                                        listboxProps={{
                                            className: "text-gray-800 dark:text-gray-200",
                                        }}
                                    >
                                        {smsUnits.map((u) => (
                                            <AutocompleteItem key={u.id_sms} textValue={u.nm_lemb}>
                                                <div>
                                                    <div className="text-sm font-medium">{u.nm_lemb}</div>
                                                    {u.singkatan && (
                                                        <div className="text-xs text-gray-400">{u.singkatan}</div>
                                                    )}
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                </div>

                                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-2 mb-3">Penanggung Jawab (PJ)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Nama PJ</label>
                                            <Input
                                                placeholder="Nama pengelola website"
                                                value={adminName}
                                                onValueChange={setAdminName}
                                                size="sm"
                                                variant="bordered"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Email Admin</label>
                                            <Input
                                                placeholder="admin@unila.ac.id"
                                                value={adminEmail}
                                                onValueChange={setAdminEmail}
                                                size="sm"
                                                variant="bordered"
                                                type="email"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>WhatsApp</label>
                                            <Input
                                                placeholder="08123456789"
                                                value={adminWhatsApp}
                                                onValueChange={setAdminWhatsApp}
                                                size="sm"
                                                variant="bordered"
                                                startContent={<span className="text-xs text-gray-400">WA</span>}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
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
