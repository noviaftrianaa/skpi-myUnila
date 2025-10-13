"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function StatistikAkademik() {
  const [selectedSemester, setSelectedSemester] = useState("Genap 2024");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data Lulusan & IPK per Tahun
  const lulusanData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    jumlah: [1450, 1580, 1720, 1850, 1975],
    avgIPK: [3.42, 3.45, 3.47, 3.49, 3.48],
  };

  // Data Mata Kuliah
  const mataKuliahData = {
    total: 1248,
    wajib: 856,
    pilihan: 392,
    totalKelas: 2456,
  };

  // Data Distribusi Nilai per Prodi (Sample untuk beberapa prodi)
  const distribusiNilaiData = [
    {
      prodi: "Teknik Sipil",
      A: 1245,
      B: 2156,
      C: 845,
      D: 234,
      E: 67,
      belumDinilai: 156,
    },
    {
      prodi: "Ilmu Komputer",
      A: 1456,
      B: 2345,
      C: 912,
      D: 267,
      E: 78,
      belumDinilai: 189,
    },
    {
      prodi: "Manajemen",
      A: 1678,
      B: 2678,
      C: 1023,
      D: 312,
      E: 89,
      belumDinilai: 223,
    },
    {
      prodi: "Pendidikan Matematika",
      A: 945,
      B: 1678,
      C: 678,
      D: 189,
      E: 45,
      belumDinilai: 124,
    },
    {
      prodi: "Agribisnis",
      A: 856,
      B: 1456,
      C: 589,
      D: 167,
      E: 38,
      belumDinilai: 112,
    },
  ];

  const semesterOptions = ["Genap 2024", "Ganjil 2024", "Genap 2023", "Ganjil 2023"];

  // Chart Lulusan & IPK
  const lulusanChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Jumlah Lulusan", "Rata-rata IPK"],
      bottom: "0%",
      textStyle: {
        fontSize: 11,
        fontWeight: 600,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: lulusanData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Jumlah",
        position: "left",
        axisLabel: {
          color: "#6b7280",
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
            type: "dashed",
          },
        },
      },
      {
        type: "value",
        name: "IPK",
        position: "right",
        min: 3.0,
        max: 4.0,
        axisLabel: {
          color: "#6b7280",
          fontSize: 11,
          formatter: "{value}",
        },
      },
    ],
    series: [
      {
        name: "Jumlah Lulusan",
        type: "bar",
        data: lulusanData.jumlah,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#60a5fa" },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 700,
        },
      },
      {
        name: "Rata-rata IPK",
        type: "line",
        yAxisIndex: 1,
        data: lulusanData.avgIPK,
        smooth: true,
        symbolSize: 10,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#10b981",
          fontSize: 11,
          fontWeight: 700,
        },
      },
    ],
  }), []);

  // Chart Distribusi Nilai
  const distribusiNilaiChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["A", "B", "C", "D", "E", "Belum Dinilai"],
      bottom: "0%",
      textStyle: {
        fontSize: 10,
        fontWeight: 600,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: distribusiNilaiData.map(item => item.prodi),
      axisLabel: {
        color: "#1f2937",
        fontSize: 9,
        fontWeight: 600,
        interval: 0,
        rotate: 15,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "A",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.A),
        itemStyle: { color: "#10b981" },
      },
      {
        name: "B",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.B),
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "C",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.C),
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "D",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.D),
        itemStyle: { color: "#ef4444" },
      },
      {
        name: "E",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.E),
        itemStyle: { color: "#991b1b" },
      },
      {
        name: "Belum Dinilai",
        type: "bar",
        stack: "total",
        data: distribusiNilaiData.map(item => item.belumDinilai),
        itemStyle: { color: "#9ca3af" },
      },
    ],
  }), []);

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Semester Filter */}
          <motion.div variants={itemVariants} className="flex justify-end mb-8">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {semesterOptions.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Lulusan & IPK */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Total Lulusan & Rata-rata IPK
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Total Lulusan 2024</div>
                    <div className="text-3xl font-bold text-blue-600">1,975</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Rata-rata IPK</div>
                    <div className="text-3xl font-bold text-emerald-600">3.48</div>
                  </div>
                </div>
                <div className="h-[320px]">
                  <ReactECharts
                    option={lulusanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Mata Kuliah & Kelas */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Mata Kuliah & Kelas
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">📚</div>
                      <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        Total
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">{mataKuliahData.total.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-gray-600">Mata Kuliah</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">🏫</div>
                      <div className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                        {selectedSemester}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{mataKuliahData.totalKelas.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-gray-600">Kelas Kuliah</div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        W
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Mata Kuliah Wajib</div>
                        <div className="text-xs text-gray-600">Kurikulum inti program studi</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{mataKuliahData.wajib}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        P
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Mata Kuliah Pilihan</div>
                        <div className="text-xs text-gray-600">Pengayaan kompetensi mahasiswa</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{mataKuliahData.pilihan}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                    <span>Persentase</span>
                    <span>{((mataKuliahData.wajib / mataKuliahData.total) * 100).toFixed(1)}% Wajib</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${(mataKuliahData.wajib / mataKuliahData.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Distribusi Nilai */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-blue-600">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Distribusi Nilai per Program Studi ({selectedSemester})
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <ReactECharts
                  option={distribusiNilaiChartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>

              {/* Summary Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Program Studi</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider">A</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">B</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-amber-600 uppercase tracking-wider">C</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider">D</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-red-900 uppercase tracking-wider">E</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Belum Dinilai</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distribusiNilaiData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.prodi}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-emerald-600">{item.A.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">{item.B.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-amber-600">{item.C.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-red-600">{item.D.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-red-900">{item.E.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-gray-600">{item.belumDinilai.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
