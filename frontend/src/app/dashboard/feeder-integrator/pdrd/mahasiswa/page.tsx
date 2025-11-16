"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";
import {
  Card,
  CardBody,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Spinner
} from "@heroui/react";
import { RiGraduationCapFill } from "react-icons/ri";
import { FiSearch, FiRefreshCw, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";

interface Mahasiswa {
  id_pd: string;
  nama_pd: string;
  nipd: string;
  jenis_kelamin: string;
  angkatan: string;
  nama_prodi: string;
  nama_status: string;
  semester_sekarang: number;
  last_sync: string;
}

interface AngkatanOption {
  value: string;
  label: string;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
}

export default function MahasiswaPage() {
  useRequireAuth();

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [angkatanOptions, setAngkatanOptions] = useState<AngkatanOption[]>([]);
  const [prodiOptions, setProdiOptions] = useState<ProdiOption[]>([]);

  const [selectedAngkatan, setSelectedAngkatan] = useState<string[]>(["2024"]);
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FEEDER_API_URL || "http://localhost:8084/api/v1";

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load mahasiswa list when filters change
  useEffect(() => {
    if (selectedAngkatan.length > 0) {
      loadMahasiswaList();
    }
  }, [selectedAngkatan, selectedProdi, searchQuery, page]);

  const loadFilterOptions = async () => {
    setIsLoadingFilters(true);
    try {
      // Load angkatan list
      const angkatanRes = await fetch(`${API_BASE_URL}/mahasiswa/helper/angkatan`);
      const angkatanData = await angkatanRes.json();

      if (angkatanData.success) {
        const options = angkatanData.data.map((year: string) => ({
          value: year,
          label: `Angkatan ${year}`
        }));
        setAngkatanOptions(options);
      }

      // Load prodi list
      const prodiRes = await fetch(`${API_BASE_URL}/mahasiswa/helper/prodi`);
      const prodiData = await prodiRes.json();

      if (prodiData.success) {
        setProdiOptions(prodiData.data);
      }
    } catch (error) {
      console.error("Failed to load filter options:", error);
      toast.error("Gagal memuat filter");
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const loadMahasiswaList = async () => {
    if (selectedAngkatan.length === 0) {
      toast.error("Pilih minimal 1 angkatan");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        angkatan: selectedAngkatan.join(","),
        page: page.toString(),
        limit: limit.toString(),
      });

      if (selectedProdi) params.append("id_prodi", selectedProdi);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`${API_BASE_URL}/mahasiswa?${params}`);
      const data = await response.json();

      if (data.success) {
        setMahasiswaList(data.data.items || []);
        setTotalPages(data.data.total_pages || 1);
        setTotalItems(data.data.total_items || 0);
      } else {
        toast.error(data.message || "Gagal memuat data mahasiswa");
        setMahasiswaList([]);
      }
    } catch (error) {
      console.error("Failed to load mahasiswa:", error);
      toast.error("Gagal memuat data mahasiswa");
      setMahasiswaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadMahasiswaList();
  };

  const handleReset = () => {
    setSelectedAngkatan(["2024"]);
    setSelectedProdi("");
    setSearchQuery("");
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("aktif")) return "success";
    if (statusLower.includes("lulus")) return "primary";
    if (statusLower.includes("cuti")) return "warning";
    if (statusLower.includes("keluar") || statusLower.includes("do")) return "danger";
    return "default";
  };

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Data Mahasiswa"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 text-white">
              <RiGraduationCapFill className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">Data Mahasiswa</h1>
                <p className="text-blue-100">Kelola data mahasiswa dari Neo Feeder PDDIKTI</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filter Data</h3>
            </div>

            {isLoadingFilters ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Angkatan Filter (REQUIRED) */}
                <Select
                  label="Angkatan"
                  placeholder="Pilih angkatan"
                  selectionMode="multiple"
                  selectedKeys={selectedAngkatan}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys) as string[];
                    setSelectedAngkatan(selected);
                    setPage(1);
                  }}
                  isRequired
                  description="Wajib pilih minimal 1 angkatan"
                >
                  {angkatanOptions.map((option) => (
                    <SelectItem key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Prodi Filter (Optional) */}
                <Select
                  label="Program Studi"
                  placeholder="Semua Prodi"
                  selectedKeys={selectedProdi ? [selectedProdi] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedProdi(selected || "");
                    setPage(1);
                  }}
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem
                      key={prodi.id_sms}
                      textValue={`${prodi.kode_prodi} - ${prodi.nama_prodi}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{prodi.nama_prodi}</span>
                        <span className="text-xs text-gray-500">{prodi.kode_prodi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                {/* Search */}
                <Input
                  label="Cari"
                  placeholder="Cari nama atau NPM..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  startContent={<FiSearch className="text-gray-400" />}
                />
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                color="primary"
                startContent={<FiSearch />}
                onClick={handleSearch}
                isLoading={isLoading}
                isDisabled={selectedAngkatan.length === 0}
              >
                Cari
              </Button>
              <Button
                variant="bordered"
                startContent={<FiRefreshCw />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Daftar Mahasiswa
                {totalItems > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({totalItems} mahasiswa)
                  </span>
                )}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : mahasiswaList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RiGraduationCapFill className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Tidak ada data mahasiswa</p>
                <p className="text-sm mt-2">
                  {selectedAngkatan.length === 0
                    ? "Pilih angkatan untuk melihat data"
                    : "Coba ubah filter atau lakukan sync data terlebih dahulu"}
                </p>
              </div>
            ) : (
              <>
                <Table aria-label="Tabel Mahasiswa">
                  <TableHeader>
                    <TableColumn>NPM</TableColumn>
                    <TableColumn>NAMA</TableColumn>
                    <TableColumn>L/P</TableColumn>
                    <TableColumn>ANGKATAN</TableColumn>
                    <TableColumn>PRODI</TableColumn>
                    <TableColumn>SEMESTER</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mahasiswaList.map((mhs) => (
                      <TableRow key={mhs.id_pd}>
                        <TableCell className="font-mono text-sm">{mhs.nipd}</TableCell>
                        <TableCell className="font-medium">{mhs.nama_pd}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color={mhs.jenis_kelamin === "L" ? "primary" : "secondary"}>
                            {mhs.jenis_kelamin}
                          </Chip>
                        </TableCell>
                        <TableCell>{mhs.angkatan}</TableCell>
                        <TableCell className="text-sm">{mhs.nama_prodi}</TableCell>
                        <TableCell className="text-center">{mhs.semester_sekarang}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color={getStatusColor(mhs.nama_status)}>
                            {mhs.nama_status}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      total={totalPages}
                      page={page}
                      onChange={setPage}
                      showControls
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
