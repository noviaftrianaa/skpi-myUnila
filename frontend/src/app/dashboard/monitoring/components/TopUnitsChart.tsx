
"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiMapPin } from "react-icons/fi";
import { DrilldownBarChart } from "./charts";
import type { DrilldownData } from "./charts/DrilldownBarChart";

export default function TopUnitsChart() {
    const unitData: DrilldownData[] = [
        {
            id: "ft", name: "Fakultas Teknik", value: 12,
            children: [
                { id: "ft-ts", name: "Teknik Sipil", value: 4 },
                { id: "ft-te", name: "Teknik Elektro", value: 3 },
                { id: "ft-ti", name: "Teknik Informatika", value: 3 },
                { id: "ft-tm", name: "Teknik Mesin", value: 2 },
            ],
        },
        {
            id: "fkip", name: "FKIP", value: 8,
            children: [
                { id: "fkip-pbi", name: "Pend. Bahasa Inggris", value: 3 },
                { id: "fkip-pmat", name: "Pend. Matematika", value: 2 },
                { id: "fkip-pfis", name: "Pend. Fisika", value: 2 },
                { id: "fkip-pbio", name: "Pend. Biologi", value: 1 },
            ],
        },
        {
            id: "feb", name: "FEB", value: 5,
            children: [
                { id: "feb-mn", name: "Manajemen", value: 3 },
                { id: "feb-ak", name: "Akuntansi", value: 2 },
            ],
        },
        {
            id: "fisip", name: "FISIP", value: 4,
            children: [
                { id: "fisip-hi", name: "Hubungan Internasional", value: 2 },
                { id: "fisip-ip", name: "Ilmu Pemerintahan", value: 1 },
                { id: "fisip-ik", name: "Ilmu Komunikasi", value: 1 },
            ],
        },
        {
            id: "fmipa", name: "FMIPA", value: 3,
            children: [
                { id: "fmipa-mat", name: "Matematika", value: 1 },
                { id: "fmipa-fis", name: "Fisika", value: 1 },
                { id: "fmipa-kim", name: "Kimia", value: 1 },
            ],
        },
    ];

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Sebaran Temuan per Unit
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Klik fakultas untuk detail per program studi
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-2 sm:px-4 py-3 sm:py-4">
                <DrilldownBarChart
                    data={unitData}
                    title="Temuan per Unit"
                    color="#ef4444"
                    height={300}
                    horizontal={true}
                />
            </CardBody>
        </Card>
    );
}
