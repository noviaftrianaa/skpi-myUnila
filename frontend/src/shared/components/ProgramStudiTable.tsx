"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DataTable, { Column } from "./ui/DataTable";
import { Chip, Select, SelectItem } from "@heroui/react";

interface ProgramStudi {
  kode: string;
  nama: string;
  status: string;
  jenjang: string;
  akreditasi: string;
  dosenRasio: number;
  dosenTetap: number;
  dosenTidakTetap: number;
  totalDosen: number;
  mahasiswa: number;
  rasio: string;
  periode: string;
}

const programStudiData: ProgramStudi[] = [
  { kode: "86104", nama: "Administrasi Pendidikan", status: "Aktif", jenjang: "S2", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 6, dosenTidakTetap: 0, totalDosen: 6, mahasiswa: 45, rasio: "1:7.5", periode: "Genap 2024" },
  { kode: "63411", nama: "Administrasi Perkantoran", status: "Aktif", jenjang: "D3", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 8, dosenTidakTetap: 3, totalDosen: 11, mahasiswa: 76, rasio: "1:6.9", periode: "Genap 2024" },
  { kode: "54101", nama: "Agribisnis", status: "Aktif", jenjang: "S2", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 5, dosenTidakTetap: 0, totalDosen: 5, mahasiswa: 38, rasio: "1:7.6", periode: "Genap 2024" },
  { kode: "54201", nama: "Agribisnis", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 1, totalDosen: 14, mahasiswa: 466, rasio: "1:33.3", periode: "Genap 2024" },
  { kode: "54204", nama: "Agronomi", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 0, totalDosen: 13, mahasiswa: 405, rasio: "1:31.2", periode: "Genap 2024" },
  { kode: "54301", nama: "Agroekoteknologi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 2, totalDosen: 17, mahasiswa: 512, rasio: "1:30.1", periode: "Genap 2024" },
  { kode: "45201", nama: "Akuntansi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 18, dosenTidakTetap: 4, totalDosen: 22, mahasiswa: 628, rasio: "1:28.5", periode: "Genap 2024" },
  { kode: "45101", nama: "Akuntansi", status: "Aktif", jenjang: "D3", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 10, dosenTidakTetap: 3, totalDosen: 13, mahasiswa: 142, rasio: "1:10.9", periode: "Genap 2024" },
  { kode: "86201", nama: "Bahasa Indonesia", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 12, dosenTidakTetap: 2, totalDosen: 14, mahasiswa: 385, rasio: "1:27.5", periode: "Genap 2024" },
  { kode: "86301", nama: "Bahasa Inggris", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 14, dosenTidakTetap: 3, totalDosen: 17, mahasiswa: 445, rasio: "1:26.2", periode: "Genap 2024" },
  { kode: "54401", nama: "Biologi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 16, dosenTidakTetap: 1, totalDosen: 17, mahasiswa: 328, rasio: "1:19.3", periode: "Genap 2024" },
  { kode: "54501", nama: "Budidaya Perairan", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 11, dosenTidakTetap: 2, totalDosen: 13, mahasiswa: 296, rasio: "1:22.8", periode: "Genap 2024" },
  { kode: "21201", nama: "Fisika", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 1, totalDosen: 14, mahasiswa: 187, rasio: "1:13.4", periode: "Genap 2024" },
  { kode: "62201", nama: "Geofisika", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 9, dosenTidakTetap: 2, totalDosen: 11, mahasiswa: 156, rasio: "1:14.2", periode: "Genap 2024" },
  { kode: "86401", nama: "Bimbingan dan Konseling", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 10, dosenTidakTetap: 1, totalDosen: 11, mahasiswa: 298, rasio: "1:27.1", periode: "Genap 2024" },
  { kode: "22201", nama: "Ilmu Administrasi Negara", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 3, totalDosen: 18, mahasiswa: 542, rasio: "1:30.1", periode: "Genap 2024" },
  { kode: "22301", nama: "Ilmu Administrasi Niaga/Bisnis", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 14, dosenTidakTetap: 2, totalDosen: 16, mahasiswa: 478, rasio: "1:29.9", periode: "Genap 2024" },
  { kode: "22401", nama: "Ilmu Hubungan Internasional", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 12, dosenTidakTetap: 4, totalDosen: 16, mahasiswa: 412, rasio: "1:25.8", periode: "Genap 2024" },
  { kode: "22501", nama: "Ilmu Komunikasi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 16, dosenTidakTetap: 5, totalDosen: 21, mahasiswa: 598, rasio: "1:28.5", periode: "Genap 2024" },
  { kode: "21301", nama: "Ilmu Komputer", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 20, dosenTidakTetap: 3, totalDosen: 23, mahasiswa: 687, rasio: "1:29.9", periode: "Genap 2024" },
  { kode: "21401", nama: "Ilmu Tanah", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 11, dosenTidakTetap: 1, totalDosen: 12, mahasiswa: 234, rasio: "1:19.5", periode: "Genap 2024" },
  { kode: "62301", nama: "Kehutanan", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 17, dosenTidakTetap: 2, totalDosen: 19, mahasiswa: 456, rasio: "1:24.0", periode: "Genap 2024" },
  { kode: "21501", nama: "Kimia", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 2, totalDosen: 17, mahasiswa: 312, rasio: "1:18.4", periode: "Genap 2024" },
  { kode: "45301", nama: "Manajemen", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 22, dosenTidakTetap: 6, totalDosen: 28, mahasiswa: 856, rasio: "1:30.6", periode: "Genap 2024" },
  { kode: "21601", nama: "Matematika", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 14, dosenTidakTetap: 1, totalDosen: 15, mahasiswa: 276, rasio: "1:18.4", periode: "Genap 2024" },
  { kode: "86501", nama: "Pendidikan Biologi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 2, totalDosen: 15, mahasiswa: 398, rasio: "1:26.5", periode: "Genap 2024" },
  { kode: "86601", nama: "Pendidikan Ekonomi", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 11, dosenTidakTetap: 3, totalDosen: 14, mahasiswa: 334, rasio: "1:23.9", periode: "Genap 2024" },
  { kode: "86701", nama: "Pendidikan Fisika", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 12, dosenTidakTetap: 1, totalDosen: 13, mahasiswa: 287, rasio: "1:22.1", periode: "Genap 2024" },
  { kode: "86801", nama: "Pendidikan Geografi", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 10, dosenTidakTetap: 2, totalDosen: 12, mahasiswa: 245, rasio: "1:20.4", periode: "Genap 2024" },
  { kode: "86901", nama: "Pendidikan Guru Sekolah Dasar", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 18, dosenTidakTetap: 4, totalDosen: 22, mahasiswa: 678, rasio: "1:30.8", periode: "Genap 2024" },
  { kode: "87001", nama: "Pendidikan Jasmani", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 14, dosenTidakTetap: 3, totalDosen: 17, mahasiswa: 445, rasio: "1:26.2", periode: "Genap 2024" },
  { kode: "87101", nama: "Pendidikan Kimia", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 11, dosenTidakTetap: 1, totalDosen: 12, mahasiswa: 298, rasio: "1:24.8", periode: "Genap 2024" },
  { kode: "87201", nama: "Pendidikan Matematika", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 2, totalDosen: 17, mahasiswa: 456, rasio: "1:26.8", periode: "Genap 2024" },
  { kode: "87301", nama: "Pendidikan Pancasila dan Kewarganegaraan", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 9, dosenTidakTetap: 2, totalDosen: 11, mahasiswa: 234, rasio: "1:21.3", periode: "Genap 2024" },
  { kode: "87401", nama: "Pendidikan Sejarah", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 8, dosenTidakTetap: 1, totalDosen: 9, mahasiswa: 187, rasio: "1:20.8", periode: "Genap 2024" },
  { kode: "62401", nama: "Perikanan", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 12, dosenTidakTetap: 2, totalDosen: 14, mahasiswa: 312, rasio: "1:22.3", periode: "Genap 2024" },
  { kode: "62501", nama: "Peternakan", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 16, dosenTidakTetap: 3, totalDosen: 19, mahasiswa: 523, rasio: "1:27.5", periode: "Genap 2024" },
  { kode: "21701", nama: "Proteksi Tanaman", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 10, dosenTidakTetap: 1, totalDosen: 11, mahasiswa: 256, rasio: "1:23.3", periode: "Genap 2024" },
  { kode: "21801", nama: "Sistem Informasi", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 18, dosenTidakTetap: 4, totalDosen: 22, mahasiswa: 612, rasio: "1:27.8", periode: "Genap 2024" },
  { kode: "22601", nama: "Sosiologi", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 11, dosenTidakTetap: 2, totalDosen: 13, mahasiswa: 298, rasio: "1:22.9", periode: "Genap 2024" },
  { kode: "21901", nama: "Teknik Elektro", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 17, dosenTidakTetap: 3, totalDosen: 20, mahasiswa: 534, rasio: "1:26.7", periode: "Genap 2024" },
  { kode: "22001", nama: "Teknik Geofisika", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 12, dosenTidakTetap: 2, totalDosen: 14, mahasiswa: 298, rasio: "1:21.3", periode: "Genap 2024" },
  { kode: "22101", nama: "Teknik Geologi", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 1, totalDosen: 14, mahasiswa: 312, rasio: "1:22.3", periode: "Genap 2024" },
  { kode: "22201", nama: "Teknik Industri", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 19, dosenTidakTetap: 4, totalDosen: 23, mahasiswa: 645, rasio: "1:28.0", periode: "Genap 2024" },
  { kode: "22301", nama: "Teknik Kimia", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 16, dosenTidakTetap: 2, totalDosen: 18, mahasiswa: 478, rasio: "1:26.6", periode: "Genap 2024" },
  { kode: "22401", nama: "Teknik Mesin", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 3, totalDosen: 18, mahasiswa: 456, rasio: "1:25.3", periode: "Genap 2024" },
  { kode: "22501", nama: "Teknik Pertanian", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 14, dosenTidakTetap: 2, totalDosen: 16, mahasiswa: 389, rasio: "1:24.3", periode: "Genap 2024" },
  { kode: "22601", nama: "Teknik Sipil", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 21, dosenTidakTetap: 5, totalDosen: 26, mahasiswa: 734, rasio: "1:28.2", periode: "Genap 2024" },
  { kode: "62601", nama: "Teknologi Hasil Pertanian", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 15, dosenTidakTetap: 2, totalDosen: 17, mahasiswa: 445, rasio: "1:26.2", periode: "Genap 2024" },
  { kode: "62701", nama: "Teknologi Industri Pertanian", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 13, dosenTidakTetap: 3, totalDosen: 16, mahasiswa: 378, rasio: "1:23.6", periode: "Genap 2024" },
  { kode: "45401", nama: "Ekonomi Pembangunan", status: "Aktif", jenjang: "S1", akreditasi: "Unggul", dosenRasio: 0, dosenTetap: 17, dosenTidakTetap: 4, totalDosen: 21, mahasiswa: 589, rasio: "1:28.0", periode: "Genap 2024" },
  { kode: "87501", nama: "Pendidikan Anak Usia Dini", status: "Aktif", jenjang: "S1", akreditasi: "Baik Sekali", dosenRasio: 0, dosenTetap: 10, dosenTidakTetap: 2, totalDosen: 12, mahasiswa: 298, rasio: "1:24.8", periode: "Genap 2024" },
];

export default function ProgramStudiTable() {
  const [selectedPeriode, setSelectedPeriode] = useState<string>("Genap 2024");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getAkreditasiColor = (akreditasi: string) => {
    switch (akreditasi) {
      case "Unggul": return "success";
      case "Baik Sekali": return "primary";
      case "Baik": return "warning";
      default: return "default";
    }
  };

  // Filter data berdasarkan periode
  const filteredData = useMemo(() => {
    return programStudiData.filter(item => item.periode === selectedPeriode);
  }, [selectedPeriode]);

  // Daftar periode yang tersedia
  const periodeOptions = useMemo(() => {
    const periodes = Array.from(new Set(programStudiData.map(item => item.periode)));
    return periodes.sort().reverse(); // Urutkan terbaru dulu
  }, []);

  // Function to create slug from nama program studi
  const createSlug = (nama: string) => {
    return nama
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const columns: Column<ProgramStudi>[] = [
    { key: "kode", label: "KODE", align: "center", width: "70px", sortable: true, render: (item) => <span className="font-bold text-gray-900">{item.kode}</span> },
    {
      key: "nama",
      label: "NAMA PROGRAM STUDI",
      minWidth: "180px",
      sortable: true,
      render: (item) => (
        <Link
          href={`/program-studi/${createSlug(item.nama)}`}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          {item.nama}
        </Link>
      )
    },
    { key: "status", label: "STATUS", align: "center", width: "80px", render: (item) => <Chip size="sm" color="success" variant="flat" className="font-semibold">{item.status}</Chip> },
    { key: "jenjang", label: "JENJANG", align: "center", width: "80px", sortable: true, render: (item) => <span className="font-bold text-blue-600">{item.jenjang}</span> },
    { key: "akreditasi", label: "AKREDITASI", align: "center", width: "110px", sortable: true, render: (item) => <Chip size="sm" color={getAkreditasiColor(item.akreditasi)} variant="flat" className="font-semibold">{item.akreditasi}</Chip> },
    { key: "dosenRasio", label: "DOSEN", align: "center", width: "70px", sortable: true, headerRender: () => <div className="text-center">JUMLAH DOSEN</div>, render: (item) => <span className="font-bold text-gray-900">{item.dosenRasio}</span> },
    { key: "tendik", label: "TENDIK", align: "center", width: "90px", sortable: true, headerRender: () => <div className="text-center">JUMLAH TENDIK</div>, render: (item) => <span className="font-bold text-blue-600">{item.totalDosen}</span> },
    { key: "mahasiswa", label: "MAHASISWA", align: "center", width: "90px", sortable: true, headerRender: () => <div className="text-center"><div>JUMLAH</div><div>MAHASISWA</div></div>, render: (item) => <span className="font-bold text-indigo-600">{item.mahasiswa}</span> },
    { key: "rasio", label: "RASIO", align: "center", width: "80px", headerRender: () => <div className="text-center"><div>RASIO DOSEN /</div><div>MAHASISWA</div></div>, render: (item) => <span className="text-gray-700 font-semibold">{item.rasio}</span> },
  ];

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalProdi = filteredData.length;
    const totalDosen = filteredData.reduce((sum, item) => sum + item.dosenRasio, 0);
    const totalTendik = filteredData.reduce((sum, item) => sum + item.totalDosen, 0);
    const totalMahasiswa = filteredData.reduce((sum, item) => sum + item.mahasiswa, 0);
    const avgRasio = totalDosen > 0 ? Math.round(totalMahasiswa / totalDosen) : 0;

    const akreditasiCount = {
      unggul: filteredData.filter(item => item.akreditasi === "Unggul").length,
      baikSekali: filteredData.filter(item => item.akreditasi === "Baik Sekali").length,
      baik: filteredData.filter(item => item.akreditasi === "Baik").length,
    };

    return {
      totalProdi,
      totalDosen,
      totalTendik,
      totalMahasiswa,
      avgRasio,
      akreditasiCount,
    };
  }, [filteredData]);

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/30 via-white to-indigo-50/20 relative">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants} className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">Program Studi</h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Daftar program studi di Universitas Lampung</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={true}
              searchKeys={["nama", "kode"]}
              searchPlaceholder="Cari: [Nama Program Studi] / [Kode]"
              defaultRowsPerPage={5}
              rowsPerPageOptions={[5, 10, 15, 25]}
              noWrapper={true}
              filterSlot={
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm whitespace-nowrap">Periode:</span>
                  <Select
                    placeholder="Pilih Periode"
                    selectedKeys={[selectedPeriode]}
                    onChange={(e) => setSelectedPeriode(e.target.value)}
                    classNames={{
                      base: "flex-1 min-w-[180px]",
                      trigger: "bg-white/95 backdrop-blur-sm h-10 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-0",
                      value: "text-slate-700 font-semibold text-sm",
                      popoverContent: "bg-white rounded-lg shadow-xl",
                      innerWrapper: "text-slate-700",
                    }}
                    size="md"
                    startContent={
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    {periodeOptions.map((periode) => (
                      <SelectItem key={periode}>
                        {periode}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              }
            />

            {/* Footer Summary */}
            <div className="border-t-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="px-6 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Dosen</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.totalDosen.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Tendik</div>
                    <div className="text-2xl font-bold text-blue-600">{summary.totalTendik.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Mahasiswa</div>
                    <div className="text-2xl font-bold text-indigo-600">{summary.totalMahasiswa.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Rasio Dosen:Mahasiswa</div>
                    <div className="text-2xl font-bold text-emerald-600">1:{summary.avgRasio}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
