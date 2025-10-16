import {
  PageHero,
  AplikasiTerintegrasi
} from "@/shared/components";

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Layanan"
        subtitle="Layanan Digital Kampus Terpadu"
        description="Akses berbagai layanan kampus seperti administrasi, surat menyurat, legalisir, beasiswa, dan layanan kemahasiswaan lainnya secara online."
        gradient="from-blue-600 via-indigo-600 to-purple-600"
        icon={
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        }
      />

      {/* Aplikasi Terintegrasi Section */}
      <AplikasiTerintegrasi />
    </div>
  );
}
