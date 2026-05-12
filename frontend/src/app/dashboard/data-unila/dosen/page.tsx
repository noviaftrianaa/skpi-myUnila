"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider, Spinner } from "@heroui/react";
import { FiUsers, FiDownload, FiUser, FiMail, FiPhone, FiCalendar, FiAward, FiBookOpen } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { MdSchool } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import dosenDataService, { type DosenItem, type DosenDetail, type DosenStats } from "@/lib/services/data-unila/dosenDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";

export default function DosenDataPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const [data, setData] = useState<DosenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_sdm");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("asc");
  const [stats, setStats] = useState<DosenStats|null>(null);
  const [filters, setFilters] = useState<MahasiswaFilters|null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  // Auto-force fakultas/prodi dari role scope (Dekan=fakultas, Kaprodi=prodi)
  useEffect(() => {
    if (scope.forcedFakultas) setFilterFak(scope.forcedFakultas);
    if (scope.forcedProdi) setFilterProdi(scope.forcedProdi);
  }, [scope.forcedFakultas, scope.forcedProdi]);

  // Effective filters — selalu override pakai scope kalau ada
  const effFak = scope.forcedFakultas || filterFak;
  const effProdi = scope.forcedProdi || filterProdi;

  // Detail
  const [detailId, setDetailId] = useState<string|null>(null);
  const [detail, setDetail] = useState<DosenDetail|null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    dosenDataService.getStats({
      id_fakultas: effFak || undefined,
      id_prodi: effProdi || undefined,
    } as any).then(setStats).catch(console.error);
  }, [effFak, effProdi]);
  useEffect(() => { mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error); }, []);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getList({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder, id_fakultas: effFak||undefined, id_prodi: effProdi||undefined })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, effFak, effProdi]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);
  const openDetail = async (item: DosenItem) => {
    setDetailId(item.id_sdm); setDetailLoading(true);
    try { setDetail(await dosenDataService.getDetail(item.id_sdm)); } catch { toast.error("Gagal"); setDetailId(null); }
    finally { setDetailLoading(false); }
  };

  const columns: Column<DosenItem>[] = [
    { key: "nidn", label: "NIDN", width: "120px", sortable: true, render: (i) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.nidn||"-"}</span> },
    { key: "nm_sdm", label: "NAMA", sortable: true, render: (i) => (
      <div className="cursor-pointer hover:text-primary-600" onClick={() => openDetail(i)}>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_sdm}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.jenis_sdm} · {i.jk==="L"?"Laki-laki":"Perempuan"}</div>
      </div>
    )},
    { key: "nm_prodi", label: "PRODI", sortable: true, render: (i) => (
      <div><div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi||"-"}</div><div className="text-xs text-gray-500">{i.nm_fakultas||""}</div></div>
    )},
    { key: "jabatan_fungsional", label: "JABFUNG", sortable: true, render: (i) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{i.jabatan_fungsional||"-"}</span>
    )},
    { key: "status", label: "STATUS", width: "90px", align: "center" as const, render: (i) => (
      <Chip size="sm" variant="flat" color={i.status==="Aktif"?"success":i.status==="Pensiun"?"warning":"default"} className="font-semibold">{i.status}</Chip>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Data Dosen">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Dosen & SDM</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Raw data dosen dan tenaga kependidikan Universitas Lampung</p>
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total SDM", val: stats.total, color: "from-blue-500 to-blue-600", icon: <FiUsers className="w-6 h-6" /> },
              { label: "Aktif", val: stats.aktif, color: "from-green-500 to-emerald-600", icon: <FiUser className="w-6 h-6" /> },
              { label: "Ber-NIDN", val: stats.ber_nidn, color: "from-violet-500 to-purple-600", icon: <FiAward className="w-6 h-6" /> },
              { label: "Tendik", val: stats.tendik, color: "from-amber-500 to-orange-500", icon: <FiUsers className="w-6 h-6" /> },
            ].map(s => (
              <Card key={s.label} className={`border-none shadow-lg rounded-xl bg-gradient-to-br ${s.color}`}>
                <CardBody className="p-4 relative"><div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{s.icon}</div>
                    <div><p className="text-xs text-white/80 uppercase">{s.label}</p><h3 className="text-2xl font-bold text-white">{parseInt(s.val||"0").toLocaleString("id-ID")}</h3></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
        <ScopeBadge />
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari NIDN, nama, NIP..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    {scope.scopeName ? (
                      <div className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-indigo-50 text-indigo-700 text-xs border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300">
                        <FiUsers className="w-3.5 h-3.5" />
                        <span><strong>{scope.scopeName}</strong> (auto-scoped)</span>
                      </div>
                    ) : (
                      <>
                        {scope.canChangeFakultas && (
                          <Select aria-label="Fakultas" placeholder="Semua Fakultas" selectedKeys={filterFak?[filterFak]:[]}
                            onSelectionChange={k => { setFilterFak(Array.from(k)[0] as string||""); setFilterProdi(""); setPage(1); }}
                            size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}>
                            {(filters?.fakultas||[]).map(f => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                          </Select>
                        )}
                        {scope.canChangeProdi && (
                          <Select aria-label="Prodi" placeholder="Semua Prodi" selectedKeys={filterProdi?[filterProdi]:[]}
                            onSelectionChange={k => { setFilterProdi(Array.from(k)[0] as string||""); setPage(1); }}
                            size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}>
                            {(filters?.prodi||[]).map(p => <SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>)}
                          </Select>
                        )}
                      </>
                    )}
                    <Button size="sm" variant="flat" color="success" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => window.open(dosenDataService.getExportUrl({ search, id_fakultas: effFak, id_prodi: effProdi }), "_blank")}
                      className="h-10 font-medium ml-auto">Export CSV</Button>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `dosen-${filterFak || 'semua'}-${filterProdi || 'semua'}`,
                        'Dosen',
                        {
                          nidn: 'NIDN', nip: 'NIP', nm_sdm: 'Nama',
                          jk: 'Jenis Kelamin', jenis_sdm: 'Jenis SDM',
                          nm_prodi: 'Program Studi', nm_fakultas: 'Fakultas',
                          jabatan_fungsional: 'Jabatan Fungsional', status: 'Status',
                          email: 'Email', no_hp: 'No HP',
                        }
                      )}
                      className="h-10 font-medium">Export Excel</Button>
                  </div>
                }
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailId} onClose={() => { setDetailId(null); setDetail(null); }} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg"><FiUser className="w-5 h-5" /></div>
              <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">{detailLoading?"Memuat...":detail?.biodata?.nm_sdm||"-"}</h3>
                <p className="text-sm text-gray-500 font-normal">NIDN: {detail?.biodata?.nidn||"-"}</p></div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {detailLoading ? <div className="flex justify-center py-8"><Spinner size="lg" /></div> : detail ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" color={detail.biodata.status==="Aktif"?"success":"default"}>{detail.biodata.status}</Chip>
                  {detail.biodata.nm_prodi && <Chip size="sm" variant="flat" color="primary">{detail.biodata.nm_prodi}</Chip>}
                </div>
                <Divider />
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Biodata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { l: "NIP", v: detail.biodata.nip }, { l: "NIK", v: detail.biodata.nik },
                      { l: "Email", v: detail.biodata.email }, { l: "HP", v: detail.biodata.no_hp },
                      { l: "Tgl Lahir", v: `${detail.biodata.tmpt_lahir}, ${detail.biodata.tgl_lahir}` },
                      { l: "Agama", v: detail.biodata.nm_agama },
                    ].map(({ l, v }) => (
                      <div key={l} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div><p className="text-xs text-gray-500">{l}</p><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{v||"-"}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                {detail.riwayat_fungsional?.length > 0 && (<><Divider />
                  <div><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Jabatan Fungsional</h4>
                    <div className="space-y-2">{detail.riwayat_fungsional.map((r,i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.nm_jabfung}</p>
                        <p className="text-xs text-gray-500">SK: {r.sk_jabfung||"-"} · TMT: {r.tmt_sk_jabfung||"-"} · AK: {r.angka_kredit||"-"}</p>
                      </div>
                    ))}</div></div></>)}
                {detail.riwayat_pendidikan?.length > 0 && (<><Divider />
                  <div><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Riwayat Pendidikan</h4>
                    <div className="space-y-2">{detail.riwayat_pendidikan.map((r,i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.jenjang} — {r.institusi}</p>
                        <p className="text-xs text-gray-500">{r.bidang_studi||""} · {r.gelar||""} · Lulus: {r.thn_lulus||"-"}</p>
                      </div>
                    ))}</div></div></>)}
                {detail.sertifikasi?.length > 0 && (<><Divider />
                  <div><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Sertifikasi</h4>
                    <div className="space-y-2">{detail.sertifikasi.map((r,i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.nm_sert}</p>
                        <p className="text-xs text-gray-500">No: {r.no_sert||"-"} · Tgl: {r.tgl_sert||"-"}</p>
                      </div>
                    ))}</div></div></>)}
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter className="border-t"><Button variant="flat" onPress={() => { setDetailId(null); setDetail(null); }}>Tutup</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
