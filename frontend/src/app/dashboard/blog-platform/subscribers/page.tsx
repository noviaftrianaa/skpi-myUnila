"use client";

// Phase BB — Owner dashboard untuk subscriber list per blog.
// Read-only saat ini: lihat email, status, count, last_sent_at.
// Unsubscribe oleh subscriber sendiri via link di email footer.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiClock, FiLoader, FiMail, FiUserCheck, FiUserX, FiXCircle,
} from "react-icons/fi";
import { useSubscriberList } from "@/lib/services/blog-platform";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  unsubscribed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function SubscribersPage() {
  const { data, isLoading, error } = useSubscriberList(200, 0);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const confirmed = data?.confirmed_count ?? 0;
  const pending = data?.pending_count ?? 0;
  const unsubscribed = data?.unsubscribed_count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiMail className="w-6 h-6 text-myunila" /> Newsletter Subscribers
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pengunjung non-login yang subscribe untuk dapat email tiap kali kamu publish post.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={total} icon={<FiMail className="w-5 h-5 text-slate-500" />} />
        <StatCard label="Confirmed" value={confirmed} icon={<FiUserCheck className="w-5 h-5 text-emerald-500" />} highlight />
        <StatCard label="Pending" value={pending} icon={<FiClock className="w-5 h-5 text-amber-500" />} />
        <StatCard label="Unsubscribed" value={unsubscribed} icon={<FiUserX className="w-5 h-5 text-slate-400" />} />
      </div>

      {/* List */}
      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiMail className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Belum ada subscriber. Pengunjung blog kamu bisa subscribe via form di tenant page (sidebar atau bawah post).
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Email</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Subscribed</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Last broadcast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((s) => (
                  <tr key={s.id_subscriber} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">
                      <span className="font-mono text-xs">{s.email}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[s.status]}`}>
                        {s.status === "confirmed" && <FiCheck className="w-3 h-3" />}
                        {s.status === "pending" && <FiClock className="w-3 h-3" />}
                        {s.status === "unsubscribed" && <FiXCircle className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {s.last_sent_at
                        ? new Date(s.last_sent_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                        : <span className="italic text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false }: {
  label: string; value: number; icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${
      highlight
        ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
    }`}>
      <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="mt-1.5 text-2xl font-display font-bold tabular-nums">{value}</div>
    </div>
  );
}
