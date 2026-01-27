import { Card, CardBody } from "@heroui/react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <Card className={`text-white ${color}`}>
    <CardBody className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="w-8 h-8 opacity-80">{icon}</div>
      </div>
    </CardBody>
  </Card>
);
