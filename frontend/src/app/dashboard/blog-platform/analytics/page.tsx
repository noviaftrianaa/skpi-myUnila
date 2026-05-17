"use client";

// Analytics — performa blog kamu (wired ke /me/blog/analytics/summary).
// Real data: views series, totals lifetime, window + previous window comparison,
// top posts in window, referrer breakdown.

import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@heroui/react";
import {
  FiArrowRight, FiBarChart2, FiCalendar, FiEye, FiFileText, FiHeart, FiLoader,
  FiMessageCircle, FiTrendingDown, FiTrendingUp, FiUsers, FiAlertCircle, FiExternalLink,
} from "react-icons/fi";
import { useState } from "react";
import { useAnalyticsSummary, useMyBlog } from "@/lib/services/blog-platform";
import type { BlogTopPost, DailyViews } from "@/lib/services/blog-platform";

type Period = "7d" | "30d" | "90d" | "1y";
const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"overview" | "posts" | "referrers">("overview");
  const [period, setPeriod] = useState<Period>("30d");
  const days = PERIOD_DAYS[period];

  const { data: blog } = useMyBlog();
  const { data: summary, isLoading, error } = useAnalyticsSummary(days);

  const daily = summary?.daily ?? [];
  const totals = summary?.totals;
  const win = summary?.window;
  const prev = summary?.previous;
  const topPosts = summary?.top_posts ?? [];
  const refs = summary?.top_referrers ?? [];

  const pct = (curr: number, before: number) => {
    if (before === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - before) / before) * 100);
  };
  const deltaViews = win && prev ? pct(win.views, prev.views) : 0;
  const deltaLikes = win && prev ? pct(win.likes, prev.likes) : 0;
  const deltaKomentar = win && prev ? pct(win.komentar, prev.komentar) : 0;

  const bestDay = daily.length > 0 ? daily.reduce((a, b) => (a.views > b.views ? a : b)) : null;
  const engagementRate = win && win.views > 0
    ? ((win.likes + win.komentar) / win.views * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiBarChart2 className="w-6 h-6 text-myunila" /> Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Performa blog kamu — views, engagement, traffic source.
            {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
        >
          <option value="7d">7 hari terakhir</option>
          <option value="30d">30 hari terakhir</option>
          <option value="90d">90 hari terakhir</option>
          <option value="1y">1 tahun terakhir</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-800">
        {[
          { v: "overview",  l: "Overview" },
          { v: "posts",     l: "Top Posts" },
          { v: "referrers", l: "Traffic Source" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v as typeof tab)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.v
                ? "border-myunila text-myunila"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Top metrics — window vs previous window */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={FiEye}
              label="Views"
              value={(win?.views ?? 0).toLocaleString()}
              sub={`${days} hari`}
              delta={`${deltaViews >= 0 ? "+" : ""}${deltaViews}% vs sebelumnya`}
              trend={deltaViews >= 0 ? "up" : "down"}
              color="emerald"
            />
            <MetricCard
              icon={FiHeart}
              label="Likes"
              value={(win?.likes ?? 0).toLocaleString()}
              sub={`${days} hari`}
              delta={`${deltaLikes >= 0 ? "+" : ""}${deltaLikes}% vs sebelumnya`}
              trend={deltaLikes >= 0 ? "up" : "down"}
              color="rose"
            />
            <MetricCard
              icon={FiMessageCircle}
              label="Komentar"
              value={(win?.komentar ?? 0).toLocaleString()}
              sub={`${days} hari`}
              delta={`${deltaKomentar >= 0 ? "+" : ""}${deltaKomentar}% vs sebelumnya`}
              trend={deltaKomentar >= 0 ? "up" : "down"}
              color="amber"
            />
            <MetricCard
              icon={FiUsers}
              label="Followers"
              value={(totals?.followers ?? blog?.jumlah_follower ?? 0).toLocaleString()}
              sub="Total"
              color="purple"
            />
          </div>

          {/* Chart */}
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">Trend Kunjungan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Views harian {days} hari terakhir</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-myunila tabular-nums">{(win?.views ?? 0).toLocaleString()}</p>
                  <p className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                    deltaViews >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {deltaViews >= 0 ? "↑" : "↓"} {Math.abs(deltaViews)}%
                  </p>
                </div>
              </div>
              {daily.length > 0 ? <AreaChart data={daily} /> : (
                <div className="py-12 text-center text-sm text-slate-400">Belum ada data views di rentang ini.</div>
              )}
            </CardBody>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Lifetime</h3>
                <div className="space-y-2.5">
                  <Statline label="Total views" value={(totals?.views ?? 0).toLocaleString()} />
                  <Statline label="Total likes" value={(totals?.likes ?? 0).toLocaleString()} />
                  <Statline label="Total komentar" value={(totals?.komentar ?? 0).toLocaleString()} />
                  <Statline label="Published post" value={totals?.posts ?? 0} />
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Best Day</h3>
                {bestDay && bestDay.views > 0 ? (
                  <div>
                    <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{bestDay.views}</p>
                    <p className="text-xs text-slate-500 mt-0.5">views in 1 day</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 inline-flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(bestDay.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">—</p>
                )}
              </CardBody>
            </Card>

            <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Engagement (window)</h3>
                <div className="space-y-2.5">
                  <Statline label="Engagement rate" value={`${engagementRate.toFixed(1)}%`} hint="(likes + komentar) ÷ views" />
                  <Statline label="Avg views/hari" value={daily.length > 0 ? Math.round((win?.views ?? 0) / daily.length).toLocaleString() : "0"} />
                  <Statline label="Avg views/post" value={totals && totals.posts > 0 ? Math.round((totals.views ?? 0) / totals.posts).toLocaleString() : "0"} hint="lifetime" />
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {tab === "posts" && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-0">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-myunila" /> Top Posts ({days} hari)
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">{topPosts.length} post</span>
            </div>
            {topPosts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">Belum ada post dengan views di rentang ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">Post</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Tgl Terbit</th>
                      <th className="px-5 py-3 text-right" title="Views in window"><FiEye className="inline w-3.5 h-3.5" /> Win</th>
                      <th className="px-5 py-3 text-right hidden md:table-cell" title="Lifetime views"><FiEye className="inline w-3.5 h-3.5" /> Total</th>
                      <th className="px-5 py-3 text-right"><FiHeart className="inline w-3.5 h-3.5" /></th>
                      <th className="px-5 py-3 text-right"><FiMessageCircle className="inline w-3.5 h-3.5" /></th>
                      <th className="px-5 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {topPosts.map((p: BlogTopPost, idx: number) => (
                      <tr key={p.id_post} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 group">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                            idx === 0 ? "bg-amber-100 text-amber-700" :
                            idx === 1 ? "bg-slate-200 text-slate-700" :
                            idx === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.cover_url ? (
                              <Image
                                src={p.cover_url}
                                alt={p.judul}
                                width={48}
                                height={32}
                                className="rounded object-cover flex-shrink-0 bg-slate-100"
                              />
                            ) : (
                              <div className="w-12 h-8 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-300">
                                <FiFileText className="w-3 h-3" />
                              </div>
                            )}
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{p.judul}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-xs text-slate-500 tabular-nums whitespace-nowrap">
                          {p.tgl_terbit ? new Date(p.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-myunila">
                          {p.window_views.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right text-sm tabular-nums text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {p.jumlah_view.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right text-sm tabular-nums text-slate-600 dark:text-slate-400">
                          {p.jumlah_like}
                        </td>
                        <td className="px-5 py-3 text-right text-sm tabular-nums text-slate-600 dark:text-slate-400">
                          {p.jumlah_komentar}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/dashboard/blog-platform/posts/${p.id_post}/edit`}
                            className="text-[11px] text-myunila opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 hover:underline"
                          >
                            Detail <FiArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === "referrers" && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-0">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
                <FiExternalLink className="w-4 h-4 text-myunila" /> Traffic Source ({days} hari)
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">Top {refs.length}</span>
            </div>
            {refs.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">Belum ada data referrer di rentang ini.</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  const max = refs[0].views || 1;
                  return refs.map((r) => {
                    const pctBar = (r.views / max) * 100;
                    return (
                      <li key={r.host} className="px-5 py-3 flex items-center gap-4">
                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300 w-44 truncate flex-shrink-0" title={r.host}>{r.host}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-myunila/70 rounded-full" style={{ width: `${pctBar.toFixed(1)}%` }} />
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300 w-20 text-right flex-shrink-0">{r.views.toLocaleString()}</span>
                      </li>
                    );
                  });
                })()}
              </ul>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ============================== Components ==============================

function MetricCard({
  icon: Icon, label, value, sub, delta, trend, color,
}: {
  icon: typeof FiEye; label: string; value: string; sub?: string;
  delta?: string; trend?: "up" | "down"; color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; gradFrom: string }> = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", gradFrom: "from-emerald-500/10" },
    rose:    { bg: "bg-rose-50 dark:bg-rose-950/40",       text: "text-rose-600 dark:text-rose-400",       gradFrom: "from-rose-500/10" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-950/40",     text: "text-amber-600 dark:text-amber-400",     gradFrom: "from-amber-500/10" },
    purple:  { bg: "bg-purple-50 dark:bg-purple-950/40",   text: "text-purple-600 dark:text-purple-400",   gradFrom: "from-purple-500/10" },
  };
  const c = colorMap[color] || colorMap.emerald;
  const TrendIcon = trend === "up" ? FiTrendingUp : FiTrendingDown;
  return (
    <Card className={`relative overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br ${c.gradFrom} to-transparent`}>
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">{value}</p>
        <div className="mt-1.5 min-h-[16px]">
          {delta && trend && (
            <span className={`text-[11px] font-semibold inline-flex items-center gap-0.5 ${
              trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              <TrendIcon className="w-3 h-3" /> {delta}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function Statline({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
        {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
      </div>
      <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

// SVG area chart, pure CSS — no dep.
function AreaChart({ data }: { data: DailyViews[] }) {
  const w = 800;
  const h = 200;
  const pad = { top: 8, right: 4, bottom: 28, left: 4 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.views));
  const min = Math.min(...data.map((d) => d.views));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad.left + (i / Math.max(1, data.length - 1)) * cw;
    const y = pad.top + ch - ((d.views - min) / range) * ch;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${pad.top + ch} L ${points[0].x.toFixed(1)} ${pad.top + ch} Z`;

  const tickIndices = points.length > 4
    ? [0, Math.floor(points.length * 0.25), Math.floor(points.length * 0.5), Math.floor(points.length * 0.75), points.length - 1]
    : points.map((_, i) => i);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="analytics-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(11, 94, 168)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(11, 94, 168)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r, i) => (
          <line
            key={i}
            x1={pad.left}
            x2={w - pad.right}
            y1={pad.top + ch * r}
            y2={pad.top + ch * r}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            className="text-slate-200 dark:text-slate-800"
          />
        ))}
        <path d={areaPath} fill="url(#analytics-area-grad)" />
        <path
          d={linePath}
          fill="none"
          stroke="rgb(11, 94, 168)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {tickIndices.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={h - 8}
            textAnchor="middle"
            className="text-[9px] fill-slate-400"
          >
            {points[i].date.slice(5)}
          </text>
        ))}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill="rgb(11, 94, 168)"
          stroke="white"
          strokeWidth="2"
        />
        <text x={pad.left + 4} y={pad.top + 12} className="text-[9px] fill-slate-400 font-semibold tabular-nums">
          {max}
        </text>
        <text x={pad.left + 4} y={pad.top + ch - 2} className="text-[9px] fill-slate-400 font-semibold tabular-nums">
          {min}
        </text>
      </svg>
    </div>
  );
}
