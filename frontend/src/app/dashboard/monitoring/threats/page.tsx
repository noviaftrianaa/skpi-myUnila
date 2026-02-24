
"use client";

import React from "react";
import ThreatStatsCards from "./components/ThreatStatsCards";
import ThreatTable from "./components/ThreatTable";
import { Card, CardBody, Button } from "@heroui/react";
import { FiDownload } from "react-icons/fi";

export default function ThreatsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Ancaman</h1>
                    <p className="text-sm text-gray-500">
                        Daftar konten ilegal yang terdeteksi pada situs universitas.
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="flat"
                    radius="md"
                    startContent={<FiDownload />}
                    className="font-medium"
                >
                    Export Laporan
                </Button>
            </div>

            <ThreatStatsCards />

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold">Daftar Temuan</h3>
                    </div>
                    <ThreatTable />
                </CardBody>
            </Card>
        </div>
    );
}
