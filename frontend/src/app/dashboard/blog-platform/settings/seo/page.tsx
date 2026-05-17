"use client";

// SEO Settings — meta_seo_json di blog table.
// Field di-render sebagai <meta> tags di frontend-blog header.

import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiExternalLink, FiInfo, FiLoader, FiSave, FiSearch, FiTwitter,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { useMyBlog, useUpdateMyBlog } from "@/lib/services/blog-platform";
import type { BlogSEOConfig } from "@/lib/services/blog-platform/types";

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function SeoSettingsPage() {
  const { data: blog, isLoading, error, refetch } = useMyBlog();
  const update = useUpdateMyBlog();

  const [titleTemplate, setTitleTemplate] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [twitterCard, setTwitterCard] = useState<"summary" | "summary_large_image">("summary_large_image");
  const [robots, setRobots] = useState<BlogSEOConfig["robots"]>("index,follow");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!blog) return;
    const seo = (blog.meta_seo_json || {}) as BlogSEOConfig;
    setTitleTemplate(seo.title_template || "");
    setDescription(seo.description || blog.tagline || "");
    setKeywords(seo.keywords || "");
    setOgImage(seo.og_image || blog.cover_url || "");
    setTwitterHandle(seo.twitter_handle || "");
    setTwitterCard(seo.twitter_card || "summary_large_image");
    setRobots(seo.robots || "index,follow");
  }, [blog]);

  const handleSave = async () => {
    const seo: Record<string, unknown> = {};
    if (titleTemplate.trim()) seo.title_template = titleTemplate.trim();
    if (description.trim()) seo.description = description.trim().slice(0, 320);
    if (keywords.trim()) seo.keywords = keywords.trim();
    if (ogImage.trim()) seo.og_image = ogImage.trim();
    if (twitterHandle.trim()) seo.twitter_handle = twitterHandle.trim().replace(/^@/, "");
    if (twitterCard) seo.twitter_card = twitterCard;
    if (robots) seo.robots = robots;

    try {
      await update.mutateAsync({ meta_seo_json: seo });
      setSavedAt(new Date());
      refetch();
    } catch (e) {
      alert(`Gagal simpan: ${(e as Error).message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" /> Memuat…
      </div>
    );
  }
  if (error || !blog) {
    return (
      <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-900 dark:text-rose-300">
          {(error as Error)?.message || "Belum punya blog. Claim subdomain dulu."}
        </p>
      </div>
    );
  }

  const blogUrl = `https://${blog.subdomain}.${APEX_HOST}`;
  const previewTitle = titleTemplate ? titleTemplate.replace("{title}", "Belajar Next.js 15") : "Belajar Next.js 15 - " + blog.nm_blog;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Settings Blog</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
            <FiSearch className="w-6 h-6 text-myunila" /> SEO Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Optimasi pencarian Google + tampilan preview di sosial media.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
              <FiCheck className="w-3 h-3" />
              Tersimpan {savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {update.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </header>

      {/* Meta Tags */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg inline-flex items-center gap-2">
            <FiSearch className="w-4 h-4 text-myunila" /> Meta Tags
          </h2>
          <Field
            label={`Title Template (${titleTemplate.length} char)`}
            hint="Gunakan {title} sebagai placeholder judul post. Contoh: `{title} - Catatan Mizar`. Kosongkan untuk pakai default."
          >
            <input
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              placeholder={`{title} - ${blog.nm_blog}`}
              maxLength={120}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
            />
          </Field>
          <Field
            label={`Meta Description (${description.length}/320)`}
            hint="Akan tampil di hasil pencarian Google. Optimal 150-160 char."
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 320))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none"
            />
          </Field>
          <Field label="Keywords (comma-separated)" hint="Sudah tidak penting buat Google modern, tapi masih dibaca beberapa search engine.">
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="nextjs, react, web dev, tutorial"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </Field>
          <Field label="Robots Directive" hint="Kalau noindex, blog tidak akan muncul di Google.">
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value as BlogSEOConfig["robots"])}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="index,follow">index, follow (default - tampil di Google + ikuti link)</option>
              <option value="noindex,follow">noindex, follow (sembunyikan dari Google, link tetap di-crawl)</option>
              <option value="index,nofollow">index, nofollow</option>
              <option value="noindex,nofollow">noindex, nofollow (sembunyikan total)</option>
            </select>
          </Field>
        </CardBody>
      </Card>

      {/* Open Graph */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg inline-flex items-center gap-2">
            <FiExternalLink className="w-4 h-4 text-blue-500" /> Open Graph (Facebook, LinkedIn, WhatsApp)
          </h2>
          <Field label="OG Image URL" hint="Image default kalau post tidak punya cover. Rekomendasi 1200×630 px.">
            <input
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
            />
          </Field>
          {ogImage && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ogImage} alt="OG preview" className="aspect-[1.91/1] object-cover w-full bg-slate-100 dark:bg-slate-800" />
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-xs">
                <p className="text-slate-500 uppercase tracking-wider">{APEX_HOST}</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{previewTitle}</p>
                <p className="text-slate-500 line-clamp-2 mt-0.5">{description || "(no description)"}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Twitter */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg inline-flex items-center gap-2">
            <FiTwitter className="w-4 h-4 text-sky-500" /> Twitter / X
          </h2>
          <Field label="Twitter Handle" hint="Tanpa @. Akan tampil sebagai 'creator' di Twitter card.">
            <div className="flex items-center">
              <span className="px-3 py-2 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500">@</span>
              <input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="flex-1 px-3 py-2 rounded-r-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
              />
            </div>
          </Field>
          <Field label="Card Type">
            <select
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value as "summary" | "summary_large_image")}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="summary_large_image">summary_large_image (preview besar, recommended)</option>
              <option value="summary">summary (preview kecil, square)</option>
            </select>
          </Field>
        </CardBody>
      </Card>

      {/* Google Preview */}
      <Card className="border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20">
        <CardBody className="p-5 space-y-3">
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300 inline-flex items-center gap-2">
            <FiSearch className="w-4 h-4" /> Preview di Google
          </h3>
          <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-blue-200 dark:border-blue-900/40 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              {blog.avatar_url && (
                <Image src={blog.avatar_url} alt="" width={16} height={16} className="rounded-full" unoptimized />
              )}
              <span>{blog.nm_blog}</span>
              <span>·</span>
              <span className="font-mono">{blog.subdomain}.{APEX_HOST}</span>
            </div>
            <a href={blogUrl} className="text-blue-600 hover:underline text-lg leading-tight block">
              {previewTitle}
            </a>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
              {description || "(no description — Google akan auto-pick dari konten)"}
            </p>
          </div>
          <p className="text-[11px] text-blue-900 dark:text-blue-400 inline-flex items-start gap-1">
            <FiInfo className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Preview di atas adalah simulasi. Hasil aktual di Google bisa berbeda tergantung konten + kata kunci pencarian.
          </p>
        </CardBody>
      </Card>

      <div className="pt-2">
        <Link
          href="/dashboard/blog-platform"
          className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
