export default function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EEF2F7]">
      <p className="text-[#94A3B8] text-[14px]">{title}</p>
      <h1 className="text-[32px] font-bold mt-2" style={{ color }}>
        {value}
      </h1>
    </div>
  );
}