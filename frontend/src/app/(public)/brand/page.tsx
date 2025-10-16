import { PageHero } from "@/shared/components";
import LogoSection from "@/shared/components/brand/LogoSection";
import ColorSection from "@/shared/components/brand/ColorSection";
import TypographySection from "@/shared/components/brand/TypographySection";
import ComponentSection from "@/shared/components/brand/ComponentSection";
import { Card, CardBody } from "@heroui/react";
import { FiDownload, FiCode, FiPackage } from "react-icons/fi";

export default function BrandGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Brand Guidelines"
        subtitle="Panduan Identitas Visual myUnila"
        description="Dokumentasi lengkap tentang penggunaan logo, warna, typography, dan komponen UI untuk memastikan konsistensi brand di seluruh platform."
        gradient="from-purple-600 via-indigo-600 to-blue-600"
        icon={
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
          </svg>
        }
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="mb-12">
          <Card className="border border-gray-200 bg-gradient-to-br from-myunila-50 to-blue-50">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Selamat Datang di Brand Guidelines myUnila
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Panduan ini dibuat untuk membantu Anda memahami dan menerapkan identitas visual myUnila dengan konsisten.
                Setiap elemen dari logo hingga komponen UI telah dirancang untuk menciptakan pengalaman yang kohesif
                dan profesional di seluruh platform digital Universitas Lampung.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <FiDownload className="w-8 h-8 text-myunila mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Download Assets</h3>
                  <p className="text-sm text-gray-600">
                    Logo, icon, dan aset visual lainnya
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <FiCode className="w-8 h-8 text-myunila mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Code Snippets</h3>
                  <p className="text-sm text-gray-600">
                    Copy-paste ready component code
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <FiPackage className="w-8 h-8 text-myunila mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">UI Components</h3>
                  <p className="text-sm text-gray-600">
                    Pre-styled components dengan brand
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filosofi Logo & Makna - Pindah ke Awal */}
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Filosofi Logo & Makna</h2>
            <p className="text-gray-600">
              Memahami makna di balik setiap elemen identitas visual myUnila.
            </p>
          </div>

          {/* Main Philosophy Card */}
          <Card className="border border-myunila-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 mb-6">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-6 mb-6">
                  <div className="text-myunila text-5xl font-bold">myUnila</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Arti Nama &ldquo;myUnila&rdquo;</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side - Breakdown */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Pemecahan Kata</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-5 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">my</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800 mb-1">my (milik saya)</h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Menunjukkan personalisasi dan kepemilikan. Setiap pengguna memiliki akses
                            personal ke sistem yang disesuaikan dengan kebutuhan masing-masing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-indigo-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800 mb-1">Unila (Universitas Lampung)</h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Identitas institusi yang jelas. Menandakan bahwa ini adalah sistem resmi
                            dari Universitas Lampung yang mencakup seluruh ekosistem kampus.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Meaning */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Makna Filosofis</h4>
                  <div className="bg-white rounded-xl p-6 border border-purple-200 mb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">🎯</div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Fokus pada Pengguna</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          &ldquo;my&rdquo; menempatkan pengguna sebagai pusat, mencerminkan komitmen
                          untuk memberikan pengalaman yang personal dan user-centric.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">🔗</div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Integrasi Menyeluruh</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Satu portal untuk semua layanan, menyatukan 70+ sistem dalam satu
                          identitas yang kohesif dan mudah diakses.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🏛️</div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Identitas Institusi</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Memperkuat brand Universitas Lampung sebagai institusi yang modern,
                          digital, dan mudah diakses oleh seluruh sivitas akademika.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Typography & Color Meaning */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Typography Philosophy */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">📝</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Font Poppins Bold</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Pemilihan font Poppins Bold bukan tanpa alasan
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Modern & Kontemporer</p>
                      <p className="text-xs text-gray-600">Font sans-serif yang bersih dan modern, mencerminkan transformasi digital</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Keterbacaan Tinggi</p>
                      <p className="text-xs text-gray-600">Mudah dibaca di berbagai ukuran layar, dari desktop hingga mobile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Profesional & Friendly</p>
                      <p className="text-xs text-gray-600">Kombinasi sempurna antara formal dan approachable</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Bold Weight</p>
                      <p className="text-xs text-gray-600">Mencerminkan kekuatan, kepercayaan diri, dan kredibilitas institusi</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Color Philosophy */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">🎨</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Warna Biru #0B5EA8</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Warna primer yang sarat makna dan filosofi
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Kepercayaan & Kredibilitas</p>
                      <p className="text-xs text-gray-600">Biru melambangkan kepercayaan, stabilitas, dan profesionalisme institusi pendidikan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Teknologi & Inovasi</p>
                      <p className="text-xs text-gray-600">Warna yang sering diasosiasikan dengan teknologi, digital, dan kemajuan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Ketenangan & Fokus</p>
                      <p className="text-xs text-gray-600">Memberikan efek menenangkan dan membantu pengguna fokus pada tugas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-myunila rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Universalitas</p>
                      <p className="text-xs text-gray-600">Warna yang diterima secara universal dan cocok untuk berbagai konteks</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Brand Principles */}
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Prinsip Brand myUnila</h2>
            <p className="text-gray-600">
              Nilai-nilai inti yang mendasari identitas visual myUnila.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Principle 1 */}
            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardBody className="p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sederhana</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Desain yang bersih dan mudah dipahami, memudahkan pengguna dalam berinteraksi dengan sistem.
                </p>
              </CardBody>
            </Card>

            {/* Principle 2 */}
            <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardBody className="p-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Terpercaya</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Mencerminkan kredibilitas dan profesionalisme institusi pendidikan tinggi.
                </p>
              </CardBody>
            </Card>

            {/* Principle 3 */}
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardBody className="p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Terintegrasi</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Menyatukan berbagai sistem dalam satu identitas visual yang kohesif dan harmonis.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Sections */}
        <div id="logo">
          <LogoSection />
        </div>

        <div id="colors">
          <ColorSection />
        </div>

        <div id="typography">
          <TypographySection />
        </div>

        <div id="components">
          <ComponentSection />
        </div>

        {/* Usage Examples */}
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Contoh Penggunaan</h2>
            <p className="text-gray-600">
              Lihat bagaimana brand myUnila diterapkan dalam berbagai konteks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Example 1: Website Header */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  Website Header
                </h3>
                <div className="bg-gradient-to-r from-myunila to-blue-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-xl font-bold">myUnila</div>
                    <div className="flex gap-2">
                      <div className="w-16 h-2 bg-white/30 rounded"></div>
                      <div className="w-16 h-2 bg-white/30 rounded"></div>
                      <div className="w-16 h-2 bg-white/30 rounded"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Logo dengan background gradient primary, kombinasi yang kuat dan profesional untuk header website.
                </p>
              </CardBody>
            </Card>

            {/* Example 2: Mobile App PWA */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Mobile Application (PWA)
                </h3>
                <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl p-3 mb-4 max-w-xs mx-auto relative" style={{height: '420px'}}>
                  {/* Status Bar */}
                  <div className="bg-white rounded-t-2xl px-4 py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-3 border border-gray-400 rounded-sm"></div>
                      <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="bg-white px-4 py-3 h-[calc(100%-100px)]">
                    <div className="text-center mb-4">
                      <div className="text-myunila text-xl font-bold">myUnila</div>
                      <div className="text-xs text-gray-500">Portal Terpadu</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-myunila-50 rounded-lg"></div>
                      <div className="h-8 bg-myunila-50 rounded-lg"></div>
                      <div className="h-8 bg-myunila-50 rounded-lg"></div>
                      <div className="h-8 bg-myunila-50 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="bg-white border-t border-gray-200 rounded-b-2xl px-4 py-3">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 bg-myunila rounded-lg"></div>
                        <span className="text-[8px] text-myunila font-semibold">Beranda</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                        <span className="text-[8px] text-gray-500">Favorit</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                        <span className="text-[8px] text-gray-500">Notif</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                        <span className="text-[8px] text-gray-500">Profil</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Layout PWA dengan bottom navigation yang responsif dan user-friendly.
                </p>
              </CardBody>
            </Card>

            {/* Example 3: Email Signature */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  Email Signature
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm">
                  <div className="font-semibold text-gray-800">Mizar Zulmi Ramadhan</div>
                  <div className="text-gray-600 text-xs mb-3">Developer - UPA TIK</div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="text-myunila font-bold text-base mb-1">myUnila</div>
                    <div className="text-gray-600 text-xs">Universitas Lampung</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Logo text-only untuk email signature yang profesional dan mudah dibaca.
                </p>
              </CardBody>
            </Card>

            {/* Example 4: Social Media */}
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Social Media Post
                </h3>
                <div className="bg-gradient-to-br from-myunila via-blue-600 to-indigo-600 rounded-lg p-6 mb-4 text-white text-center">
                  <div className="text-3xl font-bold mb-2">myUnila</div>
                  <div className="text-sm opacity-90 mb-4">Portal Satu Data Unila</div>
                  <div className="bg-white/20 backdrop-blur-sm rounded p-3 text-xs">
                    <div className="font-semibold mb-1">Update Terbaru</div>
                    <div className="opacity-90">70+ Sistem Terintegrasi</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Design untuk social media dengan gradient background yang eye-catching.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-12">
          <Card className="border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardBody className="p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Best Practices</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Selalu gunakan file logo original (SVG) untuk kualitas terbaik</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Pertahankan clear space minimal 20px di sekeliling logo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Gunakan warna dari palette yang telah ditentukan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Test tampilan di berbagai ukuran layar (responsive)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Konsultasikan dengan tim UPA TIK jika ragu</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Code Setup */}
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Code Setup</h2>
            <p className="text-gray-600">
              Cara mengimplementasikan brand guidelines di project baru.
            </p>
          </div>

          <Card className="border border-gray-200 mb-6">
            <CardBody className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tailwind Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tambahkan konfigurasi berikut ke <code className="bg-gray-100 px-2 py-1 rounded">tailwind.config.ts</code>:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`theme: {
  extend: {
    colors: {
      myunila: {
        DEFAULT: '#0B5EA8',
        50: '#E6F2FA',
        100: '#CCE5F5',
        200: '#99CBEB',
        300: '#66B1E1',
        400: '#3397D7',
        500: '#0B5EA8',
        600: '#094B86',
        700: '#073864',
        800: '#052542',
        900: '#021220',
      },
    },
    backgroundImage: {
      'gradient-blue-modern': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
      'gradient-ocean': 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
      'gradient-sky': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    },
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
    },
  },
}`}
              </pre>
            </CardBody>
          </Card>

          <Card className="border border-gray-200 mb-6">
            <CardBody className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Global CSS Classes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tambahkan ke <code className="bg-gray-100 px-2 py-1 rounded">globals.css</code>:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`@layer components {
  .btn-gradient-primary {
    @apply bg-gradient-blue-modern text-white font-semibold;
    @apply shadow-lg hover:shadow-xl transition-all duration-300;
    @apply hover:scale-105;
  }

  .text-gradient-primary {
    @apply bg-gradient-to-r from-myunila to-blue-700;
    @apply bg-clip-text text-transparent;
  }

  .card-elevated {
    @apply bg-white shadow-md hover:shadow-lg;
    @apply transition-shadow duration-300;
    @apply rounded-xl border border-gray-100;
  }
}`}
              </pre>
            </CardBody>
          </Card>

          <Card className="border border-gray-200">
            <CardBody className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Font Import</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tambahkan ke <code className="bg-gray-100 px-2 py-1 rounded">layout.tsx</code> atau <code className="bg-gray-100 px-2 py-1 rounded">_app.tsx</code>:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-poppins">{children}</body>
    </html>
  )
}`}
              </pre>
            </CardBody>
          </Card>
        </section>

        {/* Contact & Support */}
        <Card className="border border-myunila-200 bg-gradient-to-br from-myunila-50 to-blue-50">
          <CardBody className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Butuh Bantuan?
            </h3>
            <p className="text-gray-600 mb-6">
              Jika Anda memiliki pertanyaan atau membutuhkan aset tambahan,
              silakan hubungi tim UPA TIK Universitas Lampung.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:dev@unila.ac.id"
                className="inline-flex items-center justify-center px-6 py-3 bg-myunila text-white font-semibold rounded-lg hover:bg-myunila-700 transition-colors"
              >
                Email DEV UPA TIK
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
