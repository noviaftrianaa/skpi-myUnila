import { PageHero } from "@/components";
import SebaranMahasiswa from "@/components/SebaranMahasiswa";
import DataDosen from "@/components/DataDosen";
import PenelitianPublikasi from "@/components/PenelitianPublikasi";
import CapaianLulusan from "@/components/CapaianLulusan";
import KelulusanTepatWaktu from "@/components/statistik/KelulusanTepatWaktu";

export default function StatistikPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Statistik"
        subtitle="Data dan Informasi Universitas Lampung"
        description="Akses data statistik, laporan, dan visualisasi informasi akademik, kemahasiswaan, dan kelembagaan Universitas Lampung secara real-time."
        gradient="from-blue-600 via-indigo-600 to-purple-600"
        icon={
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        }
      />

      {/* Sebaran Mahasiswa Section - Data mahasiswa per jenjang dan fakultas */}
      <SebaranMahasiswa />

      {/* Data Dosen Section - Data dosen per fakultas dan jabatan */}
      <DataDosen />

      {/* Penelitian & Publikasi Section - Data publikasi, HAKI, penelitian */}
      <PenelitianPublikasi />

      {/* Kelulusan Tepat Waktu Section - Statistik kelulusan */}
      <KelulusanTepatWaktu />

      {/* Capaian Lulusan Section - Data lulusan dan IPK */}
      <CapaianLulusan />
    </div>
  );
}
