"use client";

import React, { useState, useEffect } from "react";
import { projectService, UserProfile } from "@/lib/services/project/projectService";
import { ContributionHeatmap } from "./ContributionHeatmap";

interface UserProfileCardProps {
  userId: string;
  role?: string;
  compact?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const GRADIENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

function getUserGradient(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

export function UserProfileCard({ userId, role, compact = false, className = "" }: UserProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    projectService
      .getUserProfile(userId)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 ${className}`}>
        <p className="text-sm text-gray-400">Gagal memuat profil</p>
      </div>
    );
  }

  const gradient = getUserGradient(userId);
  const initials = getInitials(profile.nm_pengguna);
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{profile.nm_pengguna}</p>
          {role && <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <span>✅ {profile.stats.task_completed}</span>
            <span>💬 {profile.stats.comments}</span>
            <span>🔥 {profile.contributions.current_streak}d</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
          {initials}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{profile.nm_pengguna}</h3>
          {role && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 capitalize">
              {role}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-gray-100 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700">
        {[
          { label: "Selesai", value: profile.stats.task_completed },
          { label: "Dibuat", value: profile.stats.task_created },
          { label: "Komentar", value: profile.stats.comments },
          { label: "Streak", value: `${profile.contributions.current_streak}d` },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-3 text-center">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mini Heatmap (last 3 months) */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aktivitas (3 bulan terakhir)</p>
        <ContributionHeatmap
          data={profile.contributions.data}
          year={currentYear}
          total={profile.contributions.total}
          streak={profile.contributions.current_streak}
          longestStreak={profile.contributions.longest_streak}
          compact
        />
      </div>
    </div>
  );
}

export default UserProfileCard;
