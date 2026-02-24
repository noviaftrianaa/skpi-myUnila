
"use client";

import React from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus, FiPlay } from "react-icons/fi";
import CrawlJobTable from "./components/CrawlJobTable";
import CrawlSessionList from "./components/CrawlSessionList";

export default function ScannerPage() {
    const [isManualScanOpen, setIsManualScanOpen] = React.useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pemindaian & Crawling</h1>
                    <p className="text-sm text-gray-500">
                        Atur jadwal crawling dan pantau proses pemindaian situs.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="secondary"
                        variant="flat"
                        radius="md"
                        startContent={<FiPlay />}
                        className="font-medium"
                        onPress={() => setIsManualScanOpen(true)}
                    >
                        Manual Scan
                    </Button>
                    <Button
                        color="primary"
                        variant="solid"
                        radius="md"
                        startContent={<FiPlus />}
                        className="font-medium shadow-sm"
                    >
                        Buat Job Baru
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full rounded-xl" radius="lg">
                        <CardBody className="p-0">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold">Daftar Job</h3>
                            </div>
                            <CrawlJobTable />
                        </CardBody>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <CrawlSessionList />
                </div>
            </div>

            {/* Mock Modal for Manual Scan */}
            {isManualScanOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                        <CardBody className="p-6 text-center space-y-4">
                            <h3 className="text-xl font-bold">Mulai Manual Scan</h3>
                            <p className="text-gray-500">Pilih situs untuk dipindai secara manual.</p>
                            <div className="flex justify-center gap-2 mt-4">
                                <Button variant="light" onPress={() => setIsManualScanOpen(false)}>Batal</Button>
                                <Button color="primary" onPress={() => setIsManualScanOpen(false)}>Mulai Scan</Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
