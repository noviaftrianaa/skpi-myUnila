"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
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
} from "react-icons/fi";
import Link from "next/link";
import { projectManagementMenuConfig } from "../../config/menuConfig";
import {
  projectService,
  type Project,
  type WebhookConfig,
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

export default function SettingsPage() {
  useRequireAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add webhook form
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formProvider, setFormProvider] = useState("bitbucket");
  const [formRepo, setFormRepo] = useState("");
  const [formSecret, setFormSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [proj, whs] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getWebhooks(projectId),
      ]);
      setProject(proj);
      setWebhooks(whs ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleToggleActive = async (wh: WebhookConfig) => {
    setTogglingId(wh.id_webhook);
    try {
      await projectService.updateWebhook(projectId, wh.id_webhook, {
        a_active: !wh.a_active,
      });
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Hapus webhook ini?")) return;
    setDeletingId(webhookId);
    try {
      await projectService.deleteWebhook(projectId, webhookId);
      setWebhooks((prev) => prev.filter((w) => w.id_webhook !== webhookId));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!formRepo.trim()) {
      setFormError("Repo full name wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      await projectService.createWebhook(projectId, {
        provider: formProvider,
        repo_full_name: formRepo.trim(),
        webhook_secret: formSecret.trim(),
      });
      onClose();
      setFormRepo("");
      setFormSecret("");
      await loadData();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Gagal membuat webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="Project Management"
        appIcon={<FiFolder className="w-6 h-6 text-white" />}
        appKey="project-management"
        fallbackMenus={projectManagementMenuConfig}
        pageTitle="Pengaturan"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Project Management"
      appIcon={<FiFolder className="w-6 h-6 text-white" />}
      appKey="project-management"
      fallbackMenus={projectManagementMenuConfig}
      pageTitle={project ? `${project.nama} — Pengaturan` : "Pengaturan"}
    >
      <div className="space-y-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/project-management"
            className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
          >
            Project Management
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/dashboard/project-management/${projectId}/board`}
            className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
          >
            {project?.nama ?? "..."}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <FiSettings className="w-3.5 h-3.5" />
            Pengaturan
          </span>
        </div>

        {/* Git Integration Section */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardBody className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FiGitBranch className="w-4 h-4 text-[#0B5EA8]" />
                Integrasi Git
              </h2>
              <Button
                size="sm"
                color="primary"
                startContent={<FiPlus className="w-3.5 h-3.5" />}
                onPress={onOpen}
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
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={handleCopyUrl}
                  title="Salin URL"
                >
                  {copiedUrl ? (
                    <FiCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <FiCopy className="w-4 h-4 text-gray-500" />
                  )}
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
                <li>Masukkan secret yang sama dengan yang ada di konfigurasi di bawah</li>
                <li>Klik <strong>Save</strong></li>
                <li>
                  Di commit message, gunakan format{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    fixes #KODE-1
                  </code>{" "}
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
                  <p className="text-xs mt-1">Klik &quot;Tambah Webhook&quot; untuk memulai</p>
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
                        <Chip
                          size="sm"
                          variant="flat"
                          color={wh.a_active ? "success" : "default"}
                          className="text-xs"
                        >
                          {wh.a_active ? "Aktif" : "Nonaktif"}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="capitalize">{wh.provider}</span>
                        {wh.webhook_secret && (
                          <span>Secret: ••••••••</span>
                        )}
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
                        onPress={() => handleDelete(wh.id_webhook)}
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
      </div>

      {/* Add Webhook Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
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
            <Input
              label="Provider"
              value={formProvider}
              onValueChange={setFormProvider}
              placeholder="bitbucket"
              description="Provider repositori (bitbucket, github, gitlab)"
              size="sm"
            />
            <Input
              label="Repo Full Name"
              value={formRepo}
              onValueChange={setFormRepo}
              placeholder="workspace/repository-name"
              description="Format: workspace/repo-slug di Bitbucket"
              isRequired
              size="sm"
            />
            <div className="space-y-1">
              <Input
                label="Webhook Secret"
                value={formSecret}
                onValueChange={setFormSecret}
                placeholder="Opsional — biarkan kosong jika tidak pakai secret"
                description="Digunakan untuk verifikasi tanda tangan HMAC-SHA256"
                size="sm"
                endContent={
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    onPress={() => setFormSecret(generateSecret())}
                    title="Generate secret"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5" />
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} size="sm">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              size="sm"
              style={{ backgroundColor: "#0B5EA8" }}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
