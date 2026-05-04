"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  FiBookmark, FiRefreshCw, FiInfo, FiPlus, FiEdit2, FiTrash2, FiX, FiSave,
  FiCheckCircle, FiAlertTriangle, FiDownload,
} from "react-icons/fi";
import { simPrestasiMenuConfig } from "../config/menuConfig";
import { refService, type RefSyncReport, type RefTipe } from "@/lib/services/si-prestasi/prestasiService";
import type {
  RefBentuk, RefJenisRekognisi, RefKategori, RefKelompok, RefLevel, RefPeringkat,
} from "@/lib/services/si-prestasi/types";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "si-prestasi";

type TabId = "level" | "kategori" | "peringkat" | "kelompok" | "bentuk" | "jenis_rekognisi";

const TABS: Array<{ id: TabId; label: string; desc: string; pdutSync: boolean }> = [
  { id: "level", label: "Level Prestasi", desc: "Sekolah → Kab/kota → Provinsi → Nasional → Internasional → dll", pdutSync: true },
  { id: "kategori", label: "Kategori", desc: "Sains, Seni, Olahraga, Lain-lain (sumber: pdut.ref.jenis_prestasi)", pdutSync: true },
  { id: "peringkat", label: "Peringkat", desc: "Juara 1/2/3 · Harapan 1/2/3 · Apresiasi · Peserta", pdutSync: false },
  { id: "kelompok", label: "Kelompok", desc: "Individu / Kelompok", pdutSync: false },
  { id: "bentuk", label: "Bentuk", desc: "Daring / Luring", pdutSync: false },
  { id: "jenis_rekognisi", label: "Jenis Rekognisi", desc: "14 kategori rekognisi dosen/prodi (SIMKATMAWA-only)", pdutSync: false },
];

// Configuration field per tipe — used for form modal.
const FIELD_DEFS: Record<TabId, { pkField: string; label: string; nameField: string; nameMax: number; kodeMax: number; extras: Array<{ name: string; label: string; type: "number" | "boolean" }> }> = {
  level: { pkField: "id_level_prestasi", label: "Level Prestasi", nameField: "nm_level", nameMax: 60, kodeMax: 8, extras: [{ name: "id_tkt_prestasi_pdut", label: "id_tkt_prestasi (pdut)", type: "number" }] },
  kategori: { pkField: "id_kategori_prestasi", label: "Kategori Prestasi", nameField: "nm_kategori", nameMax: 100, kodeMax: 16, extras: [{ name: "id_jenis_prestasi_pdut", label: "id_jenis_prestasi (pdut)", type: "number" }] },
  peringkat: { pkField: "id_peringkat", label: "Peringkat", nameField: "nm_peringkat", nameMax: 60, kodeMax: 16, extras: [{ name: "peringkat_pdut", label: "peringkat_pdut", type: "number" }, { name: "nilai_bobot", label: "Nilai Bobot", type: "number" }] },
  kelompok: { pkField: "id_kelompok_prestasi", label: "Kelompok", nameField: "nm_kelompok", nameMax: 40, kodeMax: 16, extras: [] },
  bentuk: { pkField: "id_bentuk_pelaksanaan", label: "Bentuk", nameField: "nm_bentuk", nameMax: 40, kodeMax: 8, extras: [] },
  jenis_rekognisi: { pkField: "id_jenis_rekognisi", label: "Jenis Rekognisi", nameField: "nm_jenis", nameMax: 120, kodeMax: 16, extras: [] },
};

export default function MasterDataPage() {
  const [tab, setTab] = useState<TabId>("level");
  const [loading, setLoading] = useState(true);

  const [level, setLevel] = useState<RefLevel[]>([]);
  const [kategori, setKategori] = useState<RefKategori[]>([]);
  const [peringkat, setPeringkat] = useState<RefPeringkat[]>([]);
  const [kelompok, setKelompok] = useState<RefKelompok[]>([]);
  const [bentuk, setBentuk] = useState<RefBentuk[]>([]);
  const [jenisRekognisi, setJenisRekognisi] = useState<RefJenisRekognisi[]>([]);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncReport, setSyncReport] = useState<RefSyncReport | null>(null);

  // Form modal state
  const [editing, setEditing] = useState<{ tipe: TabId; row: any | null } | null>(null); // null row → create
  const [confirmDel, setConfirmDel] = useState<{ tipe: TabId; id: string; nama: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [l, k, p, kl, b, jr] = await Promise.all([
        refService.levels(), refService.kategori(), refService.peringkat(),
        refService.kelompok(), refService.bentuk(), refService.jenisRekognisi(),
      ]);
      setLevel(l); setKategori(k); setPeringkat(p); setKelompok(kl); setBentuk(b); setJenisRekognisi(jr);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    level: level.length, kategori: kategori.length, peringkat: peringkat.length,
    kelompok: kelompok.length, bentuk: bentuk.length, jenis_rekognisi: jenisRekognisi.length,
  }), [level, kategori, peringkat, kelompok, bentuk, jenisRekognisi]);

  const handleSync = async () => {
    setSyncing(true);
    const t = toast.loading("Mengambil data referensi dari pdut...");
    try {
      const rep = await refService.syncFromPdut();
      toast.dismiss(t);
      setSyncReport(rep);
      toast.success(`✅ Sync: ${rep.summary.total_inserted} baru, ${rep.summary.total_matched} sudah ada`);
      await load();
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(`Sync gagal: ${e?.response?.data?.message || e?.message || "unknown"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await refService.remove(confirmDel.tipe, confirmDel.id);
      toast.success(`Berhasil hapus ${confirmDel.nama}`);
      setConfirmDel(null);
      await load();
    } catch (e: any) {
      toast.error(`Gagal hapus: ${e?.response?.data?.message || e?.message || "unknown"}`);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiBookmark className="h-6 w-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <FiBookmark className="h-7 w-7 text-amber-500" /> Master Data Referensi
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Referensi SIMKATMAWA + sumber pdut PDDIKTI untuk form prestasi mandiri / sertifikasi / rekognisi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={load} disabled={loading || syncing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={handleSync} disabled={syncing || loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700 disabled:opacity-50">
              <FiDownload className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sinkronisasi..." : "Sync dari PDUT"}
            </button>
          </div>
        </div>

        {/* Info notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
          <div className="flex items-start gap-2">
            <FiInfo className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p><strong>Sumber data:</strong> SIMKATMAWA seed (file <code>si_prestasi_v1.0_seed.sql</code>) + sync dari <code>pdut.ref.tingkat_prestasi</code> & <code>pdut.ref.jenis_prestasi</code> (PDDIKTI).</p>
              <p className="mt-1 text-xs opacity-90">
                <strong>Sync dari PDUT</strong> akan tambah row baru kalau pdut punya value yang belum ada di si_prestasi (mapping via <code>id_tkt_prestasi_pdut</code> / <code>id_jenis_prestasi_pdut</code>).
                Existing row tidak diubah agar SIMKATMAWA mapping tetap konsisten. Edit manual lewat tombol per-row jika perlu.
              </p>
            </div>
          </div>
        </div>

        {/* Sync report (last) */}
        {syncReport && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p>
                  <strong>Sync selesai:</strong> {syncReport.summary.total_fetched} record dari pdut → {syncReport.summary.total_inserted} INSERT baru, {syncReport.summary.total_matched} sudah ada.
                  <button onClick={() => setSyncReport(null)} className="ml-2 text-xs underline opacity-80 hover:opacity-100">tutup</button>
                </p>
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-semibold">Lihat detail sync</summary>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3">
                      <p className="font-bold">Level Prestasi</p>
                      <ul className="mt-1 space-y-0.5">
                        {syncReport.level_prestasi.rows.map((r, i) => (
                          <li key={i} className={r.action === "inserted" ? "text-emerald-700" : "text-slate-500"}>
                            {r.action === "inserted" ? "+ " : "✓ "}id={r.id_pdut} · {r.nm_pdut}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="font-bold">Kategori (Jenis Prestasi)</p>
                      <ul className="mt-1 space-y-0.5">
                        {syncReport.kategori_prestasi.rows.map((r, i) => (
                          <li key={i} className={r.action === "inserted" ? "text-emerald-700" : "text-slate-500"}>
                            {r.action === "inserted" ? "+ " : "✓ "}id={r.id_pdut} · {r.nm_pdut}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              {t.label} <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${tab === t.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"}`}>{counts[t.id]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {TABS.find(t => t.id === tab)?.label}
                {TABS.find(t => t.id === tab)?.pdutSync && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">PDUT-Synced</span>
                )}
              </h3>
              <p className="text-xs text-slate-500">{TABS.find(t => t.id === tab)?.desc}</p>
            </div>
            <button
              onClick={() => setEditing({ tipe: tab, row: null })}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <FiPlus className="h-3.5 w-3.5" /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Memuat…</div>
            ) : (
              <RefTable
                tab={tab}
                rows={rowsForTab(tab, { level, kategori, peringkat, kelompok, bentuk, jenisRekognisi })}
                onEdit={(row) => setEditing({ tipe: tab, row })}
                onDelete={(id, nama) => setConfirmDel({ tipe: tab, id, nama })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <RefFormModal
          tipe={editing.tipe}
          row={editing.row}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                <FiTrash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Hapus referensi?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>{confirmDel.nama}</strong> akan dihapus dari ref.{confirmDel.tipe}. Akan gagal jika sudah dipakai di data prestasi/sertifikasi/rekognisi.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setConfirmDel(null)} className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700">
                <FiTrash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}

// Get rows array for current tab.
function rowsForTab(tab: TabId, all: any): any[] {
  switch (tab) {
    case "level": return all.level;
    case "kategori": return all.kategori;
    case "peringkat": return all.peringkat;
    case "kelompok": return all.kelompok;
    case "bentuk": return all.bentuk;
    case "jenis_rekognisi": return all.jenisRekognisi;
  }
}

// ============================================================================
// RefTable — generic row renderer based on tab
// ============================================================================

function RefTable({ tab, rows, onEdit, onDelete }: { tab: TabId; rows: any[]; onEdit: (row: any) => void; onDelete: (id: string, nama: string) => void }) {
  const def = FIELD_DEFS[tab];
  const Active = <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Active</span>;
  const Inactive = <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Inactive</span>;

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 dark:bg-slate-900/50">
        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          <th className="px-4 py-3">Kode SIMKATMAWA</th>
          <th className="px-4 py-3">Nama</th>
          {def.extras.map(ex => <th key={ex.name} className="px-4 py-3 text-right">{ex.label}</th>)}
          <th className="px-4 py-3 text-right">Urutan</th>
          <th className="px-4 py-3 text-right">Status</th>
          <th className="px-4 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {rows.length === 0 ? (
          <tr><td colSpan={5 + def.extras.length} className="px-4 py-8 text-center text-slate-400">Belum ada data — klik "Tambah" untuk input pertama, atau "Sync dari PDUT" untuk import dari pdut.</td></tr>
        ) : rows.map((r) => (
          <tr key={r[def.pkField]} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10">
            <td className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-300">{r.kode_simkatmawa}</td>
            <td className="px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100">{r[def.nameField]}</td>
            {def.extras.map(ex => <td key={ex.name} className="px-4 py-2.5 text-right text-xs text-slate-600 font-mono">{r[ex.name] ?? "-"}</td>)}
            <td className="px-4 py-2.5 text-right text-xs text-slate-500">{r.urutan}</td>
            <td className="px-4 py-2.5 text-right">{r.a_active ? Active : Inactive}</td>
            <td className="px-4 py-2.5 text-right">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Edit">
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(r[def.pkField], r[def.nameField])} className="p-1.5 rounded hover:bg-rose-50 text-rose-600" title="Hapus">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// RefFormModal — Create/Edit form
// ============================================================================

function RefFormModal({ tipe, row, onClose, onSaved }: { tipe: TabId; row: any | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const def = FIELD_DEFS[tipe];
  const isEdit = !!row;

  const [kode, setKode] = useState(row?.kode_simkatmawa || "");
  const [nama, setNama] = useState(row?.[def.nameField] || "");
  const [urutan, setUrutan] = useState<string>(String(row?.urutan ?? 0));
  const [aActive, setAActive] = useState<boolean>(row?.a_active ?? true);
  const [extras, setExtras] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const ex of def.extras) obj[ex.name] = row?.[ex.name] != null ? String(row[ex.name]) : "";
    return obj;
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!kode.trim()) { toast.error("Kode SIMKATMAWA wajib"); return; }
    if (!nama.trim()) { toast.error("Nama wajib"); return; }
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        kode_simkatmawa: kode.trim(),
        urutan: parseInt(urutan || "0", 10),
        a_active: aActive,
      };
      payload[def.nameField] = nama.trim();
      for (const ex of def.extras) {
        const v = extras[ex.name];
        if (v !== "" && v != null) payload[ex.name] = ex.type === "number" ? parseFloat(v) : v;
      }
      if (isEdit) {
        await refService.update(tipe, row[def.pkField], payload);
        toast.success("Berhasil diupdate");
      } else {
        await refService.create(tipe, payload);
        toast.success("Berhasil ditambahkan");
      }
      await onSaved();
    } catch (e: any) {
      toast.error(`Gagal: ${e?.response?.data?.message || e?.message || "unknown"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit" : "Tambah"} {def.label}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Field label="Kode SIMKATMAWA" required hint={`Max ${def.kodeMax} karakter, unique per tipe`}>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              maxLength={def.kodeMax}
              placeholder="Contoh: NAS, RISNOV, JUARA1, INDIVIDU"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 font-mono uppercase"
              disabled={isEdit}
            />
            {isEdit && <p className="text-[10px] text-gray-400 mt-1">Kode tidak dapat diubah saat edit. Hapus dan buat baru jika perlu rename.</p>}
          </Field>

          <Field label={`Nama ${def.label}`} required>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              maxLength={def.nameMax}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </Field>

          {def.extras.map(ex => (
            <Field key={ex.name} label={ex.label}>
              <input
                type="number"
                step={ex.name === "nilai_bobot" ? "0.01" : "1"}
                value={extras[ex.name]}
                onChange={(e) => setExtras({ ...extras, [ex.name]: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </Field>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Urutan">
              <input
                type="number"
                min="0"
                value={urutan}
                onChange={(e) => setUrutan(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </Field>
            <Field label="Status">
              <label className="inline-flex items-center gap-2 mt-2">
                <input type="checkbox" checked={aActive} onChange={(e) => setAActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm">Aktif</span>
              </label>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button onClick={onClose} disabled={submitting} className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50">Batal</button>
          <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
            {submitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </label>
  );
}
