"use client";

import type { PersetujuanPengajuan } from "@/lib/services/sim-bak/types";
import { FiCheck, FiX, FiClock } from "react-icons/fi";

interface ApprovalTimelineProps {
  approvals: PersetujuanPengajuan[];
}

export default function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  const sorted = [...approvals].sort((a, b) => a.urutan - b.urutan);
  const firstPendingIdx = sorted.findIndex((a) => a.status === "menunggu");

  return (
    <div className="relative">
      {sorted.map((approval, idx) => {
        const isCompleted = approval.status === "disetujui";
        const isRejected = approval.status === "ditolak";
        const isCurrent = idx === firstPendingIdx;
        const isPending = approval.status === "menunggu" && !isCurrent;
        const isLast = idx === sorted.length - 1;

        let circleClass = "bg-gray-200 dark:bg-gray-700 text-gray-400";
        let lineClass = "border-l-2 border-dashed border-gray-300 dark:border-gray-600";
        let icon = <FiClock className="w-4 h-4" />;

        if (isCompleted) {
          circleClass = "bg-green-500 text-white";
          lineClass = "border-l-2 border-solid border-green-500";
          icon = <FiCheck className="w-4 h-4" />;
        } else if (isRejected) {
          circleClass = "bg-red-500 text-white";
          lineClass = "border-l-2 border-solid border-red-500";
          icon = <FiX className="w-4 h-4" />;
        } else if (isCurrent) {
          circleClass = "bg-blue-500 text-white animate-pulse";
          lineClass = "border-l-2 border-dashed border-blue-300 dark:border-blue-600";
          icon = <FiClock className="w-4 h-4" />;
        }

        return (
          <div key={approval.id_persetujuan} className="relative flex gap-4">
            {/* Line */}
            {!isLast && (
              <div className={`absolute left-[17px] top-[36px] bottom-0 ${lineClass}`} />
            )}

            {/* Circle */}
            <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${circleClass}`}>
              {icon}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{approval.role_penyetuju}</span>
                {isCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Disetujui</span>
                )}
                {isRejected && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Ditolak</span>
                )}
                {isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Menunggu</span>
                )}
                {isPending && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Belum</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {approval.nm_penyetuju || "Menunggu..."}
              </p>
              {approval.tgl_respon && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {new Date(approval.tgl_respon).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              {approval.catatan && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                  &ldquo;{approval.catatan}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
