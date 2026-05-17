"use client";

// Co-author Invite Inbox — incoming invites where the current user is listed
// as a co-author. Pending invites get accept/decline buttons; accepted +
// declined entries are kept for history.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiClock, FiLoader, FiMail, FiUser, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useCoAuthorInvites, useRespondCoAuthorInvite,
  CO_AUTHOR_PERAN_LABEL, CO_AUTHOR_STATUS_LABEL,
} from "@/lib/services/blog-platform";
import type { CoAuthorInvite, CoAuthorStatus } from "@/lib/services/blog-platform";

const STATUS_TABS: { value: CoAuthorStatus | undefined; label: string }[] = [
  { value: "pending",  label: "Menunggu Jawaban" },
  { value: "accepted", label: "Diterima" },
  { value: "declined", label: "Ditolak" },
  { value: undefined,  label: "Semua" },
];

const STATUS_PILL: Record<CoAuthorStatus, string> = {
  pending:  "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  accepted: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  declined: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function CoAuthorInvitesPage() {
  const [tab, setTab] = useState<CoAuthorStatus | undefined>("pending");
  const { data: invites = [], isLoading, error } = useCoAuthorInvites(tab, 50);
  const respondMut = useRespondCoAuthorInvite();
  const [actingId, setActingId] = useState<string | null>(null);
  const [showDeclineFor, setShowDeclineFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const handleAccept = async (inv: CoAuthorInvite) => {
    setActingId(inv.id_post);
    try {
      await respondMut.mutateAsync({ idPost: inv.id_post, input: { action: "accept" } });
    } catch (e) {
      alert(`Gagal accept: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleDeclineSubmit = async (idPost: string) => {
    setActingId(idPost);
    try {
      await respondMut.mutateAsync({
        idPost,
        input: { action: "decline", alasan: declineReason.trim() || undefined },
      });
      setShowDeclineFor(null);
      setDeclineReason("");
    } catch (e) {
      alert(`Gagal decline: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Kolaborasi</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiMail className="w-6 h-6 text-myunila" /> Co-author Invites
          {isLoading && <FiLoader className="w-4 h-4 animate-spin text-myunila" />}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Undangan dari penulis lain untuk credit kamu sebagai co-author / editor / reviewer / kontributor pada post mereka.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.value
                ? "border-myunila text-myunila"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 tabular-nums px-3 py-2.5">{invites.length} entries</span>
      </div>

      {!isLoading && invites.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <FiMail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {tab === "pending" ? "Tidak ada undangan menunggu jawaban." : "Belum ada undangan di tab ini."}
            </p>
          </CardBody>
        </Card>
      )}

      {invites.length > 0 && (
        <ul className="space-y-3">
          {invites.map((inv) => {
            const acting = actingId === inv.id_post;
            const showDecline = showDeclineFor === inv.id_post;
            return (
              <Card key={inv.id_post} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    {inv.owner_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inv.owner_avatar} alt={inv.owner_nm_tampilan ?? inv.nm_blog} className="w-10 h-10 rounded-full" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_PILL[inv.status]}`}>
                          {CO_AUTHOR_STATUS_LABEL[inv.status]}
                        </span>
                        <span className="text-xs text-slate-500">
                          {inv.owner_nm_tampilan || inv.nm_blog} mengundang sebagai{" "}
                          <strong className="text-slate-700 dark:text-slate-300">{CO_AUTHOR_PERAN_LABEL[inv.peran]}</strong>
                        </span>
                      </div>
                      <a
                        href={`https://${inv.subdomain}.${APEX_HOST}/posts/${inv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-myunila line-clamp-2"
                      >
                        {inv.judul}
                      </a>
                      {inv.catatan && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          Catatan dari pengundang: &ldquo;{inv.catatan}&rdquo;
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-400 inline-flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Diundang {new Date(inv.added_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {inv.responded_at && ` · Direspons ${new Date(inv.responded_at).toLocaleDateString("id-ID")}`}
                      </p>
                    </div>
                  </div>

                  {inv.status === "pending" && !showDecline && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(inv)}
                        disabled={acting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {acting ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                        Terima
                      </button>
                      <button
                        onClick={() => { setShowDeclineFor(inv.id_post); setDeclineReason(""); }}
                        disabled={acting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 disabled:opacity-50"
                      >
                        <FiX className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </div>
                  )}

                  {showDecline && (
                    <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Alasan menolak (opsional)…"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeclineSubmit(inv.id_post)}
                          disabled={acting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          {acting ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiX className="w-3.5 h-3.5" />}
                          Konfirmasi Tolak
                        </button>
                        <button
                          onClick={() => { setShowDeclineFor(null); setDeclineReason(""); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Decline reason not exposed in list endpoint; viewable in
                      the post's CoAuthorSection where the owner sees full row. */}
                </CardBody>
              </Card>
            );
          })}
        </ul>
      )}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
