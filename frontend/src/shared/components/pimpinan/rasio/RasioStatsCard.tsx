import { FiUserPlus, FiUsers, FiBarChart2 } from "react-icons/fi";

interface RasioStatsCardProps {
  title: string;
  value: string | number;
  icon: "dosen" | "mahasiswa" | "rasio";
  color: "blue" | "green" | "purple";
}

const iconMap = {
  dosen: FiUserPlus,
  mahasiswa: FiUsers,
  rasio: FiBarChart2,
};

const colorClasses = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
};

export const RasioStatsCard = ({
  title,
  value,
  icon,
  color,
}: RasioStatsCardProps) => {
  const IconComponent = iconMap[icon];
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
          <IconComponent className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};
