"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Input,
} from "@heroui/react";
import {
  FiSearch,
  FiDatabase,
  FiCheckCircle,
  FiLink,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { keuanganClient } from "@/lib/api/keuanganClient";

interface ProdiMapping {
  id_mapping: string;
  id_prodi_simpedam: string;
  nama_prodi_simpedam: string;
  kode_strata: number;
  id_sms: string;
  nama_prodi_myunila: string;
  is_active: boolean;
}

export default function MappingProdiPage() {
  useRequireAuth();

  const [mappings, setMappings] = useState<ProdiMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      setIsLoading(true);
      const response = await keuanganClient.get("/daftar-ukt/mappings");
      if (response.data.success) {
        setMappings(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching mappings:", error);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrataLabel = (kodeStrata: number) => {
    switch (kodeStrata) {
      case 3:
        return { label: "D3", color: "primary" as const };
      case 4:
        return { label: "S1 Reguler", color: "success" as const };
      case 7:
        return { label: "S1 Non-Reg", color: "warning" as const };
      default:
        return { label: `Strata ${kodeStrata}`, color: "default" as const };
    }
  };

  const filteredMappings = mappings.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.nama_prodi_simpedam?.toLowerCase().includes(query) ||
      m.nama_prodi_myunila?.toLowerCase().includes(query)
    );
  });

  // Count by strata
  const strataCount = {
    d3: mappings.filter((m) => m.kode_strata === 3).length,
    s1Reguler: mappings.filter((m) => m.kode_strata === 4).length,
    s1NonReg: mappings.filter((m) => m.kode_strata === 7).length,
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Mapping Prodi"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Mapping Prodi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mapping program studi SIMPEDAM ke MyUnila (id_sms)
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-100">Total Mapping</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoading ? "-" : mappings.length}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-100">D3</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoading ? "-" : strataCount.d3}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-100">S1 Reguler</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoading ? "-" : strataCount.s1Reguler}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-100">S1 Non-Reguler</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoading ? "-" : strataCount.s1NonReg}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-none shadow-md">
          <CardBody className="p-4">
            <Input
              placeholder="Cari prodi..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
              classNames={{
                input: "text-sm",
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
              }}
            />
          </CardBody>
        </Card>

        {/* Table */}
        <Card className="border-none shadow-md">
          <CardBody className="p-0">
            <Table
              aria-label="Mapping Prodi Table"
              classNames={{
                wrapper: "min-h-[400px]",
                th: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
              }}
            >
              <TableHeader>
                <TableColumn>NO</TableColumn>
                <TableColumn>PRODI SIMPEDAM</TableColumn>
                <TableColumn>STRATA</TableColumn>
                <TableColumn>PRODI MYUNILA</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isLoading}
                loadingContent={<Spinner color="success" />}
                emptyContent={
                  <div className="py-12 text-center text-gray-500">
                    {searchQuery
                      ? "Tidak ada mapping yang cocok dengan pencarian"
                      : "Belum ada data mapping prodi. Jalankan SQL script keuangan_mapping_prodi_simpedam terlebih dahulu."}
                  </div>
                }
              >
                {filteredMappings.map((mapping, index) => {
                  const strata = getStrataLabel(mapping.kode_strata);
                  return (
                    <TableRow key={mapping.id_mapping}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {mapping.nama_prodi_simpedam}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {mapping.id_prodi_simpedam}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={strata.color} variant="flat">
                          {strata.label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {mapping.nama_prodi_myunila || "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {mapping.id_sms || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={mapping.is_active ? "success" : "danger"}
                          variant="flat"
                        >
                          {mapping.is_active ? "Aktif" : "Nonaktif"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 border border-gray-200 dark:border-gray-700">
          <CardBody className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Tentang Mapping Prodi
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Mapping menghubungkan ID Prodi SIMPEDAM dengan ID SMS MyUnila</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Data mapping digunakan saat sinkronisasi Daftar UKT dan SPP Mahasiswa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Jika mapping tidak ada, jalankan SQL script: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">keuangan_mapping_prodi_simpedam_01_create.sql</code> dan <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">keuangan_mapping_prodi_simpedam_02_insert.sql</code></span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
