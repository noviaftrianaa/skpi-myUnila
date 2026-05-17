import { Award, Briefcase, FileText, GraduationCap, Languages, Sparkles } from "lucide-react";
import type { CVData } from "@/types/blog";

interface Props {
  cv: CVData;
}

// CV-style portfolio sections (LinkedIn-inspired, single page scrollable)
// Render hanya section yang ada datanya (skip empty).
export function AuthorCV({ cv }: Props) {
  if (!cv) return null;

  const hasAny = (cv.pendidikan?.length || cv.pengalaman?.length || cv.skills?.length || cv.sertifikasi?.length || cv.publikasi?.length || cv.bahasa?.length);
  if (!hasAny) return null;

  return (
    <div className="space-y-12">
      {cv.pengalaman && cv.pengalaman.length > 0 && (
        <Section title="Pengalaman" icon={Briefcase}>
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
            {cv.pengalaman.map((p, i) => (
              <li key={i} className="ml-6">
                <span className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-myunila ring-4 ring-white dark:ring-slate-950" aria-hidden />
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">{p.posisi}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {p.organisasi}{p.lokasi && <span className="text-slate-500"> · {p.lokasi}</span>}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.tahun_mulai}{p.tahun_selesai ? ` – ${p.tahun_selesai}` : " – sekarang"}
                </p>
                {p.deskripsi && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.deskripsi}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {cv.pendidikan && cv.pendidikan.length > 0 && (
        <Section title="Pendidikan" icon={GraduationCap}>
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
            {cv.pendidikan.map((p, i) => (
              <li key={i} className="ml-6">
                <span className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-950" aria-hidden />
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">
                  {p.jenjang} — {p.institusi}
                </h3>
                {p.prodi && <p className="text-sm text-slate-700 dark:text-slate-300">{p.prodi}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.tahun_mulai}{p.tahun_selesai ? ` – ${p.tahun_selesai}` : " – sekarang"}
                </p>
                {p.deskripsi && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.deskripsi}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {cv.skills && cv.skills.length > 0 && (
        <Section title="Skills" icon={Sparkles}>
          {(() => {
            // Group by kategori
            const grouped = new Map<string, typeof cv.skills>();
            cv.skills!.forEach((s) => {
              const k = s.kategori || "Lainnya";
              if (!grouped.has(k)) grouped.set(k, []);
              grouped.get(k)!.push(s);
            });
            return (
              <div className="space-y-4">
                {Array.from(grouped.entries()).map(([kat, items]) => (
                  <div key={kat}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{kat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items!.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          {s.nm_skill}
                          {s.level && (
                            <span className="text-xs text-slate-400" aria-label={`Level ${s.level} of 5`}>
                              {"●".repeat(s.level)}{"○".repeat(5 - s.level)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Section>
      )}

      {cv.sertifikasi && cv.sertifikasi.length > 0 && (
        <Section title="Sertifikasi" icon={Award}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cv.sertifikasi.map((s, i) => (
              <a
                key={i}
                href={s.url || "#"}
                target={s.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-myunila/40 transition-all"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{s.nm}</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{s.issuer}</p>
                <p className="mt-1 text-xs text-slate-500">{s.tahun}</p>
              </a>
            ))}
          </div>
        </Section>
      )}

      {cv.publikasi && cv.publikasi.length > 0 && (
        <Section title="Publikasi" icon={FileText}>
          <ul className="space-y-3">
            {cv.publikasi.map((p, i) => (
              <li key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <a
                  href={p.url || "#"}
                  target={p.url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila transition-colors">{p.judul}</h3>
                  {p.venue && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 italic">{p.venue}</p>}
                  <p className="mt-1 text-xs text-slate-500">{p.tahun}</p>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {cv.bahasa && cv.bahasa.length > 0 && (
        <Section title="Bahasa" icon={Languages}>
          <div className="flex flex-wrap gap-3">
            {cv.bahasa.map((b, i) => (
              <div key={i} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.nm}</p>
                <p className="text-xs text-slate-500 capitalize">{levelLabel(b.level)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Briefcase; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-display font-bold mb-5 inline-flex items-center gap-2">
        <Icon className="w-5 h-5 text-myunila" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function levelLabel(level: string): string {
  const map: Record<string, string> = { basic: "Dasar", intermediate: "Menengah", advanced: "Lanjut", native: "Asli (Native)" };
  return map[level] || level;
}
