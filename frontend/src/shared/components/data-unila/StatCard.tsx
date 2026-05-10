"use client";
import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  /** Tailwind gradient classes — e.g. "from-blue-500 to-indigo-600" */
  color: string;
  /** Optional sub-label (small text below value) */
  sublabel?: string;
}

/**
 * Reusable Stat Card untuk halaman Data Unila.
 * Pattern konsisten: gradient bg + icon bulat + label + angka besar.
 */
export default function StatCard({ icon, label, value, color, sublabel }: StatCardProps) {
  const display =
    typeof value === "number"
      ? value.toLocaleString("id-ID")
      : (parseInt(String(value || "0"), 10) || 0).toLocaleString("id-ID");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
        <CardBody className="p-4 relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide truncate">{label}</p>
              <h3 className="text-2xl font-bold text-white">{display}</h3>
              {sublabel && <p className="text-[10px] font-medium text-white/70 mt-0.5 truncate">{sublabel}</p>}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
