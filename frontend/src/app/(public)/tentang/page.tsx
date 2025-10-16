import { PageHero } from "@/shared/components";
import TentangmyUnila from "@/shared/components/tentang/TentangMyUnila";
import FiturIntegrasi from "@/shared/components/tentang/FiturIntegrasi";
import TimelinePengembangan from "@/shared/components/tentang/TimelinePengembangan";
import StrukturTim from "@/shared/components/tentang/StrukturTim";

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

      {/* Brand Guidelines CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                {/* Left Side - Icon & Decoration */}
                <div className="md:w-2/5 bg-gradient-to-br from-myunila to-blue-700 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <svg
                      className="w-24 h-24 text-white mx-auto mb-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-2xl font-bold text-white">Brand Guidelines</h3>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="md:w-3/5 p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Panduan Identitas Visual myUnila
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Dokumentasi lengkap tentang logo, warna, typography, dan komponen UI untuk
                    memastikan konsistensi brand di seluruh platform dan sistem yang menggunakan
                    identitas myUnila.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-myunila" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">Download logo dalam berbagai format (SVG, PNG)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-myunila" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">Palette warna lengkap dengan kode HEX & RGB</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-myunila" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">Font, typography, dan komponen UI siap pakai</span>
                    </div>
                  </div>

                  <a
                    href="/brand"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-myunila to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <span>Lihat Brand Guidelines</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Tim Section */}
      <StrukturTim />
    </div>
  );
}
