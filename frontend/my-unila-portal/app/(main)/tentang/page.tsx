import { PageHero } from "@/components";
import TentangmyUnila from "@/components/tentang/TentangMyUnila";
import FiturIntegrasi from "@/components/tentang/FiturIntegrasi";
import TimelinePengembangan from "@/components/tentang/TimelinePengembangan";
import StrukturTim from "@/components/tentang/StrukturTim";

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Tentang myUnila"
        subtitle="Sistem Informasi Terintegrasi Universitas Lampung"
        description="Portal terpadu yang mengintegrasikan 70+ sistem informasi untuk memberikan layanan digital terbaik bagi sivitas akademika Universitas Lampung."
        gradient="from-blue-600 via-indigo-600 to-purple-600"
        icon={
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        }
      />

      {/* Tentang myUnila Section */}
      <TentangmyUnila />

      {/* Fitur & Integrasi Section */}
      <FiturIntegrasi />

      {/* Timeline Pengembangan Section */}
      <TimelinePengembangan />

      {/* Struktur Tim Section */}
      <StrukturTim />
    </div>
  );
}
