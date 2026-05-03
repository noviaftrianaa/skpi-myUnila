"use client";

/**
 * Mapping Unit — list pdrd.sms (PDDIKTI prodi master) dengan status akreditasi.
 * Filter: yang aktif (stat_prodi='A') DAN ada relasi fakultas (id_fak_unila NOT NULL).
 *
 * Tujuan: lihat mana prodi yang sudah ter-mapping dengan akreditasi (dari sync
 * BAN-PT atau manual), mana yang belum, dan ada CRUD manual override per prodi.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import akreditasiService, {
  type AkreditasiRow,
  type MappingStats,
  type RefAkreditasiData,
  type RefRow,
  type UnmatchedRow,
} from "@/lib/services/akreditasi/akreditasiService";
import { Card, CardBody } from "@heroui/react";
import {
  FiCheckCircle, FiAlertTriangle, FiCpu, FiEdit2, FiTrash2,
  FiX, FiSave, FiRefreshCw, FiInfo, FiDatabase, FiLink, FiUnlock,
  FiClock, FiAward, FiFilter, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

const fmtDate = (s?: string | null) => {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch { return "-"; }
};

const akrColor = (nm?: string | null): string => {
  if (!nm) return "bg-gray-100 text-gray-600 border-gray-200";
  switch (nm) {
    case "Unggul": return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "Baik Sekali":
    case "A":      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Baik":
    case "B":      return "bg-amber-100 text-amber-700 border-amber-300";
    case "C":      return "bg-orange-100 text-orange-700 border-orange-300";
    case "Tidak Terakreditasi": return "bg-rose-100 text-rose-700 border-rose-300";
    default:       return "bg-gray-100 text-gray-600 border-gray-300";
  }
};

const mappingBadge = (r: AkreditasiRow) => {
  if (!r.id_akred) return { cls: "bg-orange-100 text-orange-700 border-orange-200", label: "Belum Termapping", icon: <FiUnlock className="w-3 h-3" /> };
  if (r.nm_akred === "Belum Terakreditasi" || r.nm_akred === "Tidak Terakreditasi") return { cls: "bg-orange-100 text-orange-700 border-orange-200", label: "Belum Termapping", icon: <FiUnlock className="w-3 h-3" /> };
  if (r.tst_sk && new Date(r.tst_sk) < new Date()) return { cls: "bg-rose-100 text-rose-700 border-rose-200", label: "Kadaluarsa", icon: <FiAlertTriangle className="w-3 h-3" /> };
  return { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Termapping", icon: <FiLink className="w-3 h-3" /> };
};

export default function MappingUnitPage() {
  useRequireAuth();

  const [stats, setStats] = useState<MappingStats | null>(null);
  const [data, setData] = useState<AkreditasiRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "mapped" | "unmapped" | "expired">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" } | null>(null);

  const [editing, setEditing] = useState<AkreditasiRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AkreditasiRow | null>(null);
  const [refData, setRefData] = useState<RefAkreditasiData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Unmatched BAN-PT — admin maps manual ke pdrd.sms.id_sms
  const [unmatched, setUnmatched] = useState<UnmatchedRow[]>([]);
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [mappingTarget, setMappingTarget] = useState<UnmatchedRow | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [s, l, u] = await Promise.all([
        akreditasiService.mappingStats(),
        akreditasiService.listMapping({
          search,
          status: filter,
          page,
          limit,
          sort_by: sort?.key,
          order: sort?.order?.toUpperCase(),
        }),
        akreditasiService.unmatched().catch(() => [] as UnmatchedRow[]),
      ]);
      setStats(s);
      setData(l.data || []);
      setTotal(l.pagination?.total || 0);
      setUnmatched(u || []);
    } catch (e: any) {
      toast.error(`Gagal memuat: ${e?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [search, filter, page, limit, sort]);

  useEffect(() => { load(); }, [load]);

  // Lazy load ref dropdown saat modal dibuka pertama kali
  useEffect(() => {
    if (editing && !refData) {
      akreditasiService.refAkreditasi().then(setRefData).catch(() => null);
    }
  }, [editing, refData]);

  const columns: Column<AkreditasiRow>[] = useMemo(() => [
    {
      key: "nm_prodi", label: "Prodi", sortable: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-gray-800">{r.nm_prodi}</div>
          {r.kode_prodi && (
            <div className="text-[10px] text-gray-500 font-mono mt-0.5">kode: {r.kode_prodi}</div>
          )}
        </div>
      ),
    },
    {
      key: "nm_jenj_didik", label: "Jenjang", width: "90px", sortable: true,
      render: (r) => <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">{r.nm_jenj_didik || "-"}</span>,
    },
    {
      key: "nm_fakultas", label: "Fakultas", sortable: true,
      render: (r) => <span className="text-gray-600 block max-w-[200px] truncate" title={r.nm_fakultas || ""}>{r.nm_fakultas || "-"}</span>,
    },
    {
      key: "nm_akred", label: "Akreditasi", width: "130px", sortable: true,
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${akrColor(r.nm_akred)}`}>
          {r.nm_akred || "Belum"}
        </span>
      ),
    },
    {
      key: "nm_lemb_akred", label: "Lembaga", sortable: true,
      render: (r) => <span className="text-gray-600">{r.nm_lemb_akred || "-"}</span>,
    },
    {
      key: "tst_sk", label: "Berlaku s/d", width: "120px", sortable: true,
      render: (r) => {
        const expired = r.tst_sk && new Date(r.tst_sk) < new Date();
        return (
          <span className={expired ? "text-rose-700 font-semibold" : "text-gray-600"}>
            {fmtDate(r.tst_sk)}
            {expired && <FiAlertTriangle className="inline-block w-3 h-3 ml-1" />}
          </span>
        );
      },
    },
    {
      key: "_status", label: "Status Mapping", width: "150px",
      render: (r) => {
        const b = mappingBadge(r);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${b.cls}`}>
            {b.icon} {b.label}
          </span>
        );
      },
    },
    {
      key: "id_sms", label: "id_sms",
      render: (r) => <span className="font-mono text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{r.id_sms.substring(0, 13)}...</span>,
      width: "150px",
    },
    {
      key: "_actions", label: "Aksi", width: "100px", align: "center",
      render: (r) => (
        <div className="flex items-center gap-1 justify-center">
          <button
            onClick={() => setEditing(r)}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
            title="Edit/Set Akreditasi"
          ><FiEdit2 className="w-3.5 h-3.5" /></button>
          {r.id_akred !== null && (
            <button
              onClick={() => setConfirmDelete(r)}
              className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
              title="Hapus Akreditasi"
            ><FiTrash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ),
    },
  ], []);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<FiCpu className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Mapping Unit"
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/dashboard/integrator" className="hover:text-blue-600">Integrator</Link>
              <span>/</span>
              <Link href="/dashboard/integrator/akreditasi" className="hover:text-blue-600">Data Akreditasi</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Mapping Unit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiLink className="text-violet-500" /> Mapping Unit Akreditasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Daftar prodi PDDIKTI dari <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[11px]">pdrd.sms</code> (aktif + ber-fakultas).
              Status mapping = ada/tidak akreditasi di <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[11px]">pdrd.akreditasi_prodi</code>. Edit manual bila prodi tidak ter-sync otomatis dari BAN-PT.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard tone="indigo" icon={<FiDatabase className="w-5 h-5" />} label="Total Prodi" value={stats?.total ?? "—"} sub="aktif + ber-fakultas" />
          <KpiCard tone="emerald" icon={<FiCheckCircle className="w-5 h-5" />} label="Termapping" value={stats?.mapped ?? "—"} sub="punya akreditasi aktif" />
          <KpiCard tone="orange" icon={<FiUnlock className="w-5 h-5" />} label="Belum Termapping" value={stats?.unmapped ?? "—"} sub="perlu input akreditasi" />
          <KpiCard tone="rose" icon={<FiAlertTriangle className="w-5 h-5" />} label="Kadaluarsa" value={stats?.expired ?? "—"} sub="tst_sk < today" />
        </div>

        {/* Unmatched BAN-PT alert — admin map manual ke pdrd.sms */}
        {unmatched.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-900">
                  {unmatched.length} prodi BAN-PT tidak termapping ke pdrd.sms
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Sync terakhir tidak menemukan padanan di pdrd.sms (nama+jenjang berbeda). Klik untuk lihat
                  dan map manual ke prodi yang sesuai supaya akreditasi bisa di-set.
                </p>
              </div>
              <button
                onClick={() => setShowUnmatched(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex-shrink-0"
              >
                <FiUnlock className="w-3.5 h-3.5" /> Lihat & Map Manual
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar — collapsible style mirip /siakadu/mahasiswa */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter</span>
              {filter !== "all" && (
                <span className="ml-1 px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-full">
                  1
                </span>
              )}
            </div>
            {showFilters ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showFilters && (
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status Mapping</label>
                  <select
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="mapped">Termapping (punya akreditasi aktif)</option>
                    <option value="unmapped">Belum Termapping</option>
                    <option value="expired">Kadaluarsa</option>
                  </select>
                </div>
              </div>
              {filter !== "all" && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => { setFilter("all"); setPage(1); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <FiX className="w-3 h-3" /> Hapus Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DataTable wrapped in Card */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <DataTable
              data={data}
              columns={columns as any}
              serverSide
              loading={loading}
              totalRecords={total}
              currentPage={page}
              defaultRowsPerPage={limit}
              rowsPerPageOptions={[10, 25, 50, 100]}
              searchPlaceholder="Cari nama prodi / kode prodi..."
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onPageChange={setPage}
              onRowsPerPageChange={(r) => { setLimit(r); setPage(1); }}
              onSortChange={(key, order) => setSort({ key, order })}
              emptyMessage={
                <div className="py-10 text-center text-gray-400">
                  <FiInfo className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Tidak ada prodi pada filter ini</p>
                </div>
              }
            />
          </CardBody>
        </Card>
      </div>

      {/* Edit/Create akreditasi modal */}
      {editing && (
        <AkreditasiFormModal
          row={editing}
          refData={refData}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                <FiTrash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Hapus Akreditasi?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Akreditasi prodi <strong>{confirmDelete.nm_prodi}</strong> ({confirmDelete.nm_jenj_didik}) akan dinonaktifkan
                  (a_aktif=0). History tetap tersimpan, status berubah jadi "Belum Termapping".
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setConfirmDelete(null)} className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
              <button
                onClick={async () => {
                  try {
                    await akreditasiService.deleteMapping(confirmDelete.id_sms);
                    toast.success("Akreditasi dinonaktifkan");
                    setConfirmDelete(null);
                    await load();
                  } catch (e: any) {
                    toast.error(`Gagal: ${e?.message || "unknown"}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              ><FiTrash2 className="w-3.5 h-3.5" /> Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Unmatched list modal */}
      {showUnmatched && (
        <UnmatchedModal
          rows={unmatched}
          onClose={() => setShowUnmatched(false)}
          onMapPick={(row) => { setShowUnmatched(false); setMappingTarget(row); }}
        />
      )}

      {/* Map target selector modal */}
      {mappingTarget && (
        <MapTargetModal
          unmatched={mappingTarget}
          refData={refData}
          onClose={() => setMappingTarget(null)}
          onSaved={async () => { setMappingTarget(null); await load(); }}
        />
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}

function KpiCard({ icon, label, value, tone, sub }: {
  icon: React.ReactNode; label: string; value: number | string; tone: "indigo" | "emerald" | "orange" | "rose"; sub?: string;
}) {
  const tones = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    orange: "from-orange-500 to-amber-600",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} text-white p-4 shadow-md hover:shadow-xl transition-all`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative z-10 flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wide opacity-90">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold leading-none">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</div>
        {sub && <p className="text-[11px] mt-1.5 opacity-80">{sub}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// Form Modal — manual akreditasi per prodi
// ============================================================================

function AkreditasiFormModal({
  row, refData, onClose, onSaved,
}: {
  row: AkreditasiRow;
  refData: RefAkreditasiData | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [idLembAkred, setIdLembAkred] = useState(row.id_lemb_akred?.trim() || "00001");
  const [idAkred, setIdAkred] = useState<string>(row.id_akred ? String(row.id_akred) : "");
  const [sk, setSk] = useState(row.sk_akreditasi || "");
  const [tglSk, setTglSk] = useState(row.tanggal_sk ? row.tanggal_sk.substring(0, 10) : "");
  const [tstSk, setTstSk] = useState(row.tst_sk ? row.tst_sk.substring(0, 10) : "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!idAkred) {
      toast.error("Peringkat akreditasi wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      await akreditasiService.upsertMapping({
        id_sms: row.id_sms,
        id_lemb_akred: idLembAkred,
        id_akred: parseInt(idAkred, 10),
        sk: sk.trim(),
        tgl_sk: tglSk || null,
        tst_sk: tstSk || null,
      });
      toast.success("Akreditasi tersimpan");
      await onSaved();
    } catch (e: any) {
      toast.error(`Gagal simpan: ${e?.response?.data?.message || e?.message || "unknown"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-violet-600" /> Edit Akreditasi Prodi
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">{row.nm_prodi} · {row.nm_jenj_didik} · {row.nm_fakultas || "-"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-[11px] text-violet-900">
            <div className="font-mono">id_sms: {row.id_sms}</div>
            <div className="text-violet-700 mt-1">
              {row.kode_prodi && <>kode_prodi: {row.kode_prodi} · </>}
              status saat ini: <strong>{row.nm_akred || "Belum Termapping"}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Lembaga Akreditasi" required>
              <select
                value={idLembAkred}
                onChange={(e) => setIdLembAkred(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500"
              >
                {(refData?.lembaga_akred || []).map((r: RefRow) => (
                  <option key={r.id} value={r.id}>{r.nama}</option>
                ))}
              </select>
            </Field>
            <Field label="Peringkat Akreditasi" required>
              <select
                value={idAkred}
                onChange={(e) => setIdAkred(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">-- pilih --</option>
                {(refData?.nilai_akred || []).map((r: RefRow) => (
                  <option key={r.id} value={r.id}>{r.nama}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Nomor SK">
            <input
              type="text"
              value={sk}
              onChange={(e) => setSk(e.target.value)}
              placeholder="Contoh: 1234/SK/BAN-PT/Akred/S/X/2024"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500 font-mono"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tanggal SK">
              <input
                type="date"
                value={tglSk}
                onChange={(e) => setTglSk(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500"
              />
            </Field>
            <Field label="Berlaku s/d (Expired)">
              <input
                type="date"
                value={tstSk}
                onChange={(e) => setTstSk(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500"
              />
            </Field>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
            <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Update ini akan menonaktifkan akreditasi lama (a_aktif=0) lalu insert row baru dengan asal_data=<code className="bg-white px-1 rounded">MANUAL</code>. History tetap tersimpan untuk audit.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button onClick={onClose} disabled={submitting}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50">
            Batal
          </button>
          <button onClick={submit} disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
            {submitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

// ============================================================================
// UnmatchedModal — list BAN-PT entries yang gagal di-match. Click → MapTargetModal
// ============================================================================
function UnmatchedModal({ rows, onClose, onMapPick }: {
  rows: UnmatchedRow[];
  onClose: () => void;
  onMapPick: (r: UnmatchedRow) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5 text-amber-600" /> BAN-PT Tidak Termapping ({rows.length})
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Pilih prodi BAN-PT lalu map manual ke pdrd.sms.id_sms supaya akreditasi bisa di-set.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-bold text-gray-700 uppercase text-[10px]">Prodi BAN-PT</th>
                <th className="text-left px-3 py-2 font-bold text-gray-700 uppercase text-[10px]">Jenjang</th>
                <th className="text-left px-3 py-2 font-bold text-gray-700 uppercase text-[10px]">Akreditasi</th>
                <th className="text-left px-3 py-2 font-bold text-gray-700 uppercase text-[10px]">Berlaku s/d</th>
                <th className="text-center px-3 py-2 font-bold text-gray-700 uppercase text-[10px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-12 text-center text-gray-400 text-sm">Tidak ada record unmatched</td></tr>
              ) : rows.map(r => (
                <tr key={r.nm_prodi_banpt + r.jenjang_banpt} className="border-t border-gray-50 hover:bg-amber-50/40">
                  <td className="px-3 py-2 font-semibold text-gray-800">{r.nm_prodi_banpt}</td>
                  <td className="px-3 py-2"><span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">{r.jenjang_banpt}</span></td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">{r.new_nm_akred}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{r.new_tst_sk || "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onMapPick(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-violet-600 text-white hover:bg-violet-700"
                    >
                      <FiLink className="w-3 h-3" /> Map ke pdrd
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-end">
          <button onClick={onClose} className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MapTargetModal — pick pdrd.sms target, then upsert akreditasi langsung
// ============================================================================
function MapTargetModal({ unmatched, refData, onClose, onSaved }: {
  unmatched: UnmatchedRow;
  refData: RefAkreditasiData | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<AkreditasiRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AkreditasiRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-seed search dari nm_prodi BAN-PT
  useEffect(() => {
    setSearch(unmatched.nm_prodi_banpt);
  }, [unmatched]);

  // Lookup pdrd.sms by name
  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) { setCandidates([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await akreditasiService.list({ search: q, page: 1, limit: 15 });
        setCandidates(r.data || []);
      } catch {
        setCandidates([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const submit = async () => {
    if (!selected) {
      toast.error("Pilih prodi pdrd.sms target dulu");
      return;
    }
    if (!unmatched.new_id_akred) {
      toast.error("Akreditasi BAN-PT tidak valid");
      return;
    }
    setSubmitting(true);
    try {
      const r = await akreditasiService.upsertMapping({
        id_sms: selected.id_sms,
        id_lemb_akred: "00001",
        id_akred: unmatched.new_id_akred,
        sk: unmatched.new_sk || "-",
        tgl_sk: null,
        tst_sk: unmatched.new_tst_sk || null,
        // Save alias supaya sync berikutnya BAN-PT name → id_sms ini langsung match
        banpt_name: unmatched.nm_prodi_banpt,
        banpt_jenjang: unmatched.jenjang_banpt,
      });
      const action = r?.action || "saved";
      if (action === "unchanged") {
        toast(`ℹ Akreditasi ${selected.nm_prodi} sudah sama dengan BAN-PT — alias mapping tersimpan, sync berikutnya akan match otomatis.`, { icon: "🔗", duration: 6000 });
      } else if (action === "insert") {
        toast.success(`✅ ${selected.nm_prodi} ditambahkan akreditasi ${unmatched.new_nm_akred} (alias mapping tersimpan).`);
      } else {
        toast.success(`✅ ${selected.nm_prodi} di-update ke ${unmatched.new_nm_akred} (alias mapping tersimpan).`);
      }
      await onSaved();
    } catch (e: any) {
      toast.error(`Gagal: ${e?.response?.data?.message || e?.message || "unknown"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiLink className="w-5 h-5 text-violet-600" /> Map BAN-PT → pdrd.sms
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              <strong>{unmatched.nm_prodi_banpt}</strong> ({unmatched.jenjang_banpt}) → {unmatched.new_nm_akred}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-[11px] text-violet-900">
            <strong>BAN-PT data yang akan ditulis:</strong>
            <div className="mt-1 space-y-0.5">
              <div>Akreditasi: <strong>{unmatched.new_nm_akred}</strong></div>
              <div>SK: <code className="bg-white px-1 rounded">{unmatched.new_sk}</code></div>
              <div>Berlaku s/d: {unmatched.new_tst_sk || "-"}</div>
            </div>
          </div>

          <Field label="Cari Prodi pdrd.sms target" required>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
              placeholder="Ketik minimal 3 huruf nama prodi..."
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </Field>

          {searching && <div className="text-xs text-gray-400 flex items-center gap-2"><FiRefreshCw className="w-3 h-3 animate-spin" /> mencari...</div>}

          {!searching && candidates.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto">
              {candidates.map(c => {
                const sel = selected?.id_sms === c.id_sms;
                return (
                  <button
                    key={c.id_sms}
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs border-b last:border-b-0 transition-colors ${
                      sel ? "bg-violet-50 border-violet-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${sel ? "bg-violet-600 border-violet-700" : "border-gray-300"}`}>
                      {sel && <FiCheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{c.nm_prodi}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {c.nm_jenj_didik && <span className="px-1 py-0.5 rounded bg-blue-50 text-blue-700 mr-1">{c.nm_jenj_didik}</span>}
                        {c.nm_fakultas && <span>{c.nm_fakultas}</span>}
                        {c.kode_prodi && <span className="ml-1 font-mono">· {c.kode_prodi}</span>}
                      </div>
                      {c.nm_akred && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          akreditasi saat ini: <span className="font-semibold">{c.nm_akred}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!searching && candidates.length === 0 && search.length >= 3 && (
            <div className="text-xs text-gray-400 italic">Tidak ada prodi cocok dengan "{search}"</div>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between gap-2">
          <p className="text-[10px] text-gray-500">
            {selected ? <>Akan tulis akreditasi BAN-PT ke <strong>{selected.nm_prodi}</strong></> : "Pilih prodi target dulu"}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={submitting} className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50">Batal</button>
            <button onClick={submit} disabled={submitting || !selected}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
              {submitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiLink className="w-3.5 h-3.5" />}
              Map & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
