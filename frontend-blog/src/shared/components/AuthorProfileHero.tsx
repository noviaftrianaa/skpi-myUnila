import Image from "next/image";
import { BadgeCheck, ExternalLink, Github, Globe, Instagram, Linkedin, MapPin, Star, Twitter } from "lucide-react";
import type { Author } from "@/types/blog";
import { formatNumber } from "@/lib/utils";
import { FollowButton } from "./FollowButton";

const SOSMED_ICON: Record<string, typeof Twitter> = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  scholar: ExternalLink,
};

const SOSMED_URL = (key: string, value: string): string => {
  if (value.startsWith("http")) return value;
  if (key === "twitter") return `https://twitter.com/${value}`;
  if (key === "instagram") return `https://instagram.com/${value}`;
  if (key === "linkedin") return `https://linkedin.com/in/${value}`;
  if (key === "github") return `https://github.com/${value}`;
  if (key === "scholar") return `https://scholar.google.com/citations?user=${value}`;
  return `https://${value}`;
};

interface Props {
  author: Author;
}

// Hero portfolio CV-style untuk per-user blog (tenant homepage).
// Menampilkan: avatar besar, nama, role/fakultas, tagline, sosmed, stats SEO, badge.
// PRIVACY: hanya tampil data yang user input atau sudah publik (nama, fakultas/prodi).
//   Tidak pernah tampil: NIM penuh selain di subdomain (opt-in), NIP, alamat, telp, IPK, NIK.
export function AuthorProfileHero({ author }: Props) {
  const sosmed = author.sosmed_json || {};
  const accent = author.theme_config_json?.warna_primer || "#0B5EA8";
  const memberYear = author.member_sejak ? new Date(author.member_sejak).getFullYear() : null;

  return (
    <section className="relative">
      {/* Cover dengan gradient overlay */}
      <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-slate-200 dark:bg-slate-800">
        {author.cover_url ? (
          <Image src={author.cover_url} alt="" fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}80 50%, ${accent}40 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-slate-950 dark:via-slate-950/30" />
        {/* Decorative shapes */}
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 blur-xl" aria-hidden />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Avatar + identity (left/full width) */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            {author.avatar_url && (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-950 shadow-xl">
                <Image src={author.avatar_url} alt={author.nm_tampilan} fill className="object-cover" sizes="160px" priority />
              </div>
            )}

            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight inline-flex items-center gap-2 text-balance">
              {author.nm_tampilan}
              {author.a_terverifikasi && (
                <BadgeCheck
                  className="w-7 h-7"
                  style={{ color: accent }}
                  fill={`${accent}30`}
                  aria-label="Verified by myUnila"
                />
              )}
            </h1>

            {/* Follow button — interactive, dgn count live */}
            <div className="mt-3 flex justify-center md:justify-start">
              <FollowButton subdomain={author.subdomain} initialCount={author.jumlah_follower} />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
              <RoleBadge role={author.tipe_role} />
              {author.fakultas && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium">{author.fakultas}</span>
                </>
              )}
              {author.prodi && (
                <>
                  <span aria-hidden>·</span>
                  <span>{author.prodi}</span>
                </>
              )}
              {author.lokasi && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{author.lokasi}</span>
                </>
              )}
            </div>

            {author.tagline && (
              <p className="mt-3 text-base sm:text-lg italic text-slate-700 dark:text-slate-300 max-w-2xl text-pretty">
                "{author.tagline}"
              </p>
            )}

            {/* Sosmed buttons */}
            {Object.keys(sosmed).length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {Object.entries(sosmed).map(([key, value]) => {
                  if (!value) return null;
                  const Icon = SOSMED_ICON[key] || ExternalLink;
                  return (
                    <a
                      key={key}
                      href={SOSMED_URL(key, value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110 transition-all shadow-sm"
                      aria-label={`${key}: ${value}`}
                      title={`${key}: ${value}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}

            {memberSince(memberYear)}
          </div>

          {/* Stats sidebar (right) */}
          <div className="md:col-span-1">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statistik</h3>

              <StatRow label="Posts"     value={formatNumber(author.jumlah_post)} />
              <StatRow label="Views"     value={formatNumber(author.jumlah_view)} />
              <StatRow label="Likes"     value={formatNumber(author.jumlah_like_total ?? 0)} />
              <StatRow label="Followers" value={formatNumber(author.jumlah_follower)} />

              {author.rating_count && author.rating_count > 0 && (
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Rating</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-slate-900 dark:text-slate-100">{author.rating_avg?.toFixed(1)}</span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500">({formatNumber(author.rating_count)})</span>
                    </div>
                  </div>
                </div>
              )}

              {author.skor_seo !== undefined && author.skor_seo > 0 && (
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600 dark:text-slate-400 inline-flex items-center gap-1">
                      Skor SEO
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-myunila/10 text-myunila font-medium">Live</span>
                    </span>
                    <span className="font-display font-bold text-myunila">{formatNumber(author.skor_seo)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (author.skor_seo / 30000) * 100)}%`,
                        background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Ranking di apex blog.unila.ac.id</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {author.bio && (
          <div className="mt-8 max-w-3xl mx-auto md:mx-0">
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 text-pretty">
              {author.bio}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function memberSince(year: number | null) {
  if (!year) return null;
  return (
    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
      Bergabung sejak <span className="font-medium text-slate-700 dark:text-slate-300">{year}</span>
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    MHS:    { label: "Mahasiswa",   bg: "bg-blue-100 dark:bg-blue-950",     text: "text-blue-700 dark:text-blue-400" },
    STAF:   { label: "Staf/Tendik", bg: "bg-amber-100 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-400" },
    DOSEN:  { label: "Dosen",       bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-400" },
    ALUMNI: { label: "Alumni",      bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  };
  const c = config[role] || config.MHS;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
}
