import type { DosenStatsColor } from "./types";

// ========================================
// Types
// ========================================

interface DosenStatsCardProps {
  title: string;
  value: number;
  color: DosenStatsColor;
}

// ========================================
// Component
// ========================================

export const DosenStatsCard = ({ title, value, color }: DosenStatsCardProps) => {
  const colorClasses: Record<DosenStatsColor, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
    cyan: "bg-cyan-50 border-cyan-200",
    indigo: "bg-indigo-50 border-indigo-200",
    pink: "bg-pink-50 border-pink-200",
    orange: "bg-orange-50 border-orange-200",
    teal: "bg-teal-50 border-teal-200",
  };

  const iconColorClasses: Record<DosenStatsColor, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    red: "text-red-600",
    cyan: "text-cyan-600",
    indigo: "text-indigo-600",
    pink: "text-pink-600",
    orange: "text-orange-600",
    teal: "text-teal-600",
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl border-2 p-6`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${iconColorClasses[color]} mt-2`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
};
