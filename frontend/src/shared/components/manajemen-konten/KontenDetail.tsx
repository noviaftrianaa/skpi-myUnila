"use client";

import Link from "next/link";
import { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";
import { FiArrowLeft, FiCalendar, FiUser, FiEye, FiTag, FiClock } from "react-icons/fi";

/**
 * KontenDetail — shared detail renderer untuk pengumuman/berita/artikel.
 *
 * Pakai dangerouslySetInnerHTML untuk isi rich-text dari Tiptap-style editor.
 * Backend trust: hanya admin developer yang bisa CRUD, jadi sanitize di
 * server tidak strict. Frontend prose styling supaya konten readable.
 */
export default function KontenDetail({
  data,
  backLabel,
  backHref,
}: {
  data: Konten;
  backLabel: string;
  backHref: string;
}) {
  const tanggalTerbit = data.tgl_terbit
    ? new Date(data.tgl_terbit).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-5"
        >
          <FiArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          {data.banner_url && (
            <img
              src={data.banner_url}
              alt={data.judul}
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}

          <div className="p-6 sm:p-8 md:p-10">
            {/* Header — kategori chip + status flag */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {data.nama_kategori && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  <FiTag className="w-3 h-3" /> {data.nama_kategori}
                </span>
              )}
              {data.is_pinned && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  📌 Pinned
                </span>
              )}
              {data.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Judul */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {data.judul}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
              {tanggalTerbit && (
                <span className="inline-flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" /> {tanggalTerbit}
                </span>
              )}
              {data.author && (
                <span className="inline-flex items-center gap-1">
                  <FiUser className="w-3.5 h-3.5" /> {data.author}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <FiEye className="w-3.5 h-3.5" /> {data.view_count.toLocaleString("id-ID")} views
              </span>
              {data.tipe && (
                <span className="inline-flex items-center gap-1 capitalize">
                  <FiClock className="w-3.5 h-3.5" /> {data.tipe}
                </span>
              )}
            </div>

            {/* Ringkasan (kalau ada, tampil sebagai lead paragraph) */}
            {data.ringkasan && (
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-medium mb-6 pl-4 border-l-4 border-blue-500">
                {data.ringkasan}
              </p>
            )}

            {/* Isi rich-text */}
            {data.isi ? (
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-800 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_img]:rounded-lg [&_img]:my-3 [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_hr]:my-6 [&_hr]:border-gray-200"
                dangerouslySetInnerHTML={{ __html: data.isi }}
              />
            ) : (
              <p className="text-sm text-gray-400 italic">(Belum ada konten)</p>
            )}

            {/* Tags */}
            {data.tags && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tag:</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.split(",").map((t) => (
                    <span key={t} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer info */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
              {data.last_update && (
                <p>
                  Diperbarui terakhir:{" "}
                  {new Date(data.last_update).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {data.tgl_expiry && (
                <p>
                  Berlaku sampai:{" "}
                  {new Date(data.tgl_expiry).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
