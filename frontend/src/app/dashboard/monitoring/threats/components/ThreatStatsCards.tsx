
"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiFlag } from "react-icons/fi";

const stats = [
    { title: "Indikasi Baru", count: 12, icon: FiAlertCircle, color: "text-red-500", bg: "bg-red-100" },
    { title: "Terkonfirmasi", count: 8, icon: FiFlag, color: "text-orange-500", bg: "bg-orange-100" },
    { title: "Telah Ditangani", count: 145, icon: FiCheckCircle, color: "text-green-500", bg: "bg-green-100" },
    { title: "False Positive", count: 5, icon: FiXCircle, color: "text-gray-500", bg: "bg-gray-100" },
];

export default function ThreatStatsCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} shadow="sm">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</h4>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
