export default function StatCard({
  label,
  value,
  icon,
  watermark,
  bgGradient = "from-blue-600 via-blue-600 to-blue-500",
}) {
  return (
    <div
      className={`bg-gradient-to-r ${bgGradient} rounded-3xl p-6 sm:p-7 text-white shadow-xs relative overflow-hidden flex flex-col justify-between`}
    >
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider opacity-90 uppercase">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3">
        <div className="text-4xl sm:text-5xl font-extrabold">{value}</div>
      </div>
      {watermark}
    </div>
  );
}