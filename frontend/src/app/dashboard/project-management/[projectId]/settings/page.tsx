"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardBody,
  Button,
  Input,
  Switch,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FiFolder,
  FiGitBranch,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiInfo,
  FiSettings,
  FiUsers,
  FiEye,
  FiLock,
  FiSearch,
  FiUserPlus,
} from "react-icons/fi";
import Link from "next/link";
import {
  projectService,
  type Project,
  type WebhookConfig,
  type ProjectMember,
  type ProjectWatcher,
  type AddMemberRequest,
  type AddWatcherRequest,
} from "@/lib/services/project/projectService";

const WEBHOOK_URL = "http://192.168.120.45:8095/webhooks/bitbucket";

function generateSecret(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const MEMBER_ROLES = [
  { value: "owner", label: "Owner", color: "danger" as const },
  { value: "admin", label: "Admin", color: "warning" as const },
  { value: "member", label: "Member", color: "primary" as const },
  { value: "viewer", label: "Viewer", color: "default" as const },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [watchers, setWatchers] = useState<ProjectWatcher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Visibility state
  const [visibility, setVisibility] = useState("private");
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  // Add webhook form
  const webhookModal = useDisclosure();
  const [formProvider, setFormProvider] = useState("bitbucket");
  const [formRepo, setFormRepo] = useState("");
  const [formSecret, setFormSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Add member form
  const memberModal = useDisclosure();
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<Array<{ id_pengguna: string; nama: string; username: string; email?: string }>>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [selectedMemberUser, setSelectedMemberUser] = useState<{ id_pengguna: string; nama: string } | null>(null);
  const [memberRole, setMemberRole] = useState("member");
  const [addingMember, setAddingMember] = useState(false);

  // Add watcher form
  const watcherModal = useDisclosure();
  const [watcherSearch, setWatcherSearch] = useState("");
  const [watcherSearchResults, setWatcherSearchResults] = useState<Array<{ id_pengguna: string; nama: string; username: string; email?: string }>>([]);
  const [watcherSearching, setWatcherSearching] = useState(false);
  const [selectedWatcherUser, setSelectedWatcherUser] = useState<{ id_pengguna: string; nama: string } | null>(null);
  const [watcherJabatan, setWatcherJabatan] = useState("");
  const [watcherUnit, setWatcherUnit] = useState("");
  const [addingWatcher, setAddingWatcher] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [proj, whs, mems, wats] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getWebhooks(projectId).catch(() => []),
        projectService.getMembers(projectId).catch(() => []),
        projectService.getWatchers(projectId).catch(() => []),
      ]);
      setProject(proj);
      setWebhooks(whs ?? []);
      setMembers(mems ?? []);
      setWatchers(wats ?? []);
      setVisibility((proj as Record<string, unknown>).visibility as string ?? "private");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search users for member/watcher add
  const searchUsers = useCallback(async (query: string, type: "member" | "watcher") => {
    if (query.length < 2) {
      type === "member" ? setMemberSearchResults([]) : setWatcherSearchResults([]);
      return;
    }
    type === "member" ? setMemberSearching(true) : setWatcherSearching(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROJECT_API_URL || "http://localhost:8090/api/v1"}/users/search?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      if (data.success) {
        type === "member"
          ? setMemberSearchResults(data.data ?? [])
          : setWatcherSearchResults(data.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      type === "member" ? setMemberSearching(false) : setWatcherSearching(false);
    }
  }, []);

  // Debounced member search
  useEffect(() => {
    const t = setTimeout(() => searchUsers(memberSearch, "member"), 400);
    return () => clearTimeout(t);
  }, [memberSearch, searchUsers]);

  // Debounced watcher search
  useEffect(() => {
    const t = setTimeout(() => searchUsers(watcherSearch, "watcher"), 400);
    return () => clearTimeout(t);
  }, [watcherSearch, searchUsers]);

  // === Webhook handlers ===
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* fallback */ }
  };

  const handleToggleActive = async (wh: WebhookConfig) => {
    setTogglingId(wh.id_webhook);
    try {
      await projectService.updateWebhook(projectId, wh.id_webhook, { a_active: !wh.a_active });
      await loadData();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Hapus webhook ini?")) return;
    setDeletingId(webhookId);
    try {
      await projectService.deleteWebhook(projectId, webhookId);
      setWebhooks((prev) => prev.filter((w) => w.id_webhook !== webhookId));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const handleSubmitWebhook = async () => {
    setFormError("");
    if (!formRepo.trim()) { setFormError("Repo full name wajib diisi"); return; }
    setIsSubmitting(true);
    try {
      await projectService.createWebhook(projectId, {
        provider: formProvider,
        repo_full_name: formRepo.trim(),
        webhook_secret: formSecret.trim(),
      });
      webhookModal.onClose();
      setFormRepo("");
      setFormSecret("");
      await loadData();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Gagal membuat webhook");
    } finally { setIsSubmitting(false); }
  };

  // === Member handlers ===
  const handleAddMember = async () => {
    if (!selectedMemberUser) return;
    setAddingMember(true);
    try {
      await projectService.addMember(projectId, {
        id_pengguna: selectedMemberUser.id_pengguna,
        nm_pengguna: selectedMemberUser.nama,
        role: memberRole as AddMemberRequest["role"],
      }, user?.id);
      memberModal.onClose();
      setSelectedMemberUser(null);
      setMemberSearch("");
      setMemberRole("member");
      await loadData();
    } catch (e) { console.error(e); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Hapus anggota ini dari project?")) return;
    try {
      await projectService.removeMember(projectId, memberId);
      setMembers((prev) => prev.filter((m) => m.id_member !== memberId));
    } catch (e) { console.error(e); }
  };

  // === Watcher handlers ===
  const handleAddWatcher = async () => {
    if (!selectedWatcherUser) return;
    setAddingWatcher(true);
    try {
      await projectService.addWatcher(projectId, {
        id_pengguna: selectedWatcherUser.id_pengguna,
        nm_pengguna: selectedWatcherUser.nama,
        jabatan: watcherJabatan,
        nm_unit: watcherUnit,
      });
      watcherModal.onClose();
      setSelectedWatcherUser(null);
      setWatcherSearch("");
      setWatcherJabatan("");
      setWatcherUnit("");
      await loadData();
    } catch (e) { console.error(e); }
    finally { setAddingWatcher(false); }
  };

  const handleRemoveWatcher = async (watcherId: string) => {
    if (!confirm("Hapus pengawas ini dari project?")) return;
    try {
      await projectService.removeWatcher(projectId, watcherId);
      setWatchers((prev) => prev.filter((w) => w.id_watcher !== watcherId));
    } catch (e) { console.error(e); }
  };

  // === Visibility handler ===
  const handleSaveVisibility = async () => {
    setIsSavingVisibility(true);
    try {
      await projectService.updateProject(projectId, { visibility } as Partial<Project>);
    } catch (e) { console.error(e); }
    finally { setIsSavingVisibility(false); }
  };

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" color="primary" />
          </div>
        </>
);
  }

  return (
      <>
        <div className="space-y-6 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/project-management" className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors">
              Project Management
            </Link>
            <span className="text-gray-300">/</span>
            <Link href={`/dashboard/project-management/${projectId}/board`} className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors">
              {project?.nama ?? "..."}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <FiSettings className="w-3.5 h-3.5" />
              Pengaturan
            </span>
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            color="primary"
            classNames={{
              tabList: "gap-4",
              tab: "text-sm",
            }}
          >
            <Tab
              key="members"
              title={
                <div className="flex items-center gap-1.5">
                  <FiUsers className="w-4 h-4" />
                  <span>Tim Anggota</span>
                  <Chip size="sm" variant="flat" className="text-[10px]">{members.length}</Chip>
                </div>
              }
            />
            <Tab
              key="watchers"
              title={
                <div className="flex items-center gap-1.5">
                  <FiEye className="w-4 h-4" />
                  <span>Pengawas Pimpinan</span>
                  <Chip size="sm" variant="flat" className="text-[10px]">{watchers.length}</Chip>
                </div>
              }
            />
            <Tab
              key="visibility"
              title={
                <div className="flex items-center gap-1.5">
                  <FiLock className="w-4 h-4" />
                  <span>Visibilitas</span>
                </div>
              }
            />
            <Tab
              key="git"
              title={
                <div className="flex items-center gap-1.5">
                  <FiGitBranch className="w-4 h-4" />
                  <span>Integrasi Git</span>
                </div>
              }
            />
          </Tabs>

          {/* === TAB: Tim Anggota === */}
          {activeTab === "members" && (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-[#0B5EA8]" />
                    Tim Anggota
                  </h2>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<FiUserPlus className="w-3.5 h-3.5" />}
                    onPress={memberModal.onOpen}
                    style={{ backgroundColor: "#0B5EA8" }}
                  >
                    Tambah Anggota
                  </Button>
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Belum ada anggota</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => {
                      const roleInfo = MEMBER_ROLES.find((r) => r.value === m.role) ?? MEMBER_ROLES[2];
                      return (
                        <div
                          key={m.id_member}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                              {m.nm_pengguna?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {m.nm_pengguna}
                              </p>
                              <p className="text-xs text-gray-400">{m.id_pengguna}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip size="sm" variant="flat" color={roleInfo.color} className="text-[10px]">
                              {roleInfo.label}
                            </Chip>
                            {m.role !== "owner" && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleRemoveMember(m.id_member)}
                                title="Hapus"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* === TAB: Pengawas Pimpinan === */}
          {activeTab === "watchers" && (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiEye className="w-4 h-4 text-[#0B5EA8]" />
                    Pengawas Pimpinan
                  </h2>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<FiUserPlus className="w-3.5 h-3.5" />}
                    onPress={watcherModal.onOpen}
                    style={{ backgroundColor: "#0B5EA8" }}
                  >
                    Tambah Pengawas
                  </Button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                    <FiInfo className="w-3.5 h-3.5 shrink-0" />
                    Pengawas pimpinan dapat melihat project ini tanpa perlu menjadi anggota tim.
                    Cocok untuk Rektor, Dekan, Kaprodi, dll.
                  </p>
                </div>

                {watchers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FiEye className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Belum ada pengawas pimpinan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {watchers.map((w) => (
                      <div
                        key={w.id_watcher}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                            {w.nm_pengguna?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {w.nm_pengguna}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {w.jabatan && <span>{w.jabatan}</span>}
                              {w.nm_unit && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{w.nm_unit}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" variant="flat" color="warning" className="text-[10px]">
                            {w.tipe_akses === "commenter" ? "Commenter" : "Viewer"}
                          </Chip>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleRemoveWatcher(w.id_watcher)}
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* === TAB: Visibilitas === */}
          {activeTab === "visibility" && (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardBody className="p-5 space-y-5">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiLock className="w-4 h-4 text-[#0B5EA8]" />
                  Visibilitas Project
                </h2>

                <p className="text-sm text-gray-500">
                  Atur siapa saja yang dapat melihat project ini.
                </p>

                <RadioGroup
                  value={visibility}
                  onValueChange={setVisibility}
                  className="gap-4"
                >
                  <Radio value="private" description="Hanya anggota tim yang dapat melihat project ini.">
                    <div className="flex items-center gap-2">
                      <span>🔒</span>
                      <span className="font-medium">Private</span>
                    </div>
                  </Radio>
                  <Radio value="unit" description="Semua pimpinan di unit yang sama dapat melihat project ini.">
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <span className="font-medium">Unit</span>
                    </div>
                  </Radio>
                  <Radio value="public" description="Semua pimpinan (Rektor, Dekan, Kaprodi, dll.) dapat melihat project ini.">
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span className="font-medium">Public</span>
                    </div>
                  </Radio>
                </RadioGroup>

                <Button
                  color="primary"
                  size="sm"
                  isLoading={isSavingVisibility}
                  onPress={handleSaveVisibility}
                  style={{ backgroundColor: "#0B5EA8" }}
                >
                  Simpan Visibilitas
                </Button>
              </CardBody>
            </Card>
          )}

          {/* === TAB: Integrasi Git === */}
          {activeTab === "git" && (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardBody className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiGitBranch className="w-4 h-4 text-[#0B5EA8]" />
                    Integrasi Git
                  </h2>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<FiPlus className="w-3.5 h-3.5" />}
                    onPress={webhookModal.onOpen}
                    style={{ backgroundColor: "#0B5EA8" }}
                  >
                    Tambah Webhook
                  </Button>
                </div>

                {/* Webhook URL */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Webhook URL
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-gray-800 dark:text-gray-200 break-all">
                      {WEBHOOK_URL}
                    </code>
                    <Button isIconOnly size="sm" variant="flat" onPress={handleCopyUrl} title="Salin URL">
                      {copiedUrl ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <FiInfo className="w-3.5 h-3.5" />
                    Cara Konfigurasi di Bitbucket
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Buka repository di Bitbucket → Settings → Webhooks</li>
                    <li>Klik <strong>Add webhook</strong></li>
                    <li>Masukkan URL webhook di atas</li>
                    <li>Pilih trigger: <strong>Repository push</strong></li>
                    <li>Masukkan secret yang sama</li>
                    <li>Klik <strong>Save</strong></li>
                    <li>
                      Format commit:{" "}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">fixes #KODE-1</code>{" "}
                      untuk auto-close task
                    </li>
                  </ol>
                </div>

                {/* Webhook List */}
                <div className="space-y-3">
                  {webhooks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      <FiGitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Belum ada webhook dikonfigurasi</p>
                    </div>
                  ) : (
                    webhooks.map((wh) => (
                      <div
                        key={wh.id_webhook}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <FiGitBranch className="w-3.5 h-3.5 text-[#0B5EA8] flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                              {wh.repo_full_name}
                            </span>
                            <Chip size="sm" variant="flat" color={wh.a_active ? "success" : "default"} className="text-xs">
                              {wh.a_active ? "Aktif" : "Nonaktif"}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="capitalize">{wh.provider}</span>
                            {wh.webhook_secret && <span>Secret: ••••••••</span>}
                            <span>{new Date(wh.created_at).toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Switch
                            size="sm"
                            isSelected={wh.a_active}
                            isDisabled={togglingId === wh.id_webhook}
                            onValueChange={() => handleToggleActive(wh)}
                            color="success"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            isLoading={deletingId === wh.id_webhook}
                            onPress={() => handleDeleteWebhook(wh.id_webhook)}
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* === Add Webhook Modal === */}
        <Modal isOpen={webhookModal.isOpen} onClose={webhookModal.onClose} size="md">
          <ModalContent>
            <ModalHeader className="flex items-center gap-2">
              <FiGitBranch className="w-4 h-4 text-[#0B5EA8]" />
              Tambah Webhook
            </ModalHeader>
            <ModalBody className="space-y-4">
              {formError && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-2">
                  {formError}
                </div>
              )}
              <Input label="Provider" value={formProvider} onValueChange={setFormProvider} placeholder="bitbucket" description="Provider repositori" size="sm" />
              <Input label="Repo Full Name" value={formRepo} onValueChange={setFormRepo} placeholder="workspace/repository-name" isRequired size="sm" />
              <Input
                label="Webhook Secret"
                value={formSecret}
                onValueChange={setFormSecret}
                placeholder="Opsional"
                size="sm"
                endContent={
                  <Button size="sm" variant="flat" isIconOnly onPress={() => setFormSecret(generateSecret())} title="Generate secret">
                    <FiRefreshCw className="w-3.5 h-3.5" />
                  </Button>
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={webhookModal.onClose} size="sm">Batal</Button>
              <Button color="primary" onPress={handleSubmitWebhook} isLoading={isSubmitting} size="sm" style={{ backgroundColor: "#0B5EA8" }}>Simpan</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* === Add Member Modal === */}
        <Modal isOpen={memberModal.isOpen} onClose={memberModal.onClose} size="md">
          <ModalContent>
            <ModalHeader className="flex items-center gap-2">
              <FiUserPlus className="w-4 h-4 text-[#0B5EA8]" />
              Tambah Anggota
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Cari Pengguna"
                value={memberSearch}
                onValueChange={(v) => { setMemberSearch(v); setSelectedMemberUser(null); }}
                placeholder="Ketik nama atau username..."
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                size="sm"
              />

              {/* Search results */}
              {memberSearch.length >= 2 && !selectedMemberUser && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {memberSearching ? (
                    <div className="p-3 text-center text-sm text-gray-400">Mencari...</div>
                  ) : memberSearchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-400">Tidak ditemukan</div>
                  ) : (
                    memberSearchResults.map((u) => (
                      <button
                        key={u.id_pengguna}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                        onClick={() => {
                          setSelectedMemberUser({ id_pengguna: u.id_pengguna, nama: u.nama });
                          setMemberSearch(u.nama);
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{u.nama}</p>
                        <p className="text-xs text-gray-400">{u.username}{u.email ? ` • ${u.email}` : ""}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedMemberUser && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    ✓ {selectedMemberUser.nama}
                  </p>
                </div>
              )}

              <Select
                label="Role"
                selectedKeys={[memberRole]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] as string;
                  if (v) setMemberRole(v);
                }}
                size="sm"
              >
                {MEMBER_ROLES.map((r) => (
                  <SelectItem key={r.value}>{r.label}</SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={memberModal.onClose} size="sm">Batal</Button>
              <Button
                color="primary"
                onPress={handleAddMember}
                isLoading={addingMember}
                isDisabled={!selectedMemberUser}
                size="sm"
                style={{ backgroundColor: "#0B5EA8" }}
              >
                Tambah
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* === Add Watcher Modal === */}
        <Modal isOpen={watcherModal.isOpen} onClose={watcherModal.onClose} size="md">
          <ModalContent>
            <ModalHeader className="flex items-center gap-2">
              <FiEye className="w-4 h-4 text-[#0B5EA8]" />
              Tambah Pengawas Pimpinan
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Cari Pimpinan"
                value={watcherSearch}
                onValueChange={(v) => { setWatcherSearch(v); setSelectedWatcherUser(null); }}
                placeholder="Ketik nama pimpinan..."
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                size="sm"
              />

              {watcherSearch.length >= 2 && !selectedWatcherUser && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {watcherSearching ? (
                    <div className="p-3 text-center text-sm text-gray-400">Mencari...</div>
                  ) : watcherSearchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-400">Tidak ditemukan</div>
                  ) : (
                    watcherSearchResults.map((u) => (
                      <button
                        key={u.id_pengguna}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                        onClick={() => {
                          setSelectedWatcherUser({ id_pengguna: u.id_pengguna, nama: u.nama });
                          setWatcherSearch(u.nama);
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{u.nama}</p>
                        <p className="text-xs text-gray-400">{u.username}{u.email ? ` • ${u.email}` : ""}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedWatcherUser && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    ✓ {selectedWatcherUser.nama}
                  </p>
                </div>
              )}

              <Input
                label="Jabatan"
                value={watcherJabatan}
                onValueChange={setWatcherJabatan}
                placeholder="Contoh: Dekan FMIPA"
                size="sm"
              />
              <Input
                label="Unit"
                value={watcherUnit}
                onValueChange={setWatcherUnit}
                placeholder="Contoh: FMIPA"
                size="sm"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={watcherModal.onClose} size="sm">Batal</Button>
              <Button
                color="primary"
                onPress={handleAddWatcher}
                isLoading={addingWatcher}
                isDisabled={!selectedWatcherUser}
                size="sm"
                style={{ backgroundColor: "#0B5EA8" }}
              >
                Tambah
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
);
}
