"use client";

// CoAuthorSection — sidebar card untuk post editor.
// Shows current co-authors + add/remove flow. Picker = search by subdomain.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiLoader, FiPlus, FiSearch, FiTrash2, FiUsers, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  CO_AUTHOR_PERAN_LABEL, CO_AUTHOR_STATUS_LABEL,
  useAddCoAuthor, useCoAuthors, useRemoveCoAuthor,
  useBlogBySubdomain,
} from "@/lib/services/blog-platform";
import type { CoAuthorPeran, CoAuthorStatus } from "@/lib/services/blog-platform";

const STATUS_PILL: Record<CoAuthorStatus, string> = {
  pending:  "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  accepted: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  declined: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

interface Props {
  idPost: string | null; // null saat create-mode (post belum saved)
}

export function CoAuthorSection({ idPost }: Props) {
  const { data: list = [], isLoading } = useCoAuthors(idPost);
  const removeMut = useRemoveCoAuthor();
  const [showPicker, setShowPicker] = useState(false);

  if (!idPost) {
    return (
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5" /> Co-author
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Simpan draft dulu untuk menambahkan co-author.
          </p>
        </CardBody>
      </Card>
    );
  }

  const handleRemove = async (idBlogCo: string, nm: string) => {
    if (!confirm(`Keluarkan ${nm} dari co-author post ini?`)) return;
    try {
      await removeMut.mutateAsync({ idPost, idBlogCo });
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5" /> Co-author
            {isLoading && <FiLoader className="w-3 h-3 animate-spin text-myunila" />}
          </h3>
          <button
            onClick={() => setShowPicker(true)}
            className="text-[11px] text-myunila hover:underline inline-flex items-center gap-1"
          >
            <FiPlus className="w-3 h-3" /> Tambah
          </button>
        </div>

        {list.length === 0 && !isLoading && (
          <p className="text-xs text-slate-500">
            Belum ada co-author. Klik &ldquo;Tambah&rdquo; untuk credit kontributor.
          </p>
        )}

        {list.length > 0 && (
          <ul className="space-y-2">
            {list.map((ca) => (
              <li key={ca.id_blog_co} className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {ca.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ca.avatar_url} alt={ca.nm_tampilan} className="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    {ca.nm_tampilan.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{ca.nm_tampilan}</p>
                    <span className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${STATUS_PILL[ca.status]}`}>
                      {CO_AUTHOR_STATUS_LABEL[ca.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {CO_AUTHOR_PERAN_LABEL[ca.peran]} · @{ca.subdomain}
                  </p>
                  {ca.catatan && (
                    <p className="mt-0.5 text-[10px] text-slate-400 italic line-clamp-2">&ldquo;{ca.catatan}&rdquo;</p>
                  )}
                  {ca.alasan_response && ca.status === "declined" && (
                    <p className="mt-0.5 text-[10px] text-rose-500 italic line-clamp-2">Alasan tolak: &ldquo;{ca.alasan_response}&rdquo;</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(ca.id_blog_co, ca.nm_tampilan)}
                  disabled={removeMut.isPending}
                  className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 disabled:opacity-50"
                  title="Keluarkan"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      {showPicker && (
        <CoAuthorPickerModal
          idPost={idPost}
          existingBlogIDs={list.map((c) => c.id_blog_co)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </Card>
  );
}

// ============================== Picker modal ==============================

function CoAuthorPickerModal({ idPost, existingBlogIDs, onClose }: {
  idPost: string;
  existingBlogIDs: string[];
  onClose: () => void;
}) {
  const [subdomain, setSubdomain] = useState("");
  const [peran, setPeran] = useState<CoAuthorPeran>("co_author");
  const [catatan, setCatatan] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const trimmedSub = subdomain.trim().toLowerCase();
  const lookup = useBlogBySubdomain(trimmedSub);
  const addMut = useAddCoAuthor();

  const found = lookup.data;
  const alreadyAdded = found && existingBlogIDs.includes(found.id_blog);

  const submit = async () => {
    if (!found || alreadyAdded) return;
    setSubmitError(null);
    try {
      await addMut.mutateAsync({
        idPost,
        input: {
          id_blog_co: found.id_blog,
          peran,
          catatan: catatan.trim() || null,
        },
      });
      onClose();
    } catch (e) {
      setSubmitError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base">Tambah Co-author</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Subdomain Penulis</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                autoFocus
                placeholder="bambang-dosen"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Penulis lain di platform ini. Ketik subdomain blog mereka (bagian sebelum .blog.unila.ac.id).
            </p>
          </div>

          {/* Lookup result */}
          {trimmedSub.length >= 2 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
              {lookup.isLoading && (
                <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                  <FiLoader className="w-3 h-3 animate-spin" /> Mencari…
                </p>
              )}
              {lookup.error && (
                <p className="text-xs text-rose-600 inline-flex items-center gap-1.5">
                  <FiAlertCircle className="w-3.5 h-3.5" /> Blog tidak ditemukan
                </p>
              )}
              {found && (
                <div className="flex items-start gap-2">
                  {found.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={found.avatar_url} alt={found.nm_tampilan ?? ""} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{found.nm_tampilan}</p>
                    <p className="text-[11px] text-slate-500">{found.nm_blog} · @{found.subdomain}</p>
                  </div>
                  {alreadyAdded && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600">
                      Sudah ditambahkan
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Peran</label>
            <select
              value={peran}
              onChange={(e) => setPeran(e.target.value as CoAuthorPeran)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            >
              {Object.entries(CO_AUTHOR_PERAN_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Catatan (opsional)</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="Edited section 3, provided dataset, dll"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
          </div>

          {submitError && (
            <p className="text-xs text-rose-600 inline-flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" /> {submitError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={!found || !!alreadyAdded || addMut.isPending}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {addMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
