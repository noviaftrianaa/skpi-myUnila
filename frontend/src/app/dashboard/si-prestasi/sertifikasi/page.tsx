"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiPlus, FiRefreshCw, FiSearch, FiAward, FiEdit2, FiTrash2, FiEye, FiSend, FiX, FiUpload } from "react-icons/fi";
import { simPrestasiMenuConfig } from "../config/menuConfig";
import { sertifikasiService, refService, fileService } from "@/lib/services/si-prestasi/prestasiService";
import type {
  Sertifikasi, PesertaMhs, PesertaDosen, WorkflowStatus, RefLevel, MahasiswaLookup,
} from "@/lib/services/si-prestasi/types";
import { WorkflowBadge } from "../components/WorkflowBadge";
import { Drawer } from "../components/Drawer";
import { MahasiswaAutocomplete } from "../components/MahasiswaAutocomplete";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "si-prestasi";

const emptyForm = () => ({
  thn_prestasi: new Date().getFullYear(),
  id_level_prestasi: "",
  nm_sertifikasi: "",
  nm_penyelenggara: "",
  url_peserta: "",
  url_sertifikat: "",
  tgl_sertifikat: "",
  url_foto_upp: "",
  url_dokumen_undangan: "",
  keterangan: "",
  peserta_mhs: [] as PesertaMhs[],
  peserta_dosen: [] as PesertaDosen[],
});
type FormState = ReturnType<typeof emptyForm>;

const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

export default function SertifikasiPage() {
  const [items, setItems] = useState<Sertifikasi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  const [tahun, setTahun] = useState("");
  const [status, setStatus] = useState<WorkflowStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [levels, setLevels] = useState<RefLevel[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Sertifikasi | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await sertifikasiService.list({
        tahun: tahun || undefined,
        status_workflow: status || undefined,
        search: search || undefined,
        page, limit,
      });
      setItems(r.data);
      setTotal(r.pagination.total);
    } catch { toast.error("Gagal memuat data sertifikasi"); }
    finally { setLoading(false); }
  }, [tahun, status, search, page, limit]);

  useEffect(() => { refService.levels().then(setLevels); }, []);
  useEffect(() => { fetchList(); }, [fetchList]);

  const lastPage = Math.max(1, Math.ceil(total / limit));

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setDrawerOpen(true); };

  const openEdit = async (id: string) => {
    setEditingId(id); setDrawerOpen(true);
    try {
      const d = await sertifikasiService.detail(id);
      setForm({
        thn_prestasi: d.thn_prestasi,
        id_level_prestasi: d.id_level_prestasi,
        nm_sertifikasi: d.nm_sertifikasi,
        nm_penyelenggara: d.nm_penyelenggara,
        url_peserta: d.url_peserta ?? "",
        url_sertifikat: d.url_sertifikat ?? "",
        tgl_sertifikat: d.tgl_sertifikat,
        url_foto_upp: d.url_foto_upp ?? "",
        url_dokumen_undangan: d.url_dokumen_undangan ?? "",
        keterangan: d.keterangan ?? "",
        peserta_mhs: d.peserta_mhs ?? [],
        peserta_dosen: d.peserta_dosen ?? [],
      });
    } catch { toast.error("Gagal memuat detail"); }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true); setDetail(null);
    try { setDetail(await sertifikasiService.detail(id)); }
    catch { toast.error("Gagal memuat detail"); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        url_peserta: form.url_peserta || null,
        url_sertifikat: form.url_sertifikat || null,
        url_foto_upp: form.url_foto_upp || null,
        url_dokumen_undangan: form.url_dokumen_undangan || null,
        keterangan: form.keterangan || null,
      };
      if (editingId) { await sertifikasiService.update(editingId, payload); toast.success("Sertifikasi diupdate"); }
      else { await sertifikasiService.create(payload); toast.success("Sertifikasi dibuat"); }
      setDrawerOpen(false); fetchList();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sertifikasi ini?")) return;
    try { await sertifikasiService.softDelete(id); toast.success("Dihapus"); fetchList(); }
    catch { toast.error("Gagal menghapus"); }
  };

  const handleTransition = async (id: string, next: WorkflowStatus) => {
    try { await sertifikasiService.transition(id, next); toast.success(`Status: ${next}`); fetchList(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Transisi gagal"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiAward className="h-6 w-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <FiAward className="h-7 w-7 text-blue-500" /> Sertifikasi
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Sertifikasi kompetensi / keahlian mahasiswa (bukan pelatihan dosen). Dilaporkan ke SIMKATMAWA.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchList} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600">
              <FiPlus className="h-4 w-4" /> Tambah Sertifikasi
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tahun</label>
              <select value={tahun} onChange={(e) => { setTahun(e.target.value); setPage(1); }} className={inputCls}>
                <option value="">Semua tahun</option>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value as WorkflowStatus | ""); setPage(1); }} className={inputCls}>
                <option value="">Semua status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="ready">Ready</option>
                <option value="sending">Sending</option>
                <option value="sent">Terkirim</option>
                <option value="error">Error</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Cari</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }} placeholder="Nama sertifikasi / penyelenggara... (Enter)" className={`${inputCls} pl-10`} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  <th className="px-4 py-3">Sertifikasi</th>
                  <th className="px-4 py-3">Tahun</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Memuat…</td></tr>}
                {!loading && items.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Belum ada data</td></tr>}
                {!loading && items.map(it => (
                  <tr key={it.id_sertifikasi} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{it.nm_sertifikasi}</div>
                      <div className="text-xs text-slate-500 truncate max-w-sm">{it.nm_penyelenggara}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{it.thn_prestasi}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{it.level_nama ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{it.jumlah_peserta_mhs ?? 0} mhs · {it.jumlah_peserta_dosen ?? 0} dosen</td>
                    <td className="px-4 py-3"><WorkflowBadge status={it.status_workflow} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Detail" onClick={() => openDetail(it.id_sertifikasi)}><FiEye /></IconBtn>
                        {!["sending","sent","archived"].includes(it.status_workflow) && (
                          <IconBtn title="Edit" onClick={() => openEdit(it.id_sertifikasi)}><FiEdit2 /></IconBtn>
                        )}
                        {it.status_workflow === "draft" && <IconBtn title="Submit" onClick={() => handleTransition(it.id_sertifikasi, "review")} variant="blue"><FiSend /></IconBtn>}
                        {it.status_workflow === "review" && <IconBtn title="Approve" onClick={() => handleTransition(it.id_sertifikasi, "ready")} variant="emerald"><FiSend /></IconBtn>}
                        {it.status_workflow !== "sent" && <IconBtn title="Hapus" onClick={() => handleDelete(it.id_sertifikasi)} variant="rose"><FiTrash2 /></IconBtn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
            <div>Total {total.toLocaleString("id-ID")} · Halaman {page} / {lastPage}</div>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700">« Prev</button>
              <button disabled={page >= lastPage} onClick={() => setPage(p => Math.min(lastPage, p + 1))} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700">Next »</button>
            </div>
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? "Edit Sertifikasi" : "Tambah Sertifikasi"} subtitle="Field bertanda * wajib."
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDrawerOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">Batal</button>
            <button onClick={handleSubmit} disabled={submitting} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">{submitting ? "Menyimpan…" : editingId ? "Update" : "Simpan"}</button>
          </div>
        }
      >
        <SertifikasiForm form={form} setForm={setForm} levels={levels} editingId={editingId} />
      </Drawer>

      <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Detail Sertifikasi" width="max-w-2xl">
        {!detail ? <p className="text-sm text-slate-400">Memuat…</p> : (
          <div className="space-y-3 text-sm">
            <KV label="Sertifikasi" value={detail.nm_sertifikasi} />
            <KV label="Penyelenggara" value={detail.nm_penyelenggara} />
            <KV label="Tahun" value={String(detail.thn_prestasi)} />
            <KV label="Level" value={detail.level_nama ?? "-"} />
            <KV label="Tgl Sertifikat" value={detail.tgl_sertifikat} />
            <KV label="Status" value={<WorkflowBadge status={detail.status_workflow} />} />
            <PesertaList mhs={detail.peserta_mhs ?? []} dosen={detail.peserta_dosen ?? []} />
            {detail.url_sertifikat && <KV label="Sertifikat" value={<a className="text-blue-600 hover:underline" href={detail.url_sertifikat} target="_blank" rel="noreferrer">Buka</a>} />}
          </div>
        )}
      </Drawer>
    </DashboardLayoutWithDynamicMenu>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="col-span-2 text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

function IconBtn({ children, title, onClick, variant = "slate" }: { children: React.ReactNode; title: string; onClick: () => void; variant?: "slate" | "blue" | "emerald" | "rose" }) {
  const tone = {
    slate: "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200",
    blue: "text-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30",
    emerald: "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30",
    rose: "text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/30",
  }[variant];
  return <button title={title} onClick={onClick} className={`rounded-lg p-1.5 transition-colors ${tone}`}>{children}</button>;
}

function PesertaList({ mhs, dosen }: { mhs: PesertaMhs[]; dosen: PesertaDosen[] }) {
  return (
    <>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Peserta Mahasiswa ({mhs.length})</p>
        <ul className="space-y-1">
          {mhs.map(m => <li key={m.id_peserta_mhs ?? m.nim} className="rounded bg-slate-50 px-3 py-1.5 text-xs dark:bg-slate-900/40"><span className="font-mono">{m.nim}</span> · {m.nm_mahasiswa} <span className="text-slate-400">({m.nm_prodi ?? "-"})</span></li>)}
          {mhs.length === 0 && <li className="text-xs text-slate-400">Tidak ada peserta</li>}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Peserta Dosen ({dosen.length})</p>
        <ul className="space-y-1">
          {dosen.map(d => <li key={d.id_peserta_dosen ?? d.nm_dosen} className="rounded bg-slate-50 px-3 py-1.5 text-xs dark:bg-slate-900/40">{d.nm_dosen} <span className="text-slate-400">({d.nuptk ?? d.nidn ?? "-"})</span></li>)}
          {dosen.length === 0 && <li className="text-xs text-slate-400">Tidak ada</li>}
        </ul>
      </div>
    </>
  );
}

function SertifikasiForm({ form, setForm, levels, editingId }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; levels: RefLevel[]; editingId: string | null }) {
  const addMhs = (m: MahasiswaLookup) => {
    if (form.peserta_mhs.some(p => p.nim === m.nim)) { toast.error("Sudah ditambahkan"); return; }
    setForm(f => ({ ...f, peserta_mhs: [...f.peserta_mhs, { nim: m.nim, nm_mahasiswa: m.nama, nm_prodi: m.prodi, id_reg_pd_pdut: m.id_reg_pd ?? null, id_sms_pdut: m.id_sms ?? null }] }));
  };
  const removeMhs = (nim: string) => setForm(f => ({ ...f, peserta_mhs: f.peserta_mhs.filter(p => p.nim !== nim) }));
  const addDosen = () => setForm(f => ({ ...f, peserta_dosen: [...f.peserta_dosen, { nm_dosen: "", nuptk: "", nidn: "", url_surat_tugas: "" }] }));
  const updateDosen = (i: number, patch: Partial<PesertaDosen>) => setForm(f => ({ ...f, peserta_dosen: f.peserta_dosen.map((d, idx) => idx === i ? { ...d, ...patch } : d) }));
  const removeDosen = (i: number) => setForm(f => ({ ...f, peserta_dosen: f.peserta_dosen.filter((_, idx) => idx !== i) }));

  const handleUpload = async (field: "url_peserta" | "url_sertifikat" | "url_foto_upp" | "url_dokumen_undangan", file: File) => {
    const jenis = ({ url_peserta: "peserta", url_sertifikat: "sertifikat", url_foto_upp: "foto_upp", url_dokumen_undangan: "undangan" } as const)[field];
    const tid = toast.loading("Mengupload…");
    try { const r = await fileService.upload(file, "sertifikasi", jenis, editingId ?? undefined); setForm(f => ({ ...f, [field]: r.url })); toast.success("Upload berhasil", { id: tid }); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Upload gagal", { id: tid }); }
  };

  return (
    <div className="space-y-5">
      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Info Sertifikasi</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Sertifikasi *</span><input type="text" value={form.nm_sertifikasi} onChange={e => setForm(f => ({ ...f, nm_sertifikasi: e.target.value }))} className={inputCls} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Penyelenggara *</span><input type="text" value={form.nm_penyelenggara} onChange={e => setForm(f => ({ ...f, nm_penyelenggara: e.target.value }))} className={inputCls} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tahun *</span><input type="number" min={2000} max={2100} value={form.thn_prestasi} onChange={e => setForm(f => ({ ...f, thn_prestasi: Number(e.target.value) }))} className={inputCls} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tgl Sertifikat *</span><input type="date" value={form.tgl_sertifikat} onChange={e => setForm(f => ({ ...f, tgl_sertifikat: e.target.value }))} className={inputCls} /></label>
          <label className="block md:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Level *</span>
            <select value={form.id_level_prestasi} onChange={e => setForm(f => ({ ...f, id_level_prestasi: e.target.value }))} className={inputCls}>
              <option value="">— Pilih —</option>
              {levels.map(l => <option key={l.id_level_prestasi} value={l.id_level_prestasi}>{l.nm_level} ({l.kode_simkatmawa})</option>)}
            </select>
          </label>
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Peserta Mahasiswa</h4>
        <MahasiswaAutocomplete onSelect={addMhs} />
        <ul className="mt-3 space-y-2">
          {form.peserta_mhs.map(m => (
            <li key={m.nim} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div><span className="font-mono text-xs">{m.nim}</span> · <span className="font-medium">{m.nm_mahasiswa}</span> <span className="ml-1 text-xs text-slate-500">({m.nm_prodi})</span></div>
              <button onClick={() => removeMhs(m.nim)} className="rounded-full p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"><FiX className="h-4 w-4" /></button>
            </li>
          ))}
          {form.peserta_mhs.length === 0 && <li className="text-xs italic text-slate-400">Belum ada mahasiswa</li>}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Dosen Pendamping</h4>
          <button onClick={addDosen} className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">+ Tambah</button>
        </div>
        <div className="space-y-3">
          {form.peserta_dosen.map((d, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <input placeholder="Nama dosen *" value={d.nm_dosen} onChange={e => updateDosen(i, { nm_dosen: e.target.value })} className={inputCls} />
                <input placeholder="NUPTK" value={d.nuptk ?? ""} onChange={e => updateDosen(i, { nuptk: e.target.value })} className={inputCls} />
                <input placeholder="NIDN" value={d.nidn ?? ""} onChange={e => updateDosen(i, { nidn: e.target.value })} className={inputCls} />
                <input placeholder="URL Surat Tugas *" value={d.url_surat_tugas} onChange={e => updateDosen(i, { url_surat_tugas: e.target.value })} className={inputCls} />
              </div>
              <button onClick={() => removeDosen(i)} className="mt-2 text-xs text-rose-500 hover:underline">Hapus</button>
            </div>
          ))}
          {form.peserta_dosen.length === 0 && <p className="text-xs italic text-slate-400">Belum ada dosen</p>}
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">File Bukti</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FileField label="Sertifikat" value={form.url_sertifikat} onChange={v => setForm(f => ({ ...f, url_sertifikat: v }))} onUpload={f => handleUpload("url_sertifikat", f)} />
          <FileField label="Foto UPP" value={form.url_foto_upp} onChange={v => setForm(f => ({ ...f, url_foto_upp: v }))} onUpload={f => handleUpload("url_foto_upp", f)} />
          <FileField label="Dokumen Undangan" value={form.url_dokumen_undangan} onChange={v => setForm(f => ({ ...f, url_dokumen_undangan: v }))} onUpload={f => handleUpload("url_dokumen_undangan", f)} />
          <FileField label="Daftar Peserta" value={form.url_peserta} onChange={v => setForm(f => ({ ...f, url_peserta: v }))} onUpload={f => handleUpload("url_peserta", f)} />
        </div>
      </section>

      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Keterangan</span><textarea rows={3} value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} className={inputCls} /></label>
    </div>
  );
}

function FileField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (v: string) => void; onUpload: (f: File) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex gap-2">
        <input type="url" value={value} onChange={e => onChange(e.target.value)} placeholder="URL publik..." className={`${inputCls} flex-1`} />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          <FiUpload className="h-3.5 w-3.5" /> Upload
          <input type="file" className="hidden" accept="application/pdf,image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
        </label>
      </div>
    </label>
  );
}
