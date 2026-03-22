"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { projectService, type UserProfile } from "@/lib/services/project/projectService";
import { ContributionHeatmap } from "./ContributionHeatmap";

interface UserProfileCardProps {
  userId:    string;
  role?:     string;
  compact?:  boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
];

function userGradient(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

const ROLE_LABEL: Record<string, string> = {
  owner:  "Owner",
  admin:  "Admin",
  member: "Anggota",
  viewer: "Pengamat",
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UserProfileCard({ userId, role, compact = false, className = "" }: UserProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    projectService
      .getUserProfile(userId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const gradient = userGradient(userId);
  const initials = profile ? getInitials(profile.nm_pengguna) : "?";
  const currentYear = new Date().getFullYear();

  // ── Compact inline row ─────────────────────────────────────────────────────
  if (compact) {
    if (loading) {
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="w-28 h-3.5" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      );
    }
    if (!profile) {
      return (
        <div className={`flex items-center gap-3 text-gray-400 text-sm ${className}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <span>Pengguna tidak ditemukan</span>
        </div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-3 ${className}`}
      >
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {profile.nm_pengguna}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {role && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {ROLE_LABEL[role] ?? role}
              </span>
            )}
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ✅ {profile.stats.task_completed}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              🔥 {profile.contributions.current_streak}d
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Full card ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm ${className}`}>
        <div className="p-4 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-36 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
        <div className="h-16 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 animate-pulse" />
        <div className="p-4 space-y-2 border-t border-gray-100 dark:border-gray-700">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-center ${className}`}>
        <p className="text-sm text-gray-400">Gagal memuat profil pengguna</p>
      </div>
    );
  }

  const stats = [
    { label: "Selesai",  value: profile.stats.task_completed, emoji: "✅" },
    { label: "Dibuat",   value: profile.stats.task_created,   emoji: "📝" },
    { label: "Komentar", value: profile.stats.comments,       emoji: "💬" },
    { label: "Streak",   value: `${profile.contributions.current_streak}d`, emoji: "🔥" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm ${className}`}
    >
      {/* Banner gradient */}
      <div className={`h-14 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
      </div>

      {/* Avatar + Name */}
      <div className="px-4 pb-4 -mt-7 flex items-end gap-3">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white dark:border-gray-900 flex-shrink-0`}>
          {initials}
        </div>
        <div className="pb-1 min-w-0">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate">
            {profile.nm_pengguna}
          </h3>
          {role && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-gradient-to-r ${gradient} text-white`}>
              {ROLE_LABEL[role] ?? role}
            </span>
          )}
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-px bg-gray-100 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 py-3 text-center">
            <div className="text-base mb-0.5">{s.emoji}</div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mini heatmap */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Aktivitas 13 minggu terakhir
        </p>
        <ContributionHeatmap
          data={profile.contributions.data}
          year={currentYear}
          total={profile.contributions.total}
          streak={profile.contributions.current_streak}
          longestStreak={profile.contributions.longest_streak}
          compact
        />
      </div>

      {/* Projects */}
      {profile.projects.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Projects ({profile.projects.length})
          </p>
          <div className="space-y-2">
            {profile.projects.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{p.nm_project}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-7 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UserProfileCard;
