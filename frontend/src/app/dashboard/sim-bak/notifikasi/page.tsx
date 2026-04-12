"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiBell, FiMail, FiMessageSquare, FiSave, FiSend, FiFileText, FiList, FiEye, FiCheck, FiX, FiAlertCircle, FiSettings } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import toast, { Toaster } from "react-hot-toast";
import {
  getNotifSettings, updateNotifSettings, testNotifEmail,
  getNotifTemplates, updateNotifTemplate, previewNotifTemplate,
  getNotifLogs, getNotifLogStats,
} from "@/lib/services/sim-bak/simBakService";

const tabs = [
  { key: "pengaturan", label: "Pengaturan", icon: <FiSettings className="w-4 h-4" /> },
  { key: "template", label: "Template", icon: <FiFileText className="w-4 h-4" /> },
  { key: "log", label: "Log Pengiriman", icon: <FiList className="w-4 h-4" /> },
];

export default function NotifikasiPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pengaturan");
  const [loading, setLoading] = useState(true);

  // === Pengaturan ===
  const [settings, setSettings] = useState<Array<Record<string, unknown>>>([]);
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  // === Template ===
  const [templates, setTemplates] = useState<Array<Record<string, unknown>>>([]);
  const [editingTemplate, setEditingTemplate] = useState<Record<string, unknown> | null>(null);
  const [previewHtml, setPreviewHtml] = useState<{ subject: string; body_email: string; body_whatsapp: string } | null>(null);

  // === Log ===
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logStats, setLogStats] = useState<{ total: number; sent: number; failed: number; pending: number } | null>(null);
  const [logFilter, setLogFilter] = useState({ status: "", channel: "" });

  // === Fetch ===
  const fetchSettings = useCallback(async () => {
    try {
      const data = await getNotifSettings();
      setSettings(data);
      const values: Record<string, string> = {};
      data.forEach(s => { values[String(s.kode)] = String(s.nilai ?? ""); });
      setSettingValues(values);
    } catch { /* empty */ }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try { setTemplates(await getNotifTemplates()); } catch { /* empty */ }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page: logPage, limit: 20 };
      if (logFilter.status) params.status = logFilter.status;
      if (logFilter.channel) params.channel = logFilter.channel;
      const result = await getNotifLogs(params as Parameters<typeof getNotifLogs>[0]);
      setLogs(result.data ?? []);
      setLogTotal(result.pagination?.total ?? 0);
      const stats = await getNotifLogStats();
      setLogStats(stats);
    } catch { /* empty */ }
  }, [logPage, logFilter]);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchSettings(), fetchTemplates()]).finally(() => setLoading(false));
  }, [user, fetchSettings, fetchTemplates]);

  useEffect(() => { if (user && activeTab === "log") fetchLogs(); }, [user, activeTab, fetchLogs]);

  // === Handlers ===
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(settingValues).map(([kode, nilai]) => ({ kode, nilai }));
      await updateNotifSettings(payload);
      toast.success("Pengaturan berhasil disimpan");
      fetchSettings();
    } catch { toast.error("Gagal menyimpan pengaturan"); }
    finally { setSaving(false); }
  };

  const handleTestEmail = async () => {
    if (!testEmail) { toast.error("Masukkan alamat email"); return; }
    setTesting(true);
    try {
      const result = await testNotifEmail(testEmail);
      toast.success(result.message || "Email test berhasil dikirim");
    } catch (e) {
      toast.error((e as Record<string, Record<string, Record<string, string>>>)?.response?.data?.message || "Gagal mengirim test email");
    }
    finally { setTesting(false); }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      await updateNotifTemplate(String(editingTemplate.id_template), {
        nm_template: editingTemplate.nm_template,
        channel: editingTemplate.channel,
        subject_email: editingTemplate.subject_email,
        body_email: editingTemplate.body_email,
        body_whatsapp: editingTemplate.body_whatsapp,
        a_aktif: editingTemplate.a_aktif,
      });
      toast.success("Template berhasil disimpan");
      setEditingTemplate(null);
      fetchTemplates();
    } catch { toast.error("Gagal menyimpan template"); }
    finally { setSaving(false); }
  };

  const handlePreviewTemplate = async (id: string) => {
    try {
      const result = await previewNotifTemplate(id);
      setPreviewHtml(result);
    } catch { toast.error("Gagal memuat preview"); }
  };

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const selectClass = "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const smtpSettings = settings.filter(s => s.grup === "smtp");
  const waSettings = settings.filter(s => s.grup === "whatsapp");
  const umumSettings = settings.filter(s => s.grup === "umum");

  const logColumns: Column<Record<string, unknown>>[] = [
    { key: "channel", label: "Channel", render: (item) => (
      <Chip size="sm" variant="flat" color={item.channel === "email" ? "primary" : "success"}>
        {item.channel === "email" ? <FiMail className="w-3 h-3 mr-1" /> : <FiMessageSquare className="w-3 h-3 mr-1" />}
        {String(item.channel)}
      </Chip>
    )},
    { key: "kode_event", label: "Event", render: (item) => <span className="text-xs font-mono">{String(item.kode_event)}</span> },
    { key: "penerima", label: "Penerima", render: (item) => (
      <div><p className="text-sm">{String(item.nm_penerima ?? "-")}</p><p className="text-xs text-gray-500">{String(item.penerima)}</p></div>
    )},
    { key: "status", label: "Status", render: (item) => (
      <Chip size="sm" variant="flat" color={item.status === "sent" ? "success" : item.status === "failed" ? "danger" : "warning"}>
        {item.status === "sent" ? <FiCheck className="w-3 h-3 mr-1" /> : item.status === "failed" ? <FiX className="w-3 h-3 mr-1" /> : null}
        {String(item.status)}
      </Chip>
    )},
    { key: "created_at", label: "Waktu", render: (item) => <span className="text-xs text-gray-500">{item.created_at ? new Date(String(item.created_at)).toLocaleString("id-ID") : "-"}</span> },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Notifikasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Notifikasi</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Pengaturan */}
        {activeTab === "pengaturan" && (
          <div className="space-y-6">
            {/* Status aktif */}
            <Card className="shadow-md rounded-xl"><CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Status Notifikasi</h2>
                  <p className="text-sm text-gray-500">Aktifkan untuk mulai mengirim notifikasi email dan WhatsApp</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settingValues.notifikasi_aktif === "true"} onChange={e => setSettingValues(v => ({ ...v, notifikasi_aktif: e.target.checked ? "true" : "false" }))}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <Chip size="sm" color={settingValues.notifikasi_aktif === "true" ? "success" : "default"} variant="flat">
                    {settingValues.notifikasi_aktif === "true" ? "Aktif" : "Nonaktif"}
                  </Chip>
                </label>
              </div>
            </CardBody></Card>

            {/* SMTP Config */}
            <Card className="shadow-md rounded-xl"><CardBody className="p-5">
              <div className="flex items-center gap-2 mb-4"><FiMail className="w-5 h-5 text-blue-500" /><h2 className="text-base font-semibold text-gray-900 dark:text-white">Konfigurasi Email (SMTP)</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {smtpSettings.map(s => (
                  <div key={String(s.kode)}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{String(s.deskripsi || s.kode)}</label>
                    <input type={s.a_rahasia ? "password" : "text"} value={settingValues[String(s.kode)] ?? ""}
                      onChange={e => setSettingValues(v => ({ ...v, [String(s.kode)]: e.target.value }))}
                      className={inputClass} placeholder={String(s.kode)} />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  className={`${inputClass} max-w-xs`} placeholder="Email tujuan test..." />
                <Button size="sm" color="primary" variant="flat" isLoading={testing} startContent={<FiSend className="w-3.5 h-3.5" />}
                  onPress={handleTestEmail}>Test Email</Button>
              </div>
            </CardBody></Card>

            {/* WhatsApp Config */}
            <Card className="shadow-md rounded-xl"><CardBody className="p-5">
              <div className="flex items-center gap-2 mb-4"><FiMessageSquare className="w-5 h-5 text-green-500" /><h2 className="text-base font-semibold text-gray-900 dark:text-white">Konfigurasi WhatsApp API</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {waSettings.map(s => (
                  <div key={String(s.kode)}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{String(s.deskripsi || s.kode)}</label>
                    <input type={s.a_rahasia ? "password" : "text"} value={settingValues[String(s.kode)] ?? ""}
                      onChange={e => setSettingValues(v => ({ ...v, [String(s.kode)]: e.target.value }))}
                      className={inputClass} placeholder={String(s.kode)} />
                  </div>
                ))}
              </div>
            </CardBody></Card>

            <div className="flex justify-end">
              <Button color="primary" isLoading={saving} startContent={<FiSave className="w-4 h-4" />} onPress={handleSaveSettings}>
                Simpan Pengaturan
              </Button>
            </div>
          </div>
        )}

        {/* Tab: Template */}
        {activeTab === "template" && (
          <div className="space-y-4">
            {templates.map(t => (
              <Card key={String(t.id_template)} className="shadow-md rounded-xl"><CardBody className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{String(t.nm_template)}</h3>
                    <Chip size="sm" variant="flat" color={t.channel === "semua" ? "secondary" : t.channel === "email" ? "primary" : "success"}>
                      {String(t.channel)}
                    </Chip>
                    <Chip size="sm" variant="flat" color={t.a_aktif ? "success" : "default"}>
                      {t.a_aktif ? "Aktif" : "Nonaktif"}
                    </Chip>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="flat" startContent={<FiEye className="w-3.5 h-3.5" />}
                      onPress={() => handlePreviewTemplate(String(t.id_template))}>Preview</Button>
                    <Button size="sm" variant="flat" color="primary"
                      onPress={() => setEditingTemplate({ ...t })}>Edit</Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{String(t.deskripsi ?? "")}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">Event: {String(t.kode_event)}</p>
              </CardBody></Card>
            ))}

            {templates.length === 0 && (
              <div className="text-center py-12 text-gray-400"><FiAlertCircle className="w-8 h-8 mx-auto mb-2" /><p>Belum ada template</p></div>
            )}
          </div>
        )}

        {/* Tab: Log */}
        {activeTab === "log" && (
          <div className="space-y-4">
            {logStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total", value: logStats.total, gradient: "from-blue-500 to-blue-600" },
                  { label: "Terkirim", value: logStats.sent, gradient: "from-emerald-500 to-green-600" },
                  { label: "Gagal", value: logStats.failed, gradient: "from-rose-500 to-red-600" },
                  { label: "Pending", value: logStats.pending, gradient: "from-amber-500 to-orange-500" },
                ].map(s => (
                  <Card key={s.label} className="border-none shadow-md rounded-xl"><CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}><FiBell className="w-4 h-4" /></div>
                      <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
                    </div>
                  </CardBody></Card>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <select value={logFilter.status} onChange={e => { setLogFilter(f => ({ ...f, status: e.target.value })); setLogPage(1); }} className={selectClass}>
                <option value="">Semua Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select value={logFilter.channel} onChange={e => { setLogFilter(f => ({ ...f, channel: e.target.value })); setLogPage(1); }} className={selectClass}>
                <option value="">Semua Channel</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <DataTable data={logs} columns={logColumns} searchable={false} defaultRowsPerPage={20} />
            <p className="text-xs text-gray-400 text-center">Menampilkan {logs.length} dari {logTotal} log</p>
          </div>
        )}
      </div>

      {/* Modal: Edit Template */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingTemplate(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Template: {String(editingTemplate.nm_template)}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
                  <select value={String(editingTemplate.channel ?? "email")} onChange={e => setEditingTemplate(t => t ? ({ ...t, channel: e.target.value }) : null)}
                    className={inputClass}><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="semua">Semua</option></select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingTemplate.a_aktif as boolean} onChange={e => setEditingTemplate(t => t ? ({ ...t, a_aktif: e.target.checked }) : null)}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm">Template Aktif</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject Email</label>
                <input type="text" value={String(editingTemplate.subject_email ?? "")} onChange={e => setEditingTemplate(t => t ? ({ ...t, subject_email: e.target.value }) : null)}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body Email (HTML)</label>
                <textarea rows={8} value={String(editingTemplate.body_email ?? "")} onChange={e => setEditingTemplate(t => t ? ({ ...t, body_email: e.target.value }) : null)}
                  className={`${inputClass} font-mono text-xs resize-y`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body WhatsApp (Plain Text)</label>
                <textarea rows={5} value={String(editingTemplate.body_whatsapp ?? "")} onChange={e => setEditingTemplate(t => t ? ({ ...t, body_whatsapp: e.target.value }) : null)}
                  className={`${inputClass} font-mono text-xs resize-y`} />
              </div>
              <p className="text-xs text-gray-400">
                Placeholder: {"{{nama}}"}, {"{{npm}}"}, {"{{prodi}}"}, {"{{fakultas}}"}, {"{{layanan}}"}, {"{{nomor}}"}, {"{{catatan}}"}, {"{{semester}}"}, {"{{jenjang}}"}, {"{{angkatan}}"}, {"{{batas_semester}}"}
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="flat" className="flex-1" onPress={() => setEditingTemplate(null)}>Batal</Button>
                <Button color="primary" className="flex-1" isLoading={saving} startContent={<FiSave className="w-4 h-4" />} onPress={handleSaveTemplate}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Preview Template */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewHtml(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Preview Template</h2>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{previewHtml.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Email Body</p>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm" dangerouslySetInnerHTML={{ __html: previewHtml.body_email }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">WhatsApp Body</p>
                <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm whitespace-pre-wrap">{previewHtml.body_whatsapp}</pre>
              </div>
              <Button variant="flat" className="w-full" onPress={() => setPreviewHtml(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
