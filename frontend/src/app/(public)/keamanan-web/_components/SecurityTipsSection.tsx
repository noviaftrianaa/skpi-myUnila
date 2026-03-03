"use client";

import { FiShield, FiAlertTriangle, FiPhone, FiMail, FiExternalLink } from "react-icons/fi";

const tips = [
    {
        icon: <FiShield className="w-6 h-6" />,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "Untuk Admin Website Unit",
        items: [
            "Perbarui CMS (WordPress/Blogger) secara rutin ke versi terbaru",
            "Gunakan password admin yang kuat dan aktifkan 2FA",
            "Periksa plugin/tema yang terpasang — hapus yang tidak digunakan",
            "Rutin backup database dan file website",
            "Pantau log akses untuk mendeteksi aktivitas mencurigakan",
        ],
    },
    {
        icon: <FiAlertTriangle className="w-6 h-6" />,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        title: "Ciri Website Terkena Serangan",
        items: [
            "Muncul halaman asing berisi konten judi/slot di website Anda",
            "Ada link atau redirect ke situs luar yang tidak Anda buat",
            "Google menampilkan warning 'Site may be hacked'",
            "Traffic website tiba-tiba naik drastis dari sumber tidak dikenal",
            "Terdapat user/admin baru yang tidak Anda daftarkan",
        ],
    },
];

export default function SecurityTipsSection() {
    return (
        <section className="py-10 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Panduan Keamanan Web</h2>
                        <p className="text-sm text-gray-500 mt-1">Tips menjaga keamanan website unit/fakultas Anda</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {tips.map((tip, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-11 h-11 rounded-xl ${tip.iconBg} ${tip.iconColor} flex items-center justify-center flex-shrink-0`}>
                                        {tip.icon}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-base">{tip.title}</h3>
                                </div>
                                <ul className="space-y-2">
                                    {tip.items.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Report section */}
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <h3 className="font-bold text-red-800 text-base mb-1">Website Anda Terkena Serangan?</h3>
                        <p className="text-sm text-red-700 mb-4">
                            Laporkan segera ke Tim Keamanan IT Unila agar dapat ditangani dan dihapus dari hasil pencarian Google.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="mailto:it@unila.ac.id"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <FiMail className="w-4 h-4" />
                                it@unila.ac.id
                            </a>
                            <a
                                href="tel:+627217951"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <FiPhone className="w-4 h-4" />
                                (0721) 795-1
                            </a>
                            <a
                                href="https://my.unila.ac.id/dashboard"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <FiExternalLink className="w-4 h-4" />
                                Portal MyUnila
                            </a>
                        </div>
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        Sistem monitoring ini dikelola oleh UPT Teknologi Informasi Universitas Lampung.
                        Data dipantau secara otomatis setiap hari.
                    </p>
                </div>
            </div>
        </section>
    );
}
