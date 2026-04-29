"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiEye,
  FiTag,
  FiClock,
  FiShare2,
  FiCheck,
  FiPrinter,
  FiLink,
} from "react-icons/fi";
import { FaWhatsapp, FaTelegramPlane, FaFacebook } from "react-icons/fa";

const KATEGORI_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
  sky: "bg-sky-500",
  gray: "bg-gray-500",
};

export default function KontenDetail({
  data,
  backLabel,
  backHref,
}: {
  data: Konten;
  backLabel: string;
  backHref: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  const tanggalTerbit = data.tgl_terbit
    ? new Date(data.tgl_terbit).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const readingMinutes = useMemo(() => {
    if (!data.isi) return 0;
    const text = String(data.isi).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    return Math.max(1, Math.round(words / 200));
  }, [data.isi]);

  const shareUrl = encodeURIComponent(pageUrl);
  const shareTitle = encodeURIComponent(data.judul);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const dotColor = KATEGORI_DOT[data.color_kategori || "gray"] || KATEGORI_DOT.gray;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30 print:bg-white">
      {/* Sticky top bar (hidden on print) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 print:hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrint}
                title="Cetak"
                className="hidden sm:inline-flex p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <FiPrinter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShareOpen((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <FiShare2 className="w-3.5 h-3.5" />
                Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Share dropdown */}
        {shareOpen && (
          <div className="border-t border-gray-200/60 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                <FaTelegramPlane className="w-3.5 h-3.5" />
                Telegram
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <FaFacebook className="w-3.5 h-3.5" />
                Facebook
              </a>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  copied
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <FiLink className="w-3.5 h-3.5" />
                    Salin Tautan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 print:hidden">
          <Link href="/portal" className="hover:text-blue-600">Portal</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href={backHref} className="hover:text-blue-600">{backLabel}</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <span className="text-gray-700 truncate inline-block max-w-[200px] align-bottom">
            {data.judul}
          </span>
        </nav>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0">
          {/* Banner */}
          {data.banner_url && (
            <div className="relative w-full">
              <img
                src={data.banner_url}
                alt={data.judul}
                className="w-full h-48 sm:h-64 md:h-80 object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            </div>
          )}

          <div className="p-5 sm:p-8 md:p-10">
            {/* Header chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {data.nama_kategori && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  {data.nama_kategori}
                </span>
              )}
              {data.is_pinned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  📌 Pinned
                </span>
              )}
              {data.is_featured && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  ⭐ Featured
                </span>
              )}
              {data.tipe && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                  {data.tipe}
                </span>
              )}
            </div>

            {/* Judul */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
              {data.judul}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
              {tanggalTerbit && (
                <span className="inline-flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" />
                  {tanggalTerbit}
                </span>
              )}
              {data.author && (
                <span className="inline-flex items-center gap-1">
                  <FiUser className="w-3.5 h-3.5" />
                  {data.author}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <FiEye className="w-3.5 h-3.5" />
                {data.view_count.toLocaleString("id-ID")} views
              </span>
              {readingMinutes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" />
                  {readingMinutes} menit baca
                </span>
              )}
            </div>

            {/* Ringkasan */}
            {data.ringkasan && (
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium mb-6 pl-4 border-l-4 border-blue-500 bg-blue-50/40 rounded-r-lg py-3 pr-4">
                {data.ringkasan}
              </p>
            )}

            {/* Isi */}
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Tag
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.split(",").map((t) => {
                    const tag = t.trim();
                    if (!tag) return null;
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors"
                      >
                        <FiTag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer info */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-0.5 print:hidden">
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

        {/* Bottom share/back actions (mobile-friendly) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              copied
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copied ? (
              <>
                <FiCheck className="w-4 h-4" />
                Tersalin
              </>
            ) : (
              <>
                <FiLink className="w-4 h-4" />
                Salin Tautan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
