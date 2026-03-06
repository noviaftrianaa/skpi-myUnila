import type { DosenStatsColor } from "./types";

// ========================================
// Types
// ========================================

interface DosenStatsCardProps {
  title: string;
  value: number;
  color?: DosenStatsColor;
  customColor?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

// ========================================
// Component
// ========================================

export const DosenStatsCard = ({
  title,
  value,
  color,
  customColor,
  onClick,
  isSelected = false
}: DosenStatsCardProps) => {
  // If customColor is provided, use inline styles instead of Tailwind classes
  if (customColor) {
    return (
      <div
        className="rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-md"
        style={{
          backgroundColor: `${customColor}15`, // 15 = low opacity
          borderColor: customColor,
          ...(isSelected ? { ring: '4px', ringColor: '#3b82f6' } : {})
        }}
        onClick={onClick}
      >
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p
          className="text-3xl font-bold mt-2"
          style={{ color: customColor }}
        >
          {value.toLocaleString()}
        </p>
      </div>
    );
  }

  // Fallback to predefined color classes if color is provided
  if (!color) {
    return null;
  }

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
    violet: "bg-violet-50 border-violet-200",
    fuchsia: "bg-fuchsia-50 border-fuchsia-200",
    rose: "bg-rose-50 border-rose-200",
    emerald: "bg-emerald-50 border-emerald-200",
    yellow: "bg-yellow-50 border-yellow-200",
    destructive: "bg-red-50 border-red-200",
    slate: "bg-slate-50 border-slate-200",
    gray: "bg-gray-50 border-gray-200",
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
    violet: "text-violet-600",
    fuchsia: "text-fuchsia-600",
    rose: "text-rose-600",
    emerald: "text-emerald-600",
    yellow: "text-yellow-600",
    destructive: "text-red-600",
    slate: "text-slate-600",
    gray: "text-gray-600",
  };

  return (
    <div
      className={`${colorClasses[color]} rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-4 ring-blue-400' : ''}`}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${iconColorClasses[color]} mt-2`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
};
