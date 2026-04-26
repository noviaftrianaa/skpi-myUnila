"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { FiActivity, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiZap } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { simPrestasiMenuConfig } from "../config/menuConfig";
import { syncService, type SyncSubmission, type SyncSubmissionDetail, type ParentTipe } from "@/lib/services/si-prestasi/prestasiService";

const APP_KEY = "si-prestasi";

export default function SyncLogPage() {
  const [items, setItems] = useState<SyncSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);

  const [filterTipe, setFilterTipe] = useState<"" | ParentTipe>("");
  const [successOnly, setSuccessOnly] = useState(false);

  // Detail modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detail, setDetail] = useState<SyncSubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Ping result
  const [pinging, setPinging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await syncService.log({
        page,
        limit,
        parent_tipe: filterTipe || undefined,
        success_only: successOnly || undefined,
      });
      setItems(r.data);
      setTotal(r.pagination.total);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(`Gagal load sync log: ${err.response?.data?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [page, filterTipe, successOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function showDetail(idSubmission: string) {
    setDetailLoading(true);
    onOpen();
    try {
      const d = await syncService.logDetail(idSubmission);
      setDetail(d);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(`Gagal load detail: ${err.response?.data?.message ?? "unknown"}`);
      onClose();
    } finally {
      setDetailLoading(false);
    }
  }

  async function handlePing() {
    setPinging(true);
    try {
      const r = await syncService.ping();
      if (r.ok) {
        toast.success(
          r.dry_run
            ? `Ping OK (mode dry_run aktif)`
            : `Ping OK — kode_pt: ${r.kode_pt ?? "-"}, token: ${r.token_preview ?? "-"}`,
          { duration: 5000 }
        );
      } else {
        toast.error(`Ping gagal: ${r.message}`);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(`Ping error: ${err.response?.data?.message ?? "unknown"}`);
    } finally {
      setPinging(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiActivity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
      pageTitle="Sync Log"
    >
      <Toaster position="top-right" />
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sync Log SIMKATMAWA</h1>
            <p className="text-sm text-gray-500 mt-1">
              Riwayat submission ke SIMKATMAWA. Untuk diagnose error / dispatch ulang record yang gagal.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="bordered"
              startContent={<FiZap className="w-4 h-4" />}
              isLoading={pinging}
              onPress={handlePing}
            >
              Ping SIMKATMAWA
            </Button>
            <Button
              size="sm"
              variant="bordered"
              startContent={<FiRefreshCw className="w-4 h-4" />}
              isLoading={loading}
              onPress={load}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <select
            value={filterTipe}
            onChange={(e) => { setPage(1); setFilterTipe(e.target.value as "" | ParentTipe); }}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm"
          >
            <option value="">Semua tipe</option>
            <option value="PRESTASI">Prestasi Mandiri</option>
            <option value="SERTIFIKASI">Sertifikasi</option>
            <option value="REKOGNISI">Rekognisi</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={successOnly}
              onChange={(e) => { setPage(1); setSuccessOnly(e.target.checked); }}
              className="rounded"
            />
            Hanya yang sukses
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-xs text-slate-600 dark:text-slate-400 uppercase">
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">ID Parent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SIMKATMAWA ID</th>
                <th className="px-4 py-3">Retry</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Belum ada riwayat submission.</td></tr>
              ) : items.map((row) => (
                <tr key={row.id_submission} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {new Date(row.request_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <Chip size="sm" variant="flat" color="primary">{row.parent_tipe}</Chip>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.id_parent.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    {row.a_success ? (
                      <Chip size="sm" variant="flat" color="success" startContent={<FiCheckCircle className="w-3 h-3" />}>
                        {row.http_status} OK
                      </Chip>
                    ) : row.http_status ? (
                      <Chip size="sm" variant="flat" color="danger" startContent={<FiXCircle className="w-3 h-3" />}>
                        {row.http_status} ERROR
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat" color="warning" startContent={<FiClock className="w-3 h-3" />}>
                        QUEUED
                      </Chip>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.simkatmawa_id ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.retry_count}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="flat" onPress={() => showDetail(row.id_submission)}>
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Halaman {page} dari {totalPages} · Total {total} record
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="bordered" isDisabled={page <= 1} onPress={() => setPage(p => p - 1)}>
                Sebelumnya
              </Button>
              <Button size="sm" variant="bordered" isDisabled={page >= totalPages} onPress={() => setPage(p => p + 1)}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Detail Submission</ModalHeader>
          <ModalBody>
            {detailLoading ? (
              <p className="text-slate-500 py-4">Loading...</p>
            ) : detail ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-slate-500">Waktu:</span> {new Date(detail.request_at).toLocaleString("id-ID")}</div>
                  <div><span className="text-slate-500">Tipe:</span> {detail.parent_tipe}</div>
                  <div><span className="text-slate-500">ID Parent:</span> <span className="font-mono text-xs">{detail.id_parent}</span></div>
                  <div><span className="text-slate-500">HTTP Status:</span> {detail.http_status ?? "-"}</div>
                  <div><span className="text-slate-500">SIMKATMAWA ID:</span> {detail.simkatmawa_id ?? "-"}</div>
                  <div><span className="text-slate-500">Retry:</span> {detail.retry_count}</div>
                </div>
                {detail.error_message && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-700 dark:text-red-300 text-xs font-semibold mb-1">Error Message:</p>
                    <p className="text-red-700 dark:text-red-300">{detail.error_message}</p>
                  </div>
                )}
                <details>
                  <summary className="cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">Request Payload</summary>
                  <pre className="mt-2 bg-slate-100 dark:bg-slate-900 rounded p-3 text-xs overflow-auto max-h-80 text-slate-700 dark:text-slate-300">
                    {JSON.stringify(detail.request_payload, null, 2)}
                  </pre>
                </details>
                <details>
                  <summary className="cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">Response Body</summary>
                  <pre className="mt-2 bg-slate-100 dark:bg-slate-900 rounded p-3 text-xs overflow-auto max-h-80 text-slate-700 dark:text-slate-300">
                    {JSON.stringify(detail.response_body, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>Tutup</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
