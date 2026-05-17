"use client";

// Admin: Mail Config — manage SMTP profiles + monitor outbox.
// Dynamic config: live row in blog.mail_config drives notif email delivery.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiActivity, FiAlertCircle, FiCheck, FiCheckCircle, FiClock, FiEdit2,
  FiLoader, FiMail, FiPlus, FiSend, FiServer, FiTrash2, FiX, FiXCircle,
} from "react-icons/fi";
import { useState } from "react";
import {
  useMailConfigList, useCreateMailConfig, useUpdateMailConfig,
  useActivateMailConfig, useDeleteMailConfig, useTestSendMail,
  useOutboxStats, useOutboxList,
} from "@/lib/services/blog-platform";
import type { MailConfig, MailConfigInput } from "@/lib/services/blog-platform";

const STATUS_PILL: Record<string, string> = {
  pending:  "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  sending:  "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  sent:     "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  failed:   "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

const STATUS_ICON: Record<string, typeof FiCheck> = {
  pending: FiClock,
  sending: FiActivity,
  sent: FiCheckCircle,
  failed: FiXCircle,
};

export default function MailConfigPage() {
  const { data: configs = [], isLoading, error } = useMailConfigList();
  const { data: stats } = useOutboxStats();
  const [showForm, setShowForm] = useState<{ mode: "create" } | { mode: "edit"; cfg: MailConfig } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const activateMut = useActivateMailConfig();
  const deleteMut = useDeleteMailConfig();
  const testMut = useTestSendMail();
  const [actingId, setActingId] = useState<string | null>(null);

  const handleActivate = async (id: string) => {
    setActingId(id);
    try { await activateMut.mutateAsync(id); }
    catch (e) { alert(`Gagal aktivasi: ${(e as Error).message}`); }
    finally { setActingId(null); }
  };

  const handleDelete = async (cfg: MailConfig) => {
    if (!confirm(`Hapus profil "${cfg.label}"?`)) return;
    setActingId(cfg.id_mail_config);
    try { await deleteMut.mutateAsync(cfg.id_mail_config); }
    catch (e) { alert(`Gagal hapus: ${(e as Error).message}`); }
    finally { setActingId(null); }
  };

  const handleTest = async () => {
    const r = testRecipient.trim();
    if (!r) return;
    setTestResult(null);
    try {
      const res = await testMut.mutateAsync(r);
      setTestResult({ ok: true, msg: `Terkirim ke ${res.recipient} via ${res.via}` });
    } catch (e) {
      setTestResult({ ok: false, msg: (e as Error).message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Settings</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiMail className="w-6 h-6 text-myunila" /> Mail Config
          {isLoading && <FiLoader className="w-4 h-4 animate-spin text-myunila" />}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kelola profil SMTP untuk pengiriman notifikasi email. Hanya 1 profil aktif pada satu waktu.
          Worker mendrain outbox setiap 60 detik.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Outbox stats — 4 pills */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["pending", "sending", "sent", "failed"] as const).map((k) => {
            const Icon = STATUS_ICON[k];
            return (
              <Card key={k} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STATUS_PILL[k]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{k}</p>
                    <p className="text-xl font-bold tabular-nums">{stats[k]}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Profile list */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">SMTP Profiles</h2>
        <button
          onClick={() => setShowForm({ mode: "create" })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
        >
          <FiPlus className="w-4 h-4" /> Profil Baru
        </button>
      </div>

      {!isLoading && configs.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <FiMail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Belum ada profil SMTP. Email notifikasi tidak akan dikirim sampai admin konfigurasi.
            </p>
          </CardBody>
        </Card>
      )}

      {configs.length > 0 && (
        <ul className="space-y-3">
          {configs.map((cfg) => (
            <Card key={cfg.id_mail_config} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{cfg.label}</h3>
                      {cfg.a_aktif && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-mono text-slate-500">
                      <FiServer className="inline w-3 h-3 mr-1" />
                      {cfg.smtp_host}:{cfg.smtp_port}
                      {cfg.smtp_username && ` · auth: ${cfg.smtp_username}`}
                      {!cfg.smtp_username && " · no auth"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      From: <strong className="text-slate-700 dark:text-slate-300">{cfg.from_name} &lt;{cfg.from_address}&gt;</strong>
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      TLS={cfg.use_tls ? "on" : "off"} · STARTTLS={cfg.use_starttls ? "on" : "off"} · Public URL: {cfg.public_url}
                    </p>
                    {cfg.catatan && (
                      <p className="mt-1 text-xs text-slate-500 italic">&ldquo;{cfg.catatan}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!cfg.a_aktif && (
                      <button
                        onClick={() => handleActivate(cfg.id_mail_config)}
                        disabled={actingId === cfg.id_mail_config}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actingId === cfg.id_mail_config ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                        Aktifkan
                      </button>
                    )}
                    <button
                      onClick={() => setShowForm({ mode: "edit", cfg })}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    {!cfg.a_aktif && (
                      <button
                        onClick={() => handleDelete(cfg)}
                        disabled={actingId === cfg.id_mail_config}
                        className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 disabled:opacity-50"
                        title="Hapus"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </ul>
      )}

      {/* Test-send card */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Test Kirim Email</h2>
          <p className="text-xs text-slate-500 mb-3">
            Pakai profil yang sedang aktif untuk kirim test email. Berguna setelah edit konfigurasi.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="recipient@unila.ac.id"
              className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
            <button
              onClick={handleTest}
              disabled={!testRecipient.trim() || testMut.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50"
            >
              {testMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
              Kirim Test
            </button>
          </div>
          {testResult && (
            <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${
              testResult.ok ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300"
            }`}>
              {testResult.ok ? <FiCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <FiXCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent outbox */}
      <OutboxSection />

      {showForm && (
        <MailConfigFormModal
          mode={showForm.mode}
          existing={showForm.mode === "edit" ? showForm.cfg : null}
          onClose={() => setShowForm(null)}
        />
      )}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

// ============================== Outbox ==============================

function OutboxSection() {
  const [status, setStatus] = useState<string>("");
  const { data: rows = [], isLoading } = useOutboxList(status || undefined, 30);
  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Outbox Terakhir</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs h-7 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">Semua status</option>
            <option value="pending">Pending</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {isLoading && (
          <p className="py-6 text-center text-xs text-slate-400 inline-flex items-center gap-1.5 mx-auto">
            <FiLoader className="w-3.5 h-3.5 animate-spin" /> Memuat outbox…
          </p>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">Outbox kosong.</p>
        )}
        {rows.length > 0 && (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <li key={r.id_email} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${STATUS_PILL[r.status]}`}>
                        {r.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{r.tipe}</span>
                      {r.attempts > 0 && (
                        <span className="text-[10px] text-slate-400">attempt {r.attempts}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{r.subject}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
                      → {r.recipient_email}
                      {" · "}
                      {new Date(r.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {r.sent_at && ` · sent ${new Date(r.sent_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                    {r.last_error && (
                      <p className="mt-1 text-[10px] text-rose-500 italic line-clamp-2">{r.last_error}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

// ============================== Form modal ==============================

function MailConfigFormModal({ mode, existing, onClose }: {
  mode: "create" | "edit";
  existing: MailConfig | null;
  onClose: () => void;
}) {
  const createMut = useCreateMailConfig();
  const updateMut = useUpdateMailConfig();

  const [label, setLabel] = useState(existing?.label ?? "");
  const [host, setHost] = useState(existing?.smtp_host ?? "");
  const [port, setPort] = useState(existing?.smtp_port ?? 587);
  const [username, setUsername] = useState(existing?.smtp_username ?? "");
  const [password, setPassword] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [useTLS, setUseTLS] = useState(existing?.use_tls ?? true);
  const [useSTARTTLS, setUseSTARTTLS] = useState(existing?.use_starttls ?? true);
  const [fromAddress, setFromAddress] = useState(existing?.from_address ?? "");
  const [fromName, setFromName] = useState(existing?.from_name ?? "Blog Unila");
  const [publicURL, setPublicURL] = useState(existing?.public_url ?? "https://blog.unila.ac.id");
  const [catatan, setCatatan] = useState(existing?.catatan ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const input: MailConfigInput = {
      label, smtp_host: host, smtp_port: port,
      smtp_username: username || null,
      // Update semantics: null = leave alone. Only send password if user
      // actually typed in the field this session.
      smtp_password: touchedPassword ? (password || "") : null,
      use_tls: useTLS, use_starttls: useSTARTTLS,
      from_address: fromAddress, from_name: fromName, public_url: publicURL,
      catatan: catatan || null,
    };
    try {
      if (mode === "create") await createMut.mutateAsync(input);
      else await updateMut.mutateAsync({ id: existing!.id_mail_config, input });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const pending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base">{mode === "create" ? "Profil SMTP Baru" : `Edit: ${existing?.label}`}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          <Field label="Label *">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Unila SMTP Relay" autoFocus className={inputCls} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="SMTP Host *">
                <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.unila.ac.id" className={`${inputCls} font-mono`} />
              </Field>
            </div>
            <Field label="Port *">
              <input type="number" value={port} onChange={(e) => setPort(parseInt(e.target.value, 10) || 0)} className={`${inputCls} font-mono`} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username (opsional)">
              <input value={username ?? ""} onChange={(e) => setUsername(e.target.value)} placeholder="auth user" className={`${inputCls} font-mono`} />
            </Field>
            <Field label={`Password ${mode === "edit" ? "(kosong = tidak diubah)" : ""}`}>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setTouchedPassword(true); }}
                placeholder={existing?.has_password ? "•••••• (sudah diset)" : "smtp password"}
                className={`${inputCls} font-mono`}
              />
            </Field>
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useTLS} onChange={(e) => setUseTLS(e.target.checked)} />
              Use TLS
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useSTARTTLS} onChange={(e) => setUseSTARTTLS(e.target.checked)} />
              Use STARTTLS
            </label>
            <span className="text-[10px] text-slate-400">
              Mailpit (1025): keduanya off · Unila relay (587): keduanya on · Implicit TLS (465): TLS on, STARTTLS off
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From Address *">
              <input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="blog-noreply@unila.ac.id" className={`${inputCls} font-mono`} />
            </Field>
            <Field label="From Name">
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Blog Unila" className={inputCls} />
            </Field>
          </div>
          <Field label="Public URL (base untuk link di email)">
            <input value={publicURL} onChange={(e) => setPublicURL(e.target.value)} placeholder="https://blog.unila.ac.id" className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Catatan (opsional)">
            <textarea value={catatan ?? ""} onChange={(e) => setCatatan(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Misal: Relay shared dengan SIAKAD" />
          </Field>
          {err && (
            <p className="text-xs text-rose-600 inline-flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" /> {err}
            </p>
          )}
          {mode === "create" && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-md">
              ℹ️ Profil baru dibuat dengan status non-aktif. Test kirim dulu, baru aktifkan dari list.
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={!label.trim() || !host.trim() || !fromAddress.trim() || pending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50"
          >
            {pending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
            {mode === "create" ? "Buat Profil" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
