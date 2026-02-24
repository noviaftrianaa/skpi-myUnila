
"use client";

import React from "react";
import { Card, CardHeader, CardBody, Divider, Chip } from "@heroui/react";
import { FiClock, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { dummySessions } from "../../data";

export default function CrawlSessionList() {
    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
            <CardHeader className="flex justify-between items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold">Riwayat Pemindaian</h3>
            </CardHeader>
            <Divider className="hidden" />
            <CardBody className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {dummySessions.map((session) => (
                        <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">
                                    {session.status === "completed" && <FiCheckCircle className="text-green-500" />}
                                    {session.status === "running" && <FiLoader className="text-blue-500 animate-spin" />}
                                    {session.status === "failed" && <FiXCircle className="text-red-500" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{session.job_name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <FiClock className="w-3 h-3" />
                                        Mulai: {new Date(session.started_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium">
                                    {session.sites_scanned} situs, {session.pages_scanned} halaman
                                </div>
                                <div className="text-xs text-gray-500">
                                    {session.threats_found > 0 ? (
                                        <span className="text-red-500 font-bold">{session.threats_found} ancaman ditemukan</span>
                                    ) : (
                                        "Tidak ada ancaman"
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
