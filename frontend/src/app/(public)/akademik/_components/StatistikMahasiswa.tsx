"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface MahasiswaData {
  fakultas: string;
  aktif: number;
  cuti: number;
  nonAktif: number;
  do: number;
  prodi?: ProdiData[];
}

interface ProdiData {
  nama: string;
  aktif: number;
  cuti: number;
  nonAktif: number;
  do: number;
  angkatan?: AngkatanData[];
}

interface AngkatanData {
  tahun: string;
  aktif: number;
  cuti: number;
  nonAktif: number;
  do: number;
}

export default function StatistikMahasiswa() {
  const [selectedSemester, setSelectedSemester] = useState("Genap 2024");
  const [drillDownLevel, setDrillDownLevel] = useState<"fakultas" | "prodi" | "angkatan">("fakultas");
  const [selectedFakultas, setSelectedFakultas] = useState<string | null>(null);
  const [selectedProdi, setSelectedProdi] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data mahasiswa per fakultas
  const mahasiswaData: MahasiswaData[] = [
    {
      fakultas: "Teknik",
      aktif: 3280,
      cuti: 145,
      nonAktif: 87,
      do: 23,
      prodi: [
        {
          nama: "Teknik Sipil",
          aktif: 734,
          cuti: 32,
          nonAktif: 18,
          do: 5,
          angkatan: [
            { tahun: "2024", aktif: 145, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 168, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 178, cuti: 8, nonAktif: 5, do: 1 },
            { tahun: "2021", aktif: 156, cuti: 12, nonAktif: 7, do: 2 },
            { tahun: "2020", aktif: 87, cuti: 5, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Teknik Elektro",
          aktif: 534,
          cuti: 24,
          nonAktif: 15,
          do: 4,
          angkatan: [
            { tahun: "2024", aktif: 112, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 125, cuti: 4, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 134, cuti: 6, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 108, cuti: 9, nonAktif: 6, do: 1 },
            { tahun: "2020", aktif: 55, cuti: 4, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Teknik Industri",
          aktif: 645,
          cuti: 28,
          nonAktif: 19,
          do: 5,
          angkatan: [
            { tahun: "2024", aktif: 128, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 148, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 156, cuti: 7, nonAktif: 5, do: 1 },
            { tahun: "2021", aktif: 142, cuti: 10, nonAktif: 7, do: 2 },
            { tahun: "2020", aktif: 71, cuti: 4, nonAktif: 4, do: 1 },
          ],
        },
        {
          nama: "Teknik Mesin",
          aktif: 456,
          cuti: 21,
          nonAktif: 12,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 95, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 105, cuti: 3, nonAktif: 2, do: 0 },
            { tahun: "2022", aktif: 112, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 98, cuti: 8, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 46, cuti: 4, nonAktif: 2, do: 1 },
          ],
        },
        {
          nama: "Ilmu Komputer",
          aktif: 687,
          cuti: 30,
          nonAktif: 16,
          do: 4,
          angkatan: [
            { tahun: "2024", aktif: 142, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 158, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 168, cuti: 8, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 145, cuti: 11, nonAktif: 6, do: 1 },
            { tahun: "2020", aktif: 74, cuti: 4, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Teknik Kimia",
          aktif: 224,
          cuti: 10,
          nonAktif: 7,
          do: 2,
          angkatan: [
            { tahun: "2024", aktif: 48, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 52, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 56, cuti: 2, nonAktif: 2, do: 1 },
            { tahun: "2021", aktif: 48, cuti: 3, nonAktif: 3, do: 0 },
            { tahun: "2020", aktif: 20, cuti: 2, nonAktif: 1, do: 1 },
          ],
        },
      ],
    },
    {
      fakultas: "FKIP",
      aktif: 2950,
      cuti: 128,
      nonAktif: 76,
      do: 18,
      prodi: [
        {
          nama: "Pendidikan Matematika",
          aktif: 456,
          cuti: 20,
          nonAktif: 12,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 95, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 105, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 112, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 98, cuti: 7, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 46, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Pendidikan Biologi",
          aktif: 398,
          cuti: 18,
          nonAktif: 10,
          do: 2,
          angkatan: [
            { tahun: "2024", aktif: 82, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 92, cuti: 3, nonAktif: 2, do: 0 },
            { tahun: "2022", aktif: 98, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 84, cuti: 7, nonAktif: 3, do: 1 },
            { tahun: "2020", aktif: 42, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "PGSD",
          aktif: 678,
          cuti: 30,
          nonAktif: 18,
          do: 5,
          angkatan: [
            { tahun: "2024", aktif: 142, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 155, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 165, cuti: 8, nonAktif: 5, do: 2 },
            { tahun: "2021", aktif: 145, cuti: 11, nonAktif: 7, do: 1 },
            { tahun: "2020", aktif: 71, cuti: 4, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Pendidikan Bahasa Inggris",
          aktif: 445,
          cuti: 20,
          nonAktif: 12,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 92, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 102, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 110, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 96, cuti: 7, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 45, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Pendidikan Fisika",
          aktif: 287,
          cuti: 12,
          nonAktif: 8,
          do: 2,
          angkatan: [
            { tahun: "2024", aktif: 60, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 66, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 70, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2021", aktif: 62, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2020", aktif: 29, cuti: 2, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Pendidikan Ekonomi",
          aktif: 334,
          cuti: 14,
          nonAktif: 9,
          do: 2,
          angkatan: [
            { tahun: "2024", aktif: 70, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 77, cuti: 2, nonAktif: 2, do: 0 },
            { tahun: "2022", aktif: 82, cuti: 4, nonAktif: 2, do: 1 },
            { tahun: "2021", aktif: 72, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2020", aktif: 33, cuti: 2, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Bimbingan Konseling",
          aktif: 352,
          cuti: 14,
          nonAktif: 7,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 74, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 81, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 86, cuti: 4, nonAktif: 2, do: 0 },
            { tahun: "2021", aktif: 76, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2020", aktif: 35, cuti: 2, nonAktif: 1, do: 0 },
          ],
        },
      ],
    },
    {
      fakultas: "Ekonomi & Bisnis",
      aktif: 2580,
      cuti: 112,
      nonAktif: 68,
      do: 15,
      prodi: [
        {
          nama: "Manajemen",
          aktif: 856,
          cuti: 38,
          nonAktif: 22,
          do: 6,
          angkatan: [
            { tahun: "2024", aktif: 178, cuti: 3, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 198, cuti: 6, nonAktif: 4, do: 1 },
            { tahun: "2022", aktif: 210, cuti: 10, nonAktif: 6, do: 2 },
            { tahun: "2021", aktif: 185, cuti: 14, nonAktif: 8, do: 2 },
            { tahun: "2020", aktif: 85, cuti: 5, nonAktif: 4, do: 1 },
          ],
        },
        {
          nama: "Akuntansi",
          aktif: 628,
          cuti: 28,
          nonAktif: 17,
          do: 4,
          angkatan: [
            { tahun: "2024", aktif: 130, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 145, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 154, cuti: 7, nonAktif: 5, do: 1 },
            { tahun: "2021", aktif: 136, cuti: 11, nonAktif: 6, do: 1 },
            { tahun: "2020", aktif: 63, cuti: 4, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Ekonomi Pembangunan",
          aktif: 589,
          cuti: 26,
          nonAktif: 16,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 122, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 136, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 144, cuti: 7, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 127, cuti: 10, nonAktif: 6, do: 1 },
            { tahun: "2020", aktif: 60, cuti: 3, nonAktif: 3, do: 0 },
          ],
        },
        {
          nama: "D3 Akuntansi",
          aktif: 142,
          cuti: 6,
          nonAktif: 4,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 48, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 52, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 42, cuti: 3, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "D3 Administrasi Perkantoran",
          aktif: 165,
          cuti: 7,
          nonAktif: 5,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 56, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 61, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 48, cuti: 4, nonAktif: 4, do: 1 },
          ],
        },
        {
          nama: "D3 Perpajakan",
          aktif: 200,
          cuti: 7,
          nonAktif: 4,
          do: 0,
          angkatan: [
            { tahun: "2024", aktif: 68, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 74, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 58, cuti: 4, nonAktif: 3, do: 0 },
          ],
        },
      ],
    },
    {
      fakultas: "Pertanian",
      aktif: 2150,
      cuti: 94,
      nonAktif: 56,
      do: 12,
      prodi: [
        {
          nama: "Agribisnis",
          aktif: 466,
          cuti: 21,
          nonAktif: 13,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 97, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 108, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 114, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 101, cuti: 8, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 46, cuti: 3, nonAktif: 3, do: 0 },
          ],
        },
        {
          nama: "Agroekoteknologi",
          aktif: 512,
          cuti: 23,
          nonAktif: 14,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 106, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 118, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 125, cuti: 6, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 111, cuti: 8, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 52, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Teknologi Hasil Pertanian",
          aktif: 445,
          cuti: 20,
          nonAktif: 12,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 92, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 103, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 109, cuti: 5, nonAktif: 3, do: 1 },
            { tahun: "2021", aktif: 96, cuti: 7, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 45, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Ilmu Tanah",
          aktif: 234,
          cuti: 10,
          nonAktif: 6,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 49, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 54, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 57, cuti: 2, nonAktif: 2, do: 0 },
            { tahun: "2021", aktif: 50, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2020", aktif: 24, cuti: 2, nonAktif: 1, do: 0 },
          ],
        },
        {
          nama: "Proteksi Tanaman",
          aktif: 256,
          cuti: 11,
          nonAktif: 6,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 53, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 59, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 63, cuti: 3, nonAktif: 2, do: 0 },
            { tahun: "2021", aktif: 55, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2020", aktif: 26, cuti: 2, nonAktif: 1, do: 0 },
          ],
        },
        {
          nama: "Agronomi",
          aktif: 237,
          cuti: 9,
          nonAktif: 5,
          do: 1,
          angkatan: [
            { tahun: "2024", aktif: 49, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 55, cuti: 1, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 58, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2021", aktif: 51, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2020", aktif: 24, cuti: 2, nonAktif: 1, do: 0 },
          ],
        },
      ],
    },
    {
      fakultas: "FISIP",
      aktif: 1830,
      cuti: 80,
      nonAktif: 48,
      do: 10,
      prodi: [
        {
          nama: "Ilmu Administrasi Negara",
          aktif: 542,
          cuti: 24,
          nonAktif: 14,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 112, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 125, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 133, cuti: 6, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 117, cuti: 9, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 55, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Ilmu Komunikasi",
          aktif: 598,
          cuti: 26,
          nonAktif: 16,
          do: 4,
          angkatan: [
            { tahun: "2024", aktif: 124, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 138, cuti: 4, nonAktif: 3, do: 1 },
            { tahun: "2022", aktif: 146, cuti: 7, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 129, cuti: 10, nonAktif: 6, do: 1 },
            { tahun: "2020", aktif: 61, cuti: 3, nonAktif: 3, do: 1 },
          ],
        },
        {
          nama: "Ilmu Administrasi Niaga",
          aktif: 478,
          cuti: 21,
          nonAktif: 13,
          do: 3,
          angkatan: [
            { tahun: "2024", aktif: 99, cuti: 2, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 110, cuti: 3, nonAktif: 2, do: 1 },
            { tahun: "2022", aktif: 117, cuti: 5, nonAktif: 4, do: 1 },
            { tahun: "2021", aktif: 103, cuti: 8, nonAktif: 5, do: 1 },
            { tahun: "2020", aktif: 49, cuti: 3, nonAktif: 2, do: 0 },
          ],
        },
        {
          nama: "Sosiologi",
          aktif: 212,
          cuti: 9,
          nonAktif: 5,
          do: 0,
          angkatan: [
            { tahun: "2024", aktif: 44, cuti: 1, nonAktif: 0, do: 0 },
            { tahun: "2023", aktif: 49, cuti: 1, nonAktif: 1, do: 0 },
            { tahun: "2022", aktif: 52, cuti: 2, nonAktif: 1, do: 0 },
            { tahun: "2021", aktif: 46, cuti: 3, nonAktif: 2, do: 0 },
            { tahun: "2020", aktif: 21, cuti: 2, nonAktif: 1, do: 0 },
          ],
        },
      ],
    },
  ];

  const semesterOptions = ["Genap 2024", "Ganjil 2024", "Genap 2023", "Ganjil 2023"];

  // Calculate totals
  const totals = useMemo(() => {
    const total = mahasiswaData.reduce((acc, fakultas) => ({
      aktif: acc.aktif + fakultas.aktif,
      cuti: acc.cuti + fakultas.cuti,
      nonAktif: acc.nonAktif + fakultas.nonAktif,
      do: acc.do + fakultas.do,
    }), { aktif: 0, cuti: 0, nonAktif: 0, do: 0 });

    return {
      ...total,
      total: total.aktif + total.cuti + total.nonAktif + total.do,
    };
  }, []);

  // Get data based on drill-down level
  const getChartData = () => {
    if (drillDownLevel === "fakultas") {
      return mahasiswaData.map(f => ({
        name: f.fakultas,
        aktif: f.aktif,
        cuti: f.cuti,
        nonAktif: f.nonAktif,
        do: f.do,
      }));
    } else if (drillDownLevel === "prodi" && selectedFakultas) {
      const fakultas = mahasiswaData.find(f => f.fakultas === selectedFakultas);
      return fakultas?.prodi?.map(p => ({
        name: p.nama,
        aktif: p.aktif,
        cuti: p.cuti,
        nonAktif: p.nonAktif,
        do: p.do,
      })) || [];
    } else if (drillDownLevel === "angkatan" && selectedProdi) {
      const fakultas = mahasiswaData.find(f => f.fakultas === selectedFakultas);
      const prodi = fakultas?.prodi?.find(p => p.nama === selectedProdi);
      return prodi?.angkatan?.map(a => ({
        name: a.tahun,
        aktif: a.aktif,
        cuti: a.cuti,
        nonAktif: a.nonAktif,
        do: a.do,
      })) || [];
    }
    return [];
  };

  const chartData = getChartData();

  // Chart configuration
  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Aktif", "Cuti", "Non Aktif", "DO"],
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
      data: chartData.map(item => item.name),
      axisLabel: {
        color: "#1f2937",
        fontSize: 10,
        fontWeight: 600,
        interval: 0,
        rotate: drillDownLevel === "fakultas" ? 0 : 15,
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
        name: "Aktif",
        type: "bar",
        stack: "total",
        data: chartData.map(item => item.aktif),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#10b981" },
              { offset: 1, color: "#34d399" },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: "Cuti",
        type: "bar",
        stack: "total",
        data: chartData.map(item => item.cuti),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#f59e0b" },
              { offset: 1, color: "#fbbf24" },
            ],
          },
        },
      },
      {
        name: "Non Aktif",
        type: "bar",
        stack: "total",
        data: chartData.map(item => item.nonAktif),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#a78bfa" },
            ],
          },
        },
      },
      {
        name: "DO",
        type: "bar",
        stack: "total",
        data: chartData.map(item => item.do),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#ef4444" },
              { offset: 1, color: "#f87171" },
            ],
          },
        },
      },
    ],
  }), [chartData, drillDownLevel]);

  const handleChartClick = (params: any) => {
    if (drillDownLevel === "fakultas") {
      setSelectedFakultas(params.name);
      setDrillDownLevel("prodi");
    } else if (drillDownLevel === "prodi") {
      setSelectedProdi(params.name);
      setDrillDownLevel("angkatan");
    }
  };

  const handleReset = () => {
    setDrillDownLevel("fakultas");
    setSelectedFakultas(null);
    setSelectedProdi(null);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Statistik Mahasiswa</h3>
              <p className="text-gray-600">
                {drillDownLevel === "fakultas" && "Total mahasiswa per fakultas"}
                {drillDownLevel === "prodi" && `Program Studi di ${selectedFakultas}`}
                {drillDownLevel === "angkatan" && `Angkatan ${selectedProdi}`}
              </p>
            </div>
            <div className="flex gap-3">
              {drillDownLevel !== "fakultas" && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all"
                >
                  ← Reset
                </button>
              )}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesterOptions.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">TOTAL MAHASISWA</div>
              <div className="text-2xl font-bold text-blue-600">{totals.total.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">AKTIF</div>
              <div className="text-2xl font-bold text-emerald-600">{totals.aktif.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">CUTI</div>
              <div className="text-2xl font-bold text-amber-600">{totals.cuti.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">NON AKTIF</div>
              <div className="text-2xl font-bold text-purple-600">{totals.nonAktif.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">DO</div>
              <div className="text-2xl font-bold text-red-600">{totals.do.toLocaleString()}</div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-blue-600">
              <h3 className="text-xl font-bold text-white">Distribusi Mahasiswa ({selectedSemester})</h3>
              <p className="text-blue-100 text-sm mt-1">Klik pada bar untuk drill-down ke level lebih detail</p>
            </div>
            <div className="p-6">
              <div className="h-[450px]">
                <ReactECharts
                  option={chartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                  onEvents={{
                    click: handleChartClick,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
