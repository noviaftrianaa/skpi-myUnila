"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { Card, CardBody, Button, Chip, Spinner } from "@heroui/react";
import { FiArrowLeft, FiBook, FiAward } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import dashboardService from "@/lib/services/public/dashboardService";
import type {
  FakultasSebaranData,
  ProdiSebaranData,
  SebaranStatistics,
} from "@/lib/types/dashboardTypes";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SebaranProgramStudi() {
  const [fakultasData, setFakultasData] = useState<FakultasSebaranData[]>([]);
  const [prodiData, setProdiData] = useState<ProdiSebaranData[]>([]);
  const [statistics, setStatistics] = useState<SebaranStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillLevel, setDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [selectedFakultas, setSelectedFakultas] = useState<{id: string, nama: string} | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Function to drill down into fakultas -> prodi
  const handleDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      setLoading(true);
      console.log('=== DRILL DOWN START ===');
      console.log('Drilling down to prodi for fakultas:', fakultasNama);
      console.log('Fakultas ID:', fakultasId);

      console.log('Calling dashboardService.getProdiByFakultas...');
      const response = await dashboardService.getProdiByFakultas(fakultasId);
      console.log('=== API Response received ===');
      console.log('Full response:', JSON.stringify(response, null, 2));
      console.log('response.success:', response.success);
      console.log('response.data:', response.data);

      if (response.success && response.data) {
        console.log('=== Data is valid ===');
        console.log('Prodi data received:', response.data);
        console.log('Number of prodi:', response.data.length);
        console.log('Setting prodiData state...');
        setProdiData(response.data);
        console.log('Setting selectedFakultas state...');
        setSelectedFakultas({ id: fakultasId, nama: fakultasNama });
        console.log('Setting drillLevel to prodi...');
        setDrillLevel('prodi');
        console.log('=== State updates complete ===');
      } else {
        console.error('=== Invalid response or no data ===');
        console.error('response.success:', response.success);
        console.error('response.data:', response.data);
      }
    } catch (err) {
      console.error('=== ERROR CAUGHT ===');
      console.error('Error drilling down:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
    } finally {
      console.log('=== Setting loading to false ===');
      setLoading(false);
      console.log('=== DRILL DOWN END ===');
    }
  };

  // Function to drill up back to fakultas
  const handleDrillUp = () => {
    setDrillLevel('fakultas');
    setSelectedFakultas(null);
    setProdiData([]);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch fakultas data with jenjang breakdown using dashboardService
        const response = await dashboardService.getSebaranFakultas();

        if (response.success) {
          setFakultasData(response.data.fakultas);
          setStatistics(response.data.statistics);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options for fakultas level (stacked bar chart by jenjang)
  const fakultasChartOptions = useMemo(() => {
    if (fakultasData.length === 0) return null;

    // Prepare data for stacked bar chart
    const fakultasNames = fakultasData.map(f => f.nama);

    // Get all unique jenjang from all fakultas, sorted by priority
    const jenjangPriority: Record<string, number> = {
      'D3': 1, 'D4': 2, 'S1': 3, 'S1 Terapan': 4, 'Profesi': 5, 'S2': 6, 'S2 Terapan': 7, 'S3': 8
    };
    const allJenjangSet = new Set<string>();
    fakultasData.forEach(f => {
      f.jenjang_counts.forEach(j => allJenjangSet.add(j.jenjang));
    });
    const jenjangTypes = Array.from(allJenjangSet).sort((a, b) => {
      return (jenjangPriority[a] || 99) - (jenjangPriority[b] || 99);
    });

    const colorMap: Record<string, string> = {
      'D3': '#3b82f6', 'D4': '#2563eb', 'S1': '#10b981', 'S1 Terapan': '#059669',
      'Profesi': '#8b5cf6', 'S2': '#f59e0b', 'S2 Terapan': '#d97706', 'S3': '#ef4444'
    };

    const series = jenjangTypes.map(jenjang => ({
      name: jenjang,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      itemStyle: { color: colorMap[jenjang] || '#6b7280' },
      data: fakultasData.map(fakultas => {
        const jenjangData = fakultas.jenjang_counts.find(j => j.jenjang === jenjang);
        return jenjangData ? jenjangData.jumlah : 0;
      }),
    }));

    return {
      title: {
        text: 'Sebaran Program Studi per Fakultas',
        subtext: 'Berdasarkan Jenjang Pendidikan',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          let tooltipText = `<strong>${params[0].axisValue}</strong><br/>`;
          let total = 0;
          params.forEach((param: any) => {
            if (param.value > 0) {
              tooltipText += `${param.marker} ${param.seriesName}: <strong>${param.value}</strong> prodi<br/>`;
              total += param.value;
            }
          });
          tooltipText += `<hr style="margin: 4px 0"/>Total: <strong>${total}</strong> prodi<br/>`;
          tooltipText += `<em style="font-size: 11px; color: #888;">Klik untuk lihat detail prodi</em>`;
          return tooltipText;
        },
      },
      legend: {
        data: jenjangTypes,
        top: 40,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 100,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: fakultasNames,
        axisLabel: {
          interval: 0,
          fontSize: 11,
          formatter: (value: string) => {
            // Truncate long names
            return value.length > 25 ? value.substring(0, 25) + '...' : value;
          },
        },
      },
      series: series,
    };
  }, [fakultasData]);

  // Chart options for prodi level (horizontal bar chart with all prodi listed)
  const prodiChartOptions = useMemo(() => {
    console.log('prodiChartOptions useMemo triggered');
    console.log('prodiData:', prodiData);
    console.log('prodiData.length:', prodiData.length);

    if (prodiData.length === 0) {
      console.log('Returning null - no prodi data');
      return null;
    }

    console.log('=== Creating chart options ===');

    // Sort prodi by jenjang priority
    const jenjangPriority: Record<string, number> = {
      'D3': 1, 'D4': 2, 'S1': 3, 'S1 Terapan': 4, 'Profesi': 5, 'S2': 6, 'S2 Terapan': 7, 'S3': 8
    };
    console.log('Sorting prodi...');
    const sortedProdi = [...prodiData].sort((a, b) => {
      return (jenjangPriority[a.jenjang] || 99) - (jenjangPriority[b.jenjang] || 99);
    });
    console.log('Sorted prodi:', sortedProdi.length);

    const colorMap: Record<string, string> = {
      'D3': '#3b82f6', 'D4': '#2563eb', 'S1': '#10b981', 'S1 Terapan': '#059669',
      'Profesi': '#8b5cf6', 'S2': '#f59e0b', 'S2 Terapan': '#d97706', 'S3': '#ef4444'
    };

    console.log('Building chart config...');

    const chartConfig = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const prodi = sortedProdi[item.dataIndex];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${prodi.nama}</div>
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">Jenjang: <strong>${prodi.jenjang}</strong></div>
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 2px;">Kode Prodi: <strong>${prodi.kode_prodi}</strong></div>
            <div style="color: #6b7280; font-size: 11px;">Akreditasi: <strong>${prodi.akreditasi || 'Belum Akreditasi'}</strong></div>
          </div>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#10b981',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      dataZoom: sortedProdi.length > 15 ? [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: Math.min(100, (15 / sortedProdi.length) * 100),
          right: '1%',
          width: 15,
          borderColor: '#10b981',
          fillerColor: 'rgba(16, 185, 129, 0.15)',
          handleStyle: {
            color: '#10b981',
            borderColor: '#10b981',
          },
          textStyle: {
            color: '#6b7280',
            fontSize: 10,
          },
          moveHandleSize: 5,
          showDataShadow: false,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: Math.min(100, (15 / sortedProdi.length) * 100),
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
        }
      ] : [],
      xAxis: {
        type: 'value',
        show: false,
        max: 100,
      },
      yAxis: {
        type: 'category',
        data: sortedProdi.map(p => p.nama),
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 500,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          type: 'bar',
          data: sortedProdi.map((prodi, index) => ({
            value: 100,
            jenjang: prodi.jenjang,
            akreditasi: prodi.akreditasi,
            itemStyle: {
              color: colorMap[prodi.jenjang] || '#10b981',
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const prodi = sortedProdi[params.dataIndex];
              return `${prodi.jenjang} - ${prodi.akreditasi || 'Belum Akreditasi'}`;
            },
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 600,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
        }
      ],
    };

    console.log('=== Chart options created successfully ===');
    console.log('Returning chart options');
    return chartConfig;
  }, [prodiData, selectedFakultas]);

  // Handle chart click event
 const onChartClick = (params: any) => {
    // TEMPORARY DISABLED - Backend API not deployed yet
    console.log('Drilldown temporarily disabled');
    return;
  };

  const chartEvents = {
    click: onChartClick,
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <motion.div
        className="container mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <MdSchool className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sebaran Program Studi
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Klik pada bar chart untuk melihat detail program studi per fakultas
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" label="Memuat data..." />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Column */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    background: 'black',
                    color: 'white',
                    padding: '10px',
                    zIndex: 99998,
                    fontSize: '14px'
                  }}>
                    DrillLevel: {drillLevel}<br/>
                    Loading: {loading ? 'true' : 'false'}<br/>
                    ProdiOptions: {prodiChartOptions ? 'EXISTS' : 'NULL'}
                  </div>

                  {/* Back Button for Drilldown */}
                  {drillLevel === 'prodi' && (
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<FiArrowLeft />}
                      onClick={handleDrillUp}
                      className="mb-4"
                    >
                      Kembali ke Fakultas
                    </Button>
                  )}

                  {/* Chart */}
                  {drillLevel === 'fakultas' && fakultasChartOptions && (
                    <ReactECharts
                      option={fakultasChartOptions}
                      style={{ height: '600px' }}
                      onEvents={chartEvents}
                    />
                  )}

                  {drillLevel === 'prodi' && (
                    <div style={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'yellow',
                      padding: '40px',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: 'black',
                      border: '10px solid red',
                      zIndex: 99999,
                      boxShadow: '0 0 50px rgba(0,0,0,0.8)'
                    }}>
                      PRODI MODE ACTIVE!!! <br/>
                      prodiChartOptions: {prodiChartOptions ? 'EXISTS' : 'NULL'}<br/>
                      drillLevel: {drillLevel}
                    </div>
                  )}

                  {drillLevel === 'prodi' && prodiChartOptions && (
                    <div style={{
                      minHeight: '600px',
                      width: '100%',
                      border: '2px solid red',
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      marginTop: '10px'
                    }}>
                      <div style={{
                        border: '2px solid blue',
                        backgroundColor: 'white',
                        height: '580px',
                        width: '100%'
                      }}>
                        <ReactECharts
                          option={prodiChartOptions}
                          style={{ height: '100%', width: '100%' }}
                          opts={{ renderer: 'canvas' }}
                        />
                      </div>
                    </div>
                  )}

                  {drillLevel === 'prodi' && !prodiChartOptions && (
                    <div className="flex flex-col justify-center items-center py-20">
                      <p className="text-gray-500">Debug: prodiChartOptions is null</p>
                      <p className="text-gray-500">prodiData length: {prodiData.length}</p>
                      <p className="text-gray-500">selectedFakultas: {selectedFakultas?.nama}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Statistics Column */}
            <motion.div className="space-y-4" variants={itemVariants}>
              {/* Statistics Card */}
              <Card className="shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                <CardBody className="p-6 text-white">
                  <div className="flex items-center mb-4">
                    <FiBook className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold">Statistik Program Studi</h3>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-sm opacity-90 mb-1">Universitas Lampung</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statistics?.total_prodi || 0}</div>
                      <div className="text-sm opacity-90">Total Program Studi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statistics?.total_fakultas || 0}</div>
                      <div className="text-sm opacity-90">Total Fakultas</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Per Jenjang Cards */}
              <Card className="shadow-lg border-2 border-blue-500 dark:border-blue-400">
                <CardBody className="p-6">
                  <div className="flex items-center mb-4">
                    <FiAward className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Per Jenjang
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* D3 */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Diploma 3 (D3)
                        </span>
                      </div>
                      <Chip color="primary" variant="flat" size="sm">
                        {statistics?.total_d3 || 0}
                      </Chip>
                    </div>

                    {/* S1 */}
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sarjana (S1)
                        </span>
                      </div>
                      <Chip color="success" variant="flat" size="sm">
                        {statistics?.total_s1 || 0}
                      </Chip>
                    </div>

                    {/* S2 */}
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Magister (S2)
                        </span>
                      </div>
                      <Chip color="warning" variant="flat" size="sm">
                        {statistics?.total_s2 || 0}
                      </Chip>
                    </div>

                    {/* S3 */}
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Doktor (S3)
                        </span>
                      </div>
                      <Chip color="danger" variant="flat" size="sm">
                        {statistics?.total_s3 || 0}
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
