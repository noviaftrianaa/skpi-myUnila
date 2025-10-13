"use client";

import { motion } from "framer-motion";
import { Card, CardBody, Chip, Button, Tabs, Tab } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import DataTable, { Column } from "../ui/DataTable";

interface ProfilProdiProps {
  slug: string;
}

// Data dummy untuk program studi
const prodiData: Record<string, any> = {
  "ilmu-komputer": {
    nama: "Ilmu Komputer",
    kode: "21301",
    jenjang: "S1",
    akreditasi: "Unggul",
    fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam",
    visi: "Menjadi program studi yang unggul dalam bidang ilmu komputer dan menghasilkan lulusan yang kompeten, inovatif, dan berkarakter di tingkat nasional pada tahun 2025.",
    misi: [
      "Menyelenggarakan pendidikan dan pembelajaran yang berkualitas di bidang ilmu komputer",
      "Melaksanakan penelitian yang berkualitas dan bermanfaat bagi pengembangan ilmu komputer",
      "Melaksanakan pengabdian kepada masyarakat berbasis teknologi informasi",
      "Membangun kerjasama dengan berbagai pihak untuk meningkatkan kualitas program studi"
    ],
    deskripsi: "Program Studi Ilmu Komputer Universitas Lampung telah berdiri sejak tahun 2001 dan telah menghasilkan lulusan yang berkualitas dan berdaya saing tinggi. Program studi ini fokus pada pengembangan ilmu komputer teoritis dan aplikatif yang mencakup algoritma, pemrograman, kecerdasan buatan, pengolahan data, dan keamanan siber.",
    prospekKarir: [
      "Software Engineer / Developer",
      "Data Scientist / Analyst",
      "System Analyst",
      "Database Administrator",
      "AI/Machine Learning Engineer",
      "Cybersecurity Specialist",
      "IT Consultant",
      "Research Scientist"
    ],
    dosenTetap: 20,
    dosenTidakTetap: 3,
    mahasiswa: 687,
    rasio: "1:29.9",
    gelarLulusan: "S.Kom. (Sarjana Komputer)",
    lamaMasaStudi: "4 tahun (8 semester)",
    totalSKS: 144,
    website: "https://ilkom.fmipa.unila.ac.id",
    email: "ilkom@fmipa.unila.ac.id",
    telepon: "(0721) 701609",
    kurikulum: [
      "Struktur Data dan Algoritma",
      "Pemrograman Berorientasi Objek",
      "Basis Data",
      "Jaringan Komputer",
      "Kecerdasan Buatan",
      "Machine Learning",
      "Pemrosesan Citra Digital",
      "Keamanan Informasi",
      "Rekayasa Perangkat Lunak",
      "Komputasi Awan"
    ],
    fasilitas: [
      "Laboratorium Pemrograman",
      "Laboratorium Jaringan Komputer",
      "Laboratorium Multimedia",
      "Ruang Server",
      "Perpustakaan Digital",
      "Ruang Kuliah Ber-AC",
      "Free WiFi Coverage",
      "Co-working Space"
    ],
    prestasi: [
      "Juara 1 Hackathon Nasional 2024",
      "Best Paper Award ICIET 2023",
      "Finalis Gemastik XIV",
      "Juara 2 Programming Contest Regional"
    ],
    daftarDosen: [
      { nidn: "0012047801", nama: "Dr. Eng. Ahmad Fauzi, S.Kom., M.T.", jabatan: "Lektor Kepala", bidangKeahlian: "Artificial Intelligence", email: "ahmad.fauzi@fmipa.unila.ac.id" },
      { nidn: "0015058502", nama: "Dr. Siti Rahma, S.Kom., M.Cs.", jabatan: "Lektor Kepala", bidangKeahlian: "Data Science", email: "siti.rahma@fmipa.unila.ac.id" },
      { nidn: "0020067903", nama: "Prof. Dr. Budi Santoso, S.Kom., M.Sc.", jabatan: "Guru Besar", bidangKeahlian: "Computer Networks", email: "budi.santoso@fmipa.unila.ac.id" },
      { nidn: "0025088404", nama: "Ir. Dewi Lestari, S.Kom., M.T.", jabatan: "Lektor", bidangKeahlian: "Software Engineering", email: "dewi.lestari@fmipa.unila.ac.id" },
      { nidn: "0018097805", nama: "Dr. Eko Prasetyo, S.Kom., M.Kom.", jabatan: "Lektor Kepala", bidangKeahlian: "Database Systems", email: "eko.prasetyo@fmipa.unila.ac.id" },
      { nidn: "0022058806", nama: "Rina Fitriani, S.Kom., M.T.", jabatan: "Asisten Ahli", bidangKeahlian: "Web Development", email: "rina.fitriani@fmipa.unila.ac.id" },
      { nidn: "0030068907", nama: "Dr. Hadi Wijaya, S.Kom., M.Kom.", jabatan: "Lektor", bidangKeahlian: "Cybersecurity", email: "hadi.wijaya@fmipa.unila.ac.id" },
      { nidn: "0019078708", nama: "Lina Marlina, S.Kom., M.Sc.", jabatan: "Lektor", bidangKeahlian: "Mobile Computing", email: "lina.marlina@fmipa.unila.ac.id" },
      { nidn: "0028099009", nama: "Dr. Agus Setiawan, S.Kom., M.T.", jabatan: "Lektor Kepala", bidangKeahlian: "Cloud Computing", email: "agus.setiawan@fmipa.unila.ac.id" },
      { nidn: "0014068110", nama: "Yuni Astuti, S.Kom., M.Kom.", jabatan: "Asisten Ahli", bidangKeahlian: "Human-Computer Interaction", email: "yuni.astuti@fmipa.unila.ac.id" }
    ],
    daftarMahasiswa: [
      { npm: "2115101001", nama: "Andi Pratama", angkatan: "2021", status: "Aktif", ipk: 3.85, semester: 7 },
      { npm: "2115101002", nama: "Bella Safitri", angkatan: "2021", status: "Aktif", ipk: 3.92, semester: 7 },
      { npm: "2215101003", nama: "Citra Dewi", angkatan: "2022", status: "Aktif", ipk: 3.78, semester: 5 },
      { npm: "2215101004", nama: "Dimas Ardiansyah", angkatan: "2022", status: "Aktif", ipk: 3.65, semester: 5 },
      { npm: "2215101005", nama: "Eka Putri", angkatan: "2022", status: "Aktif", ipk: 3.88, semester: 5 },
      { npm: "2315101006", nama: "Fajar Maulana", angkatan: "2023", status: "Aktif", ipk: 3.72, semester: 3 },
      { npm: "2315101007", nama: "Gita Permata", angkatan: "2023", status: "Aktif", ipk: 3.95, semester: 3 },
      { npm: "2315101008", nama: "Hendra Kurniawan", angkatan: "2023", status: "Aktif", ipk: 3.68, semester: 3 },
      { npm: "2415101009", nama: "Indah Lestari", angkatan: "2024", status: "Aktif", ipk: 3.80, semester: 1 },
      { npm: "2415101010", nama: "Joko Susanto", angkatan: "2024", status: "Aktif", ipk: 3.76, semester: 1 },
      { npm: "2115101011", nama: "Kartika Sari", angkatan: "2021", status: "Cuti", ipk: 3.55, semester: 7 },
      { npm: "2215101012", nama: "Lukman Hakim", angkatan: "2022", status: "Aktif", ipk: 3.82, semester: 5 },
      { npm: "2315101013", nama: "Maya Anggraini", angkatan: "2023", status: "Aktif", ipk: 3.90, semester: 3 },
      { npm: "2415101014", nama: "Nanda Pratama", angkatan: "2024", status: "Aktif", ipk: 3.70, semester: 1 },
      { npm: "2415101015", nama: "Olivia Rahmawati", angkatan: "2024", status: "Aktif", ipk: 3.85, semester: 1 }
    ]
  },
  "teknik-sipil": {
    nama: "Teknik Sipil",
    kode: "22601",
    jenjang: "S1",
    akreditasi: "Unggul",
    fakultas: "Fakultas Teknik",
    visi: "Menjadi program studi Teknik Sipil yang unggul, inovatif dan berkarakter dalam bidang rekayasa infrastruktur berkelanjutan di tingkat nasional pada tahun 2025.",
    misi: [
      "Menyelenggarakan pendidikan berkualitas di bidang teknik sipil",
      "Melaksanakan penelitian terapan untuk mendukung pembangunan infrastruktur",
      "Mengembangkan pengabdian kepada masyarakat berbasis solusi teknik sipil",
      "Membangun jejaring dengan industri dan institusi terkait"
    ],
    deskripsi: "Program Studi Teknik Sipil Universitas Lampung telah berdiri sejak tahun 1985. Program studi ini menghasilkan sarjana teknik sipil yang kompeten dalam perencanaan, desain, konstruksi, dan manajemen infrastruktur berkelanjutan.",
    prospekKarir: [
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
      "Transportation Engineer",
      "Quantity Surveyor",
      "Building Inspector",
      "Urban Planner",
      "Consultant Engineer"
    ],
    dosenTetap: 21,
    dosenTidakTetap: 5,
    mahasiswa: 734,
    rasio: "1:28.2",
    gelarLulusan: "S.T. (Sarjana Teknik)",
    lamaMasaStudi: "4 tahun (8 semester)",
    totalSKS: 144,
    website: "https://ts.ft.unila.ac.id",
    email: "tekniksipil@ft.unila.ac.id",
    telepon: "(0721) 703939",
    kurikulum: [
      "Mekanika Teknik",
      "Struktur Beton",
      "Struktur Baja",
      "Mekanika Tanah",
      "Teknik Transportasi",
      "Manajemen Konstruksi",
      "Hidrologi",
      "Rekayasa Gempa",
      "Teknologi Bahan",
      "Estimasi Biaya"
    ],
    fasilitas: [
      "Laboratorium Struktur",
      "Laboratorium Mekanika Tanah",
      "Laboratorium Bahan Konstruksi",
      "Laboratorium Survey dan Pemetaan",
      "Software Analisis Struktur (SAP2000, ETABS)",
      "AutoCAD Lab",
      "Perpustakaan Teknik",
      "Workshop Praktikum"
    ],
    prestasi: [
      "Juara 1 Bridge Design Competition 2024",
      "Best Paper HAKI Award 2023",
      "Finalis Kompetisi Jembatan Indonesia",
      "Juara Harapan 1 Civil Engineering Olympiad"
    ],
    daftarDosen: [
      { nidn: "0010056701", nama: "Prof. Dr. Ir. Bambang Setiadi, M.T.", jabatan: "Guru Besar", bidangKeahlian: "Structural Engineering", email: "bambang.setiadi@ft.unila.ac.id" },
      { nidn: "0015067502", nama: "Dr. Ir. Sri Hartati, M.Sc.", jabatan: "Lektor Kepala", bidangKeahlian: "Geotechnical Engineering", email: "sri.hartati@ft.unila.ac.id" },
      { nidn: "0020078303", nama: "Ir. Dedi Rahmat, S.T., M.T.", jabatan: "Lektor", bidangKeahlian: "Transportation Engineering", email: "dedi.rahmat@ft.unila.ac.id" },
      { nidn: "0018058804", nama: "Dr. Eng. Rini Susanti, S.T., M.T.", jabatan: "Lektor Kepala", bidangKeahlian: "Water Resources", email: "rini.susanti@ft.unila.ac.id" },
      { nidn: "0025069005", nama: "Ir. Agus Hermawan, S.T., M.Eng.", jabatan: "Lektor", bidangKeahlian: "Construction Management", email: "agus.hermawan@ft.unila.ac.id" },
      { nidn: "0022078606", nama: "Dr. Fitri Wahyuni, S.T., M.T.", jabatan: "Lektor", bidangKeahlian: "Concrete Technology", email: "fitri.wahyuni@ft.unila.ac.id" },
      { nidn: "0030088907", nama: "Hendra Gunawan, S.T., M.T.", jabatan: "Asisten Ahli", bidangKeahlian: "Steel Structure", email: "hendra.gunawan@ft.unila.ac.id" },
      { nidn: "0028077808", nama: "Dr. Linda Permatasari, S.T., M.Sc.", jabatan: "Lektor Kepala", bidangKeahlian: "Environmental Engineering", email: "linda.permatasari@ft.unila.ac.id" }
    ],
    daftarMahasiswa: [
      { npm: "2122601001", nama: "Rahmat Hidayat", angkatan: "2021", status: "Aktif", ipk: 3.72, semester: 7 },
      { npm: "2122601002", nama: "Siti Nurjanah", angkatan: "2021", status: "Aktif", ipk: 3.88, semester: 7 },
      { npm: "2222601003", nama: "Taufik Rahman", angkatan: "2022", status: "Aktif", ipk: 3.65, semester: 5 },
      { npm: "2222601004", nama: "Ulfa Maharani", angkatan: "2022", status: "Aktif", ipk: 3.91, semester: 5 },
      { npm: "2322601005", nama: "Vino Prasetyo", angkatan: "2023", status: "Aktif", ipk: 3.74, semester: 3 },
      { npm: "2322601006", nama: "Winda Kusuma", angkatan: "2023", status: "Aktif", ipk: 3.82, semester: 3 },
      { npm: "2422601007", nama: "Xavier Aditya", angkatan: "2024", status: "Aktif", ipk: 3.78, semester: 1 },
      { npm: "2422601008", nama: "Yanti Lestari", angkatan: "2024", status: "Aktif", ipk: 3.85, semester: 1 },
      { npm: "2222601009", nama: "Zainul Arifin", angkatan: "2022", status: "Aktif", ipk: 3.69, semester: 5 },
      { npm: "2322601010", nama: "Ayu Rahmawati", angkatan: "2023", status: "Aktif", ipk: 3.93, semester: 3 }
    ]
  },
  "manajemen": {
    nama: "Manajemen",
    kode: "45301",
    jenjang: "S1",
    akreditasi: "Unggul",
    fakultas: "Fakultas Ekonomi dan Bisnis",
    visi: "Menjadi program studi Manajemen yang unggul dalam menghasilkan lulusan yang kompeten, berdaya saing global, dan berjiwa entrepreneur pada tahun 2025.",
    misi: [
      "Menyelenggarakan pendidikan berkualitas di bidang manajemen bisnis",
      "Melakukan penelitian yang inovatif untuk pengembangan ilmu manajemen",
      "Melaksanakan pengabdian masyarakat berbasis kewirausahaan",
      "Membangun kerjasama strategis dengan dunia usaha dan industri"
    ],
    deskripsi: "Program Studi Manajemen FEB Unila telah berdiri sejak tahun 1985 dan konsisten menghasilkan lulusan yang siap berkarir di dunia bisnis. Program studi ini fokus pada pengembangan kompetensi manajemen strategis, keuangan, pemasaran, SDM, dan kewirausahaan.",
    prospekKarir: [
      "Manager/Supervisor",
      "Business Analyst",
      "Marketing Manager",
      "Human Resource Manager",
      "Financial Analyst",
      "Entrepreneur/Business Owner",
      "Management Consultant",
      "Product Manager"
    ],
    dosenTetap: 22,
    dosenTidakTetap: 6,
    mahasiswa: 856,
    rasio: "1:30.6",
    gelarLulusan: "S.M. (Sarjana Manajemen)",
    lamaMasaStudi: "4 tahun (8 semester)",
    totalSKS: 144,
    website: "https://manajemen.feb.unila.ac.id",
    email: "manajemen@feb.unila.ac.id",
    telepon: "(0721) 773465",
    kurikulum: [
      "Manajemen Strategis",
      "Manajemen Keuangan",
      "Manajemen Pemasaran",
      "Manajemen SDM",
      "Manajemen Operasional",
      "Kewirausahaan",
      "Business Analytics",
      "Digital Marketing",
      "Manajemen Risiko",
      "E-Commerce"
    ],
    fasilitas: [
      "Trading Floor Simulation Lab",
      "Business Incubator Center",
      "Digital Marketing Lab",
      "Computer Lab",
      "Business Library",
      "Auditorium",
      "Co-working Space",
      "Seminar Room"
    ],
    prestasi: [
      "Juara 1 Business Plan Competition 2024",
      "Champion National Marketing Competition",
      "Best Startup Award 2023",
      "Top 10 Wirausaha Muda Berprestasi"
    ],
    daftarDosen: [
      { nidn: "0012056801", nama: "Prof. Dr. Suherman, S.E., M.M.", jabatan: "Guru Besar", bidangKeahlian: "Strategic Management", email: "suherman@feb.unila.ac.id" },
      { nidn: "0018067502", nama: "Dr. Rina Andriani, S.E., M.Si.", jabatan: "Lektor Kepala", bidangKeahlian: "Human Resource Management", email: "rina.andriani@feb.unila.ac.id" },
      { nidn: "0025078703", nama: "Dr. Budi Hartono, S.E., M.M.", jabatan: "Lektor Kepala", bidangKeahlian: "Financial Management", email: "budi.hartono@feb.unila.ac.id" },
      { nidn: "0020058804", nama: "Dra. Nina Kurniawati, M.M.", jabatan: "Lektor", bidangKeahlian: "Marketing Management", email: "nina.kurniawati@feb.unila.ac.id" },
      { nidn: "0030069005", nama: "Dr. Eko Wijayanto, S.E., M.B.A.", jabatan: "Lektor Kepala", bidangKeahlian: "Entrepreneurship", email: "eko.wijayanto@feb.unila.ac.id" },
      { nidn: "0028088606", nama: "Dewi Sartika, S.E., M.M.", jabatan: "Asisten Ahli", bidangKeahlian: "Digital Marketing", email: "dewi.sartika@feb.unila.ac.id" },
      { nidn: "0022077907", nama: "Dr. Hadi Purnomo, S.E., M.Sc.", jabatan: "Lektor", bidangKeahlian: "Operations Management", email: "hadi.purnomo@feb.unila.ac.id" },
      { nidn: "0035099008", nama: "Lisa Amelia, S.E., M.M.", jabatan: "Asisten Ahli", bidangKeahlian: "Business Analytics", email: "lisa.amelia@feb.unila.ac.id" }
    ],
    daftarMahasiswa: [
      { npm: "2145301001", nama: "Bayu Anggara", angkatan: "2021", status: "Aktif", ipk: 3.68, semester: 7 },
      { npm: "2145301002", nama: "Cinta Ayu", angkatan: "2021", status: "Aktif", ipk: 3.87, semester: 7 },
      { npm: "2245301003", nama: "Danu Pamungkas", angkatan: "2022", status: "Aktif", ipk: 3.75, semester: 5 },
      { npm: "2245301004", nama: "Elsa Permata", angkatan: "2022", status: "Aktif", ipk: 3.92, semester: 5 },
      { npm: "2345301005", nama: "Fauzan Hakim", angkatan: "2023", status: "Aktif", ipk: 3.71, semester: 3 },
      { npm: "2345301006", nama: "Gina Safitri", angkatan: "2023", status: "Aktif", ipk: 3.84, semester: 3 },
      { npm: "2445301007", nama: "Haris Maulana", angkatan: "2024", status: "Aktif", ipk: 3.79, semester: 1 },
      { npm: "2445301008", nama: "Ika Puspa", angkatan: "2024", status: "Aktif", ipk: 3.88, semester: 1 },
      { npm: "2245301009", nama: "Jihan Nabila", angkatan: "2022", status: "Aktif", ipk: 3.66, semester: 5 },
      { npm: "2345301010", nama: "Kevin Pratama", angkatan: "2023", status: "Aktif", ipk: 3.90, semester: 3 }
    ]
  }
};

export default function ProfilProdi({ slug }: ProfilProdiProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const prodi = prodiData[slug] || prodiData["ilmu-komputer"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getAkreditasiColor = (akreditasi: string) => {
    if (akreditasi === "Unggul") return "success";
    if (akreditasi === "Baik Sekali") return "primary";
    return "default";
  };

  // Column definitions for Dosen DataTable
  const dosenColumns: Column<any>[] = [
    {
      key: "nidn",
      label: "NIDN",
      sortable: true,
      minWidth: "120px"
    },
    {
      key: "nama",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "250px",
      render: (item) => (
        <span className="font-semibold text-gray-800">{item.nama}</span>
      )
    },
    {
      key: "jabatan",
      label: "JABATAN",
      sortable: true,
      minWidth: "150px",
      render: (item) => (
        <Chip
          color={
            item.jabatan === "Guru Besar" ? "success" :
            item.jabatan === "Lektor Kepala" ? "primary" :
            item.jabatan === "Lektor" ? "secondary" : "default"
          }
          variant="flat"
          size="sm"
        >
          {item.jabatan}
        </Chip>
      )
    },
    {
      key: "bidangKeahlian",
      label: "BIDANG KEAHLIAN",
      sortable: true,
      minWidth: "200px"
    },
    {
      key: "email",
      label: "EMAIL",
      minWidth: "250px",
      render: (item) => (
        <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
          {item.email}
        </a>
      )
    }
  ];

  // Column definitions for Mahasiswa DataTable
  const mahasiswaColumns: Column<any>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      minWidth: "130px"
    },
    {
      key: "nama",
      label: "NAMA MAHASISWA",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <span className="font-semibold text-gray-800">{item.nama}</span>
      )
    },
    {
      key: "angkatan",
      label: "ANGKATAN",
      sortable: true,
      minWidth: "100px",
      render: (item) => (
        <Chip color="primary" variant="flat" size="sm">
          {item.angkatan}
        </Chip>
      )
    },
    {
      key: "semester",
      label: "SEMESTER",
      sortable: true,
      minWidth: "100px",
      render: (item) => (
        <span className="font-semibold">{item.semester}</span>
      )
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      minWidth: "100px",
      render: (item) => (
        <Chip
          color={item.status === "Aktif" ? "success" : "warning"}
          variant="flat"
          size="sm"
        >
          {item.status}
        </Chip>
      )
    },
    {
      key: "ipk",
      label: "IPK",
      sortable: true,
      minWidth: "80px",
      render: (item) => (
        <span className={`font-bold ${
          item.ipk >= 3.5 ? "text-green-600" :
          item.ipk >= 3.0 ? "text-blue-600" :
          item.ipk >= 2.5 ? "text-yellow-600" : "text-red-600"
        }`}>
          {item.ipk.toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Chip color={getAkreditasiColor(prodi.akreditasi)} variant="flat" size="lg" className="font-semibold">
                  Akreditasi {prodi.akreditasi}
                </Chip>
                <Chip color="warning" variant="flat" size="lg" className="font-semibold">
                  {prodi.jenjang}
                </Chip>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{prodi.nama}</h1>
              <p className="text-xl text-white/90 mb-6">{prodi.fakultas}</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="font-semibold">{prodi.mahasiswa} Mahasiswa</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="font-semibold">{prodi.dosenTetap + prodi.dosenTidakTetap} Dosen</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block"
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Informasi Singkat</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Kode Program Studi</span>
                      <span className="font-bold text-white">{prodi.kode}</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Gelar Lulusan</span>
                      <span className="font-bold text-white">{prodi.gelarLulusan}</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Masa Studi</span>
                      <span className="font-bold text-white">{prodi.lamaMasaStudi}</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total SKS</span>
                      <span className="font-bold text-white">{prodi.totalSKS} SKS</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="underlined"
              color="primary"
              size="lg"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-gradient-to-r from-blue-600 to-indigo-600",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-blue-600 font-semibold"
              }}
            >
              <Tab key="overview" title="Overview" />
              <Tab key="kurikulum" title="Kurikulum" />
              <Tab key="karir" title="Prospek Karir" />
              <Tab key="fasilitas" title="Fasilitas" />
              <Tab key="prestasi" title="Prestasi" />
              <Tab key="dosen" title="Dosen" />
              <Tab key="mahasiswa" title="Mahasiswa" />
              <Tab key="kontak" title="Kontak" />
            </Tabs>
          </motion.div>

          {/* Tab Content */}
          {selectedTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="shadow-lg">
                    <CardBody className="p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang Program Studi</h2>
                      <p className="text-gray-600 leading-relaxed mb-6">{prodi.deskripsi}</p>

                      <h3 className="text-xl font-bold text-gray-800 mb-3">Visi</h3>
                      <p className="text-gray-600 leading-relaxed mb-6 pl-4 border-l-4 border-blue-500 italic">{prodi.visi}</p>

                      <h3 className="text-xl font-bold text-gray-800 mb-3">Misi</h3>
                      <ul className="space-y-2">
                        {prodi.misi.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0"></div>
                            <span className="text-gray-600 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                    <CardBody className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Statistik Program Studi</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Dosen Tetap</p>
                            <p className="text-2xl font-bold text-blue-600">{prodi.dosenTetap}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Mahasiswa Aktif</p>
                            <p className="text-2xl font-bold text-indigo-600">{prodi.mahasiswa}</p>
                          </div>
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Rasio Dosen:Mahasiswa</p>
                            <p className="text-2xl font-bold text-purple-600">{prodi.rasio}</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="shadow-lg">
                    <CardBody className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                      <div className="space-y-2">
                        <Button
                          as="a"
                          href={prodi.website}
                          target="_blank"
                          className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          startContent={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          }
                        >
                          Website Program Studi
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="bordered"
                          startContent={
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                          }
                        >
                          Download Brosur
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="bordered"
                          startContent={
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          }
                        >
                          Panduan Pendaftaran
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}

          {selectedTab === "kurikulum" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Mata Kuliah Unggulan</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prodi.kurikulum.map((mk: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 leading-tight">{mk}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "karir" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Prospek Karir Lulusan</h2>
                  <p className="text-gray-600 mb-6">Berbagai peluang karir menanti lulusan program studi ini</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {prodi.prospekKarir.map((karir: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-blue-300 transition-all hover:shadow-md group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-800">{karir}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "fasilitas" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Fasilitas Pendukung</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prodi.fasilitas.map((fasilitas: string, index: number) => (
                      <div
                        key={index}
                        className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all text-center hover:shadow-lg group"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm leading-tight">{fasilitas}</h4>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "prestasi" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Prestasi Terkini</h2>
                  <div className="space-y-4">
                    {prodi.prestasi.map((prestasi: string, index: number) => (
                      <div
                        key={index}
                        className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{prestasi}</h4>
                            <p className="text-sm text-gray-600">Pencapaian mahasiswa program studi</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "dosen" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Daftar Dosen</h2>
                    <p className="text-gray-600">
                      Dosen-dosen berkualitas dan berpengalaman yang mengajar di Program Studi {prodi.nama}
                    </p>
                  </div>
                  <DataTable
                    data={prodi.daftarDosen || []}
                    columns={dosenColumns}
                    searchable
                    searchPlaceholder="Cari dosen..."
                    itemsPerPage={10}
                    emptyMessage="Belum ada data dosen"
                  />
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "mahasiswa" && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardBody className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Daftar Mahasiswa</h2>
                    <p className="text-gray-600">
                      Mahasiswa aktif yang terdaftar di Program Studi {prodi.nama}
                    </p>
                  </div>
                  <DataTable
                    data={prodi.daftarMahasiswa || []}
                    columns={mahasiswaColumns}
                    searchable
                    searchPlaceholder="Cari mahasiswa..."
                    itemsPerPage={10}
                    emptyMessage="Belum ada data mahasiswa"
                  />
                </CardBody>
              </Card>
            </motion.div>
          )}

          {selectedTab === "kontak" && (
            <motion.div variants={itemVariants}>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                  <CardBody className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Hubungi Kami</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                          <a href={`mailto:${prodi.email}`} className="text-blue-600 hover:underline">{prodi.email}</a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Telepon</h4>
                          <a href={`tel:${prodi.telepon}`} className="text-gray-600">{prodi.telepon}</a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Website</h4>
                          <a href={prodi.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{prodi.website}</a>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <CardBody className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Tertarik Bergabung?</h2>
                    <p className="mb-6 text-white/90">
                      Daftarkan diri Anda dan jadilah bagian dari program studi {prodi.nama} yang berkualitas.
                    </p>
                    <Button
                      size="lg"
                      className="w-full bg-white text-blue-600 font-bold hover:bg-gray-50"
                    >
                      Daftar Sekarang
                    </Button>
                    <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                      <p className="text-sm text-white/80 mb-2">Gelombang Pendaftaran:</p>
                      <p className="font-bold text-lg">SNBP & SNBT 2025</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
