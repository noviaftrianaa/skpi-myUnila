"use client";

// Theme Settings — color & typography customization per-blog.
// Persist ke blog.theme_config_json. Tenant layout baca dan inject CSS variables.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiEye, FiLayers, FiLoader, FiRefreshCw, FiSave, FiStar,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { useMyBlog, usePublicTemplateThemeList, useUpdateMyBlog } from "@/lib/services/blog-platform";
import type { TemplateTheme } from "@/lib/services/blog-platform";
import type { BlogThemeConfig } from "@/lib/services/blog-platform/types";

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

// Preset palettes — quick start untuk user yang gak mau pilih warna manual.
const PRESETS: { name: string; primer: string; sekunder: string }[] = [
  { name: "Unila Blue (default)", primer: "#0B5EA8", sekunder: "#073864" },
  { name: "Maroon",               primer: "#7C2D12", sekunder: "#451A03" },
  { name: "Forest Green",         primer: "#15803D", sekunder: "#14532D" },
  { name: "Slate",                primer: "#475569", sekunder: "#1E293B" },
  { name: "Royal Purple",         primer: "#7E22CE", sekunder: "#581C87" },
  { name: "Sunset Orange",        primer: "#EA580C", sekunder: "#9A3412" },
  { name: "Cyber Pink",           primer: "#DB2777", sekunder: "#831843" },
  { name: "Charcoal",             primer: "#1F2937", sekunder: "#030712" },
];

const LAYOUT_OPTIONS: { value: NonNullable<BlogThemeConfig["layout"]>; label: string; hint: string }[] = [
  { value: "default", label: "Default", hint: "Grid card 3-column, cover image besar." },
  { value: "minimal", label: "Minimal", hint: "List view, fokus typography, gak ada cover." },
  { value: "magazine", label: "Magazine", hint: "Hero feature + grid, cocok untuk publikasi panjang." },
];

const FONT_JUDUL_OPTIONS: { value: NonNullable<BlogThemeConfig["font_judul"]>; label: string; sample: string }[] = [
  { value: "default", label: "Default (sans-serif)", sample: "Aa Belajar Next.js" },
  { value: "serif",   label: "Serif (formal)",       sample: "Aa Belajar Next.js" },
  { value: "display", label: "Display (bold)",       sample: "Aa Belajar Next.js" },
  { value: "mono",    label: "Mono (tech)",          sample: "Aa Belajar Next.js" },
];

export default function ThemeSettingsPage() {
  const { data: blog, isLoading, error, refetch } = useMyBlog();
  const update = useUpdateMyBlog();
  const { data: templates } = usePublicTemplateThemeList();

  const [primer, setPrimer] = useState("#0B5EA8");
  const [sekunder, setSekunder] = useState("#073864");
  const [layout, setLayout] = useState<BlogThemeConfig["layout"]>("default");
  const [fontJudul, setFontJudul] = useState<BlogThemeConfig["font_judul"]>("default");
  const [darkDefault, setDarkDefault] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!blog) return;
    const t = (blog.theme_config_json || {}) as BlogThemeConfig;
    setPrimer(t.warna_primer || "#0B5EA8");
    setSekunder(t.warna_sekunder || "#073864");
    setLayout(t.layout || "default");
    setFontJudul(t.font_judul || "default");
    setDarkDefault(!!t.dark_mode_default);
  }, [blog]);

  const handleSave = async () => {
    const theme_config_json: Record<string, unknown> = {
      warna_primer: primer,
      warna_sekunder: sekunder,
      layout,
      font_judul: fontJudul,
      dark_mode_default: darkDefault,
    };
    try {
      await update.mutateAsync({ theme_config_json });
      setSavedAt(new Date());
      refetch();
    } catch (e) {
      alert(`Gagal simpan: ${(e as Error).message}`);
    }
  };

  const applyPreset = (p: { primer: string; sekunder: string }) => {
    setPrimer(p.primer);
    setSekunder(p.sekunder);
  };

  // Apply admin template — hydrate semua form fields dari manifest_json.
  // Field yang tidak ada di manifest dibiarkan (jangan reset ke default).
  const applyTemplate = (t: TemplateTheme) => {
    const m = t.manifest_json as Partial<BlogThemeConfig>;
    if (m?.warna_primer) setPrimer(m.warna_primer);
    if (m?.warna_sekunder) setSekunder(m.warna_sekunder);
    if (m?.layout) setLayout(m.layout);
    if (m?.font_judul) setFontJudul(m.font_judul);
    if (typeof m?.dark_mode_default === "boolean") setDarkDefault(m.dark_mode_default);
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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Settings Blog</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Theme & Tampilan</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Customize warna + layout blog. Berubah live di <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="text-myunila hover:underline font-mono text-xs">{blog.subdomain}.{APEX_HOST}</a>.
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

      {/* Template Presets (curated by admin) */}
      {(templates?.length || 0) > 0 && (
        <Card>
          <CardBody className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg inline-flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-myunila" /> Template Pilihan
              </h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Curated by Admin</span>
            </div>
            <p className="text-xs text-slate-500">Klik template untuk apply ke form di bawah. Lanjut customize manual kalau perlu.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates?.map((t) => {
                const m = (t.manifest_json as Partial<BlogThemeConfig>) || {};
                const p = m.warna_primer || "#0B5EA8";
                const s = m.warna_sekunder || "#073864";
                return (
                  <button
                    key={t.id_template_theme}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="group text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:border-myunila hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)` }}>
                      {t.preview_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={t.preview_url} alt={t.nm_template} className="w-full h-full object-cover" />
                      )}
                      {t.a_default && (
                        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase">
                          <FiStar className="w-2.5 h-2.5 fill-current" /> Default
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-1">{t.nm_template}</p>
                      {t.deskripsi && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.deskripsi}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: p }} />
                        <span className="w-3 h-3 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: s }} />
                        {m.layout && (
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-0.5">{m.layout}</span>
                        )}
                        <span className="ml-auto text-[10px] text-slate-400 font-mono">v{t.versi}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Color Palette */}
      <Card>
        <CardBody className="p-6 space-y-5">
          <h2 className="font-semibold text-lg">Warna</h2>

          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Preset Palette</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`group flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                    primer === p.primer && sekunder === p.sekunder
                      ? "border-myunila ring-2 ring-myunila/30"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <span className="w-5 h-2.5 rounded" style={{ backgroundColor: p.primer }} />
                    <span className="w-5 h-2.5 rounded" style={{ backgroundColor: p.sekunder }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Warna Primer" hint="Untuk button, link, accent.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primer}
                  onChange={(e) => setPrimer(e.target.value)}
                  className="w-12 h-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={primer}
                  onChange={(e) => setPrimer(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                />
              </div>
            </Field>
            <Field label="Warna Sekunder" hint="Untuk hover state, accent gelap.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sekunder}
                  onChange={(e) => setSekunder(e.target.value)}
                  className="w-12 h-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={sekunder}
                  onChange={(e) => setSekunder(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                />
              </div>
            </Field>
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 inline-flex items-center gap-2 w-full">
              <FiEye className="w-3.5 h-3.5" /> Live Preview
            </div>
            <div className="p-5 bg-white dark:bg-slate-950 space-y-3">
              <h3 style={{ color: primer }} className="text-2xl font-bold">{blog.nm_blog}</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="#" style={{ color: primer }}>link warna primer</a>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  style={{ backgroundColor: primer }}
                  className="px-3 py-1.5 rounded text-white text-xs font-medium hover:opacity-90"
                >
                  Primary Button
                </button>
                <button
                  style={{ backgroundColor: sekunder }}
                  className="px-3 py-1.5 rounded text-white text-xs font-medium hover:opacity-90"
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Layout */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Layout</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLayout(opt.value)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  layout === opt.value
                    ? "border-myunila bg-myunila/5 ring-2 ring-myunila/30"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-slate-500 mt-1">{opt.hint}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 inline-flex items-start gap-1">
            <FiRefreshCw className="w-3 h-3 mt-0.5" />
            Layout change butuh restart frontend-blog SSR untuk efek penuh.
          </p>
        </CardBody>
      </Card>

      {/* Typography */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Typography</h2>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Font Judul</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONT_JUDUL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFontJudul(opt.value)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    fontJudul === opt.value
                      ? "border-myunila bg-myunila/5 ring-2 ring-myunila/30"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="text-xs text-slate-500 mb-0.5">{opt.label}</p>
                  <p
                    className={`text-lg font-bold ${
                      opt.value === "serif" ? "font-serif" :
                      opt.value === "mono" ? "font-mono" :
                      opt.value === "display" ? "font-display tracking-tight" :
                      ""
                    }`}
                  >
                    {opt.sample}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Dark Mode */}
      <Card>
        <CardBody className="p-6 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={darkDefault}
              onChange={(e) => setDarkDefault(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-myunila"
            />
            <div>
              <p className="font-semibold text-sm">Dark Mode Default</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Blog membuka di dark mode by default (user bisa toggle ke light di reader).
              </p>
            </div>
          </label>
        </CardBody>
      </Card>

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
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
