"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiExternalLink,
  FiActivity,
  FiServer,
  FiDatabase,
} from "react-icons/fi";
import {
  HiChartBar,
  HiDocumentText,
} from "react-icons/hi";
import { SiGrafana, SiPrometheus } from "react-icons/si";
import { MdCheckCircle, MdSpeed } from "react-icons/md";

interface MonitoringTool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  category: "visualization" | "metrics" | "logs" | "container";
  features: string[];
}

const monitoringTools: MonitoringTool[] = [
  {
    id: "grafana",
    name: "Grafana",
    description: "Visualization & Dashboards",
    url: "http://localhost:3002",
    icon: <SiGrafana className="w-8 h-8" />,
    color: "from-orange-500 to-orange-600",
    category: "visualization",
    features: [
      "Real-time dashboards",
      "Custom visualizations",
      "Alert management",
      "Multi-datasource support",
    ],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description: "Metrics Database & Time-Series",
    url: "http://localhost:9090",
    icon: <SiPrometheus className="w-8 h-8" />,
    color: "from-red-500 to-red-600",
    category: "metrics",
    features: [
      "Time-series database",
      "PromQL query language",
      "Service discovery",
      "Alerting rules",
    ],
  },
  {
    id: "loki",
    name: "Loki",
    description: "Log Aggregation System",
    url: "http://localhost:3100",
    icon: <HiDocumentText className="w-8 h-8" />,
    color: "from-green-500 to-green-600",
    category: "logs",
    features: [
      "Log storage & indexing",
      "LogQL query language",
      "Label-based filtering",
      "31-day retention",
    ],
  },
  {
    id: "promtail",
    name: "Promtail",
    description: "Log Shipper Agent",
    url: "#", // Internal service, no UI
    icon: <FiDatabase className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    category: "logs",
    features: [
      "Docker log collection",
      "15 containers monitored",
      "Auto-discovery",
      "Label extraction",
    ],
  },
  {
    id: "cadvisor",
    name: "cAdvisor",
    description: "Container Metrics Exporter",
    url: "http://localhost:8090",
    icon: <FiServer className="w-8 h-8" />,
    color: "from-indigo-500 to-indigo-600",
    category: "container",
    features: [
      "Container resource usage",
      "Memory & CPU metrics",
      "Network statistics",
      "Per-container monitoring",
    ],
  },
  {
    id: "node-exporter",
    name: "Node Exporter",
    description: "System Metrics Exporter",
    url: "http://localhost:9100/metrics",
    icon: <MdSpeed className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    category: "metrics",
    features: [
      "Host system metrics",
      "CPU, Memory, Disk stats",
      "Network interfaces",
      "1500+ metrics exposed",
    ],
  },
];

const grafanaDashboards = [
  {
    id: "myunila-logs",
    name: "MyUnila - Application Logs",
    description: "View all application logs in one dashboard",
    url: "http://localhost:3002/d/myunila-logs",
  },
  {
    id: "system-overview",
    name: "System Overview",
    description: "CPU, Memory, Disk, Network metrics",
    url: "http://localhost:3002/dashboards",
  },
  {
    id: "container-metrics",
    name: "Container Metrics",
    description: "Docker container resource usage",
    url: "http://localhost:3002/dashboards",
  },
];

export default function MonitoringPage() {
  const { user, isLoading: authLoading } = useRequireAuth({
    requiredRole: "Developer",
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tools");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Monitoring...</p>
        </div>
      </div>
    );
  }

  const visualizationTools = monitoringTools.filter(
    (t) => t.category === "visualization"
  );
  const metricsTools = monitoringTools.filter(
    (t) => t.category === "metrics"
  );
  const logsTools = monitoringTools.filter((t) => t.category === "logs");
  const containerTools = monitoringTools.filter(
    (t) => t.category === "container"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 via-orange-800 to-orange-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                startContent={<FiArrowLeft />}
                variant="light"
                onPress={() => router.push("/portal")}
                className="text-white hover:bg-white/10"
              >
                Portal
              </Button>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <HiChartBar className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Monitoring & Observability
                  </h1>
                  <p className="text-orange-100 text-sm">
                    Grafana, Prometheus, Loki & More
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                startContent={<MdCheckCircle className="w-4 h-4" />}
                className="bg-green-500/20 text-green-200 border border-green-500/30"
              >
                All Systems Operational
              </Chip>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-orange-200 text-xs uppercase mb-1">
                Monitoring Tools
              </p>
              <p className="text-white font-semibold text-lg">
                {monitoringTools.length} Active
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-orange-200 text-xs uppercase mb-1">
                Containers Monitored
              </p>
              <p className="text-white font-semibold text-lg">15 Running</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-orange-200 text-xs uppercase mb-1">
                Log Retention
              </p>
              <p className="text-white font-semibold text-lg">31 Days</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-orange-200 text-xs uppercase mb-1">
                Metrics Collected
              </p>
              <p className="text-white font-semibold text-lg">2000+ Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-6 border-b border-divider bg-white shadow-sm mb-8",
            cursor: "w-full bg-orange-600",
            tab: "max-w-fit px-4 h-12",
            tabContent:
              "group-data-[selected=true]:text-orange-600 font-semibold",
          }}
        >
          <Tab
            key="tools"
            title={
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5" />
                <span>Monitoring Tools</span>
              </div>
            }
          >
            {/* Visualization Tools */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Visualization & Dashboards
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {visualizationTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`bg-gradient-to-br ${tool.color} p-4 rounded-2xl shadow-lg`}
                            >
                              {tool.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-gray-800">
                                  {tool.name}
                                </h4>
                                <Chip
                                  size="sm"
                                  className="bg-green-100 text-green-700"
                                >
                                  Active
                                </Chip>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {tool.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {tool.features.map((feature) => (
                                  <Chip
                                    key={feature}
                                    size="sm"
                                    className="bg-gray-100 text-gray-700"
                                  >
                                    {feature}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            as="a"
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            endContent={<FiExternalLink className="w-4 h-4" />}
                            className={`bg-gradient-to-r ${tool.color} text-white hover:opacity-90`}
                          >
                            Open {tool.name}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Metrics Tools */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Metrics Collection & Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metricsTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all h-full">
                      <CardBody className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`bg-gradient-to-br ${tool.color} p-3 rounded-xl shadow-lg`}
                            >
                              {tool.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">
                                {tool.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tool.features.map((feature) => (
                              <Chip
                                key={feature}
                                size="sm"
                                className="bg-gray-50 text-gray-600 text-xs"
                              >
                                {feature}
                              </Chip>
                            ))}
                          </div>
                          <Button
                            as="a"
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            endContent={<FiExternalLink className="w-4 h-4" />}
                            variant="flat"
                            className={`bg-gradient-to-r ${tool.color} text-white hover:opacity-90 mt-auto`}
                            size="sm"
                          >
                            Open {tool.name}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Logs Tools */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Log Aggregation & Collection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logsTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all h-full">
                      <CardBody className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`bg-gradient-to-br ${tool.color} p-3 rounded-xl shadow-lg`}
                            >
                              {tool.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">
                                {tool.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tool.features.map((feature) => (
                              <Chip
                                key={feature}
                                size="sm"
                                className="bg-gray-50 text-gray-600 text-xs"
                              >
                                {feature}
                              </Chip>
                            ))}
                          </div>
                          {tool.url !== "#" ? (
                            <Button
                              as="a"
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              endContent={
                                <FiExternalLink className="w-4 h-4" />
                              }
                              variant="flat"
                              className={`bg-gradient-to-r ${tool.color} text-white hover:opacity-90 mt-auto`}
                              size="sm"
                            >
                              Open {tool.name}
                            </Button>
                          ) : (
                            <Chip
                              size="sm"
                              className="bg-blue-50 text-blue-700 mt-auto w-fit"
                            >
                              Internal Service (No UI)
                            </Chip>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Container Monitoring */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Container Monitoring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {containerTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all h-full">
                      <CardBody className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`bg-gradient-to-br ${tool.color} p-3 rounded-xl shadow-lg`}
                            >
                              {tool.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">
                                {tool.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tool.features.map((feature) => (
                              <Chip
                                key={feature}
                                size="sm"
                                className="bg-gray-50 text-gray-600 text-xs"
                              >
                                {feature}
                              </Chip>
                            ))}
                          </div>
                          <Button
                            as="a"
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            endContent={<FiExternalLink className="w-4 h-4" />}
                            variant="flat"
                            className={`bg-gradient-to-r ${tool.color} text-white hover:opacity-90 mt-auto`}
                            size="sm"
                          >
                            Open {tool.name}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Tab>

          <Tab
            key="dashboards"
            title={
              <div className="flex items-center gap-2">
                <HiChartBar className="w-5 h-5" />
                <span>Grafana Dashboards</span>
              </div>
            }
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Pre-configured Dashboards
              </h3>
              <p className="text-gray-600">
                Quick access to monitoring dashboards in Grafana
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grafanaDashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md hover:shadow-xl transition-all cursor-pointer h-full">
                    <CardBody className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-orange-600 p-3 rounded-xl">
                          <HiChartBar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">
                            {dashboard.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dashboard.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        as="a"
                        href={dashboard.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endContent={<FiExternalLink className="w-4 h-4" />}
                        className="w-full bg-orange-600 text-white hover:bg-orange-700"
                        size="sm"
                      >
                        Open Dashboard
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-lg mt-1">
                  <HiChartBar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Creating Custom Dashboards
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    You can create custom dashboards in Grafana by:
                  </p>
                  <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
                    <li>Open Grafana → Click "Dashboards" → "New Dashboard"</li>
                    <li>Add panels with queries from Prometheus, Loki</li>
                    <li>Save dashboard to MyUnila folder</li>
                    <li>Share dashboard URL with team</li>
                  </ol>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
