"use client";

import { PageHero } from "@/shared/components";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { submitSurvey } from "@/lib/services/public/surveyService";

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // A. Identitas
    status: "",
    status_lainnya: "",
    unit_fakultas: "",
    lama_kampus: "",

    // B. Kondisi Saat Ini
    menggunakan_sistem: "",
    sistem_digunakan: "",
    kendala: [] as string[],
    kendala_lainnya: "",
    freq_dosen: "",
    freq_mahasiswa: "",
    freq_staf: "",
    freq_akademik: "",
    freq_tridarma: "",

    // C. Kebutuhan Fitur
    fitur_wajib: [] as string[],
    fitur_lainnya: "",
    modul_prioritas: "",
    akses_pengguna: [] as string[],
    akses_lainnya: "",

    // D. Harapan
    harapan: [] as string[],
    harapan_lainnya: "",
    pentingnya_portal: "",
    harapan_ui: "",

    // E. Saran
    tantangan: "",
    ide_penting: "",
    ideal_tim: "",

    // F. Kontak
    nama: "",
    kontak: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  const steps = [
    { id: "A", title: "Identitas", icon: "👤", color: "blue" },
    { id: "B", title: "Kondisi Saat Ini", icon: "📊", color: "indigo" },
    { id: "C", title: "Kebutuhan Fitur", icon: "⚙️", color: "purple" },
    { id: "D", title: "Harapan", icon: "✨", color: "emerald" },
    { id: "E", title: "Saran", icon: "💡", color: "amber" },
    { id: "F", title: "Kontak", icon: "📧", color: "gray" },
  ];

  // Progress berdasar field yang sudah diisi, BUKAN posisi step. Sebelumnya
  // pakai (currentStep + 1) / total → step 0 langsung 16% padahal user belum
  // isi apapun. User bingung; sekarang 0% saat fresh, 100% saat semua field
  // primary terisi.
  const stringFields: (keyof typeof formData)[] = [
    'status', 'unit_fakultas', 'lama_kampus',
    'menggunakan_sistem', 'sistem_digunakan',
    'freq_dosen', 'freq_mahasiswa', 'freq_staf', 'freq_akademik', 'freq_tridarma',
    'modul_prioritas', 'pentingnya_portal', 'harapan_ui',
    'tantangan', 'ide_penting', 'ideal_tim',
  ];
  const arrayFields: (keyof typeof formData)[] = [
    'kendala', 'fitur_wajib', 'akses_pengguna', 'harapan',
  ];
  const totalFields = stringFields.length + arrayFields.length;
  const filledCount =
    stringFields.filter((k) => ((formData[k] as string) || '').trim() !== '').length +
    arrayFields.filter((k) => ((formData[k] as string[]) || []).length > 0).length;
  const progress = (filledCount / totalFields) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const checkboxName = name.replace("[]", "");

      setFormData(prev => ({
        ...prev,
        [checkboxName]: checked
          ? [...(prev[checkboxName as keyof typeof prev] as string[]), value]
          : (prev[checkboxName as keyof typeof prev] as string[]).filter((item: string) => item !== value)
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000); // seconds

      const result = await submitSurvey(
        'myunila-kepuasan-kebutuhan-2025',
        formData,
        { completion_time: completionTime }
      );

      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(result.message || 'Gagal mengirim survey. Silakan coba lagi.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      setSubmitError('Terjadi kesalahan jaringan. Silakan cek koneksi internet Anda.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  const motivationalMessages = [
    "Mantap! Anda sudah 17% selesai! 🎉",
    "Hebat! Setengah perjalanan sudah ditempuh! 🚀",
    "Hampir selesai! Tinggal sedikit lagi! 💪",
    "Luar biasa! Anda hampir finish! ⭐",
    "Sempurna! Satu langkah lagi! 🎯",
    "Terakhir! Anda luar biasa! 🏆",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHero
        title="Survey Kepuasan & Kebutuhan"
        subtitle="myUnila - Sistem Terintegrasi UNILA"
        description="Mari bersama kita ciptakan sistem informasi yang lebih baik! Butuh 10-12 menit saja 😊"
        gradient="from-blue-600 via-indigo-600 to-purple-600"
        icon={
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        }
      />

      <section className="py-12 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Terima Kasih! 🎉
                </h2>
                <p className="text-gray-600 text-lg mb-2">
                  Partisipasi Anda sangat berarti untuk pengembangan myUnila!
                </p>
                <p className="text-sm text-gray-500">
                  Tim kami akan menganalisis masukan Anda untuk sistem yang lebih baik
                </p>
                <div className="mt-8 flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setCurrentStep(0);
                      setFormData({
                        status: "", status_lainnya: "", unit_fakultas: "", lama_kampus: "",
                        menggunakan_sistem: "", sistem_digunakan: "", kendala: [], kendala_lainnya: "",
                        freq_dosen: "", freq_mahasiswa: "", freq_staf: "", freq_akademik: "", freq_tridarma: "",
                        fitur_wajib: [], fitur_lainnya: "", modul_prioritas: "", akses_pengguna: [], akses_lainnya: "",
                        harapan: [], harapan_lainnya: "", pentingnya_portal: "", harapan_ui: "",
                        tantangan: "", ide_penting: "", nama: "", kontak: "",
                      });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Isi Survey Lagi
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Progress Bar dengan Motivasi */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">Step {currentStep + 1} of {steps.length}</h3>
                      <p className="text-sm text-gray-600">{steps[currentStep].title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-xs text-gray-500">Selesai</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ x: [0, 100, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    />
                  </div>

                  {/* Motivational Message */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center"
                  >
                    <p className="text-sm font-semibold text-indigo-600">
                      {motivationalMessages[currentStep]}
                    </p>
                  </motion.div>
                </motion.div>

                {/* Step Indicators */}
                <div className="hidden md:flex justify-between mb-8 bg-white rounded-2xl shadow-lg p-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        index === currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-105 shadow-lg'
                          : index < currentStep
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <span className="text-xs font-semibold hidden lg:inline">{step.title}</span>
                      {index < currentStep && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {/* Error Message */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-800 mb-1">Terjadi Kesalahan</h4>
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 min-h-[500px]"
                    >
                      {/* Step A - Identitas */}
                      {currentStep === 0 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">👤</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Identitas Responden</h2>
                            <p className="text-gray-600">Ceritakan sedikit tentang diri Anda</p>
                          </div>

                          {/* 1. Status */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              1. Status Anda <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {["Dosen", "Mahasiswa", "Staf Administrasi", "Pimpinan / Manajerial"].map((option) => (
                                <motion.label
                                  key={option}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                    formData.status === option
                                      ? 'border-blue-500 bg-blue-50 shadow-md'
                                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="status"
                                    value={option}
                                    checked={formData.status === option}
                                    onChange={handleChange}
                                    required
                                    className="sr-only"
                                  />
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      formData.status === option ? 'border-blue-500' : 'border-gray-300'
                                    }`}>
                                      {formData.status === option && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                      )}
                                    </div>
                                    <span className={`text-sm font-medium ${
                                      formData.status === option ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                  </div>
                                </motion.label>
                              ))}
                              <div className="col-span-2 md:col-span-3">
                                <input
                                  type="text"
                                  name="status_lainnya"
                                  value={formData.status_lainnya}
                                  onChange={handleChange}
                                  placeholder="Lainnya (sebutkan)"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Unit/Fakultas */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              2. Unit/Fakultas/Jurusan <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="unit_fakultas"
                              value={formData.unit_fakultas}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Contoh: Fakultas Teknik / Jurusan Informatika"
                            />
                          </div>

                          {/* 3. Lama bekerja/belajar */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              3. Lama bekerja/belajar di kampus <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {["< 1 tahun", "1–3 tahun", "3–5 tahun", "> 5 tahun"].map((option) => (
                                <motion.label
                                  key={option}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${
                                    formData.lama_kampus === option
                                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="lama_kampus"
                                    value={option}
                                    checked={formData.lama_kampus === option}
                                    onChange={handleChange}
                                    required
                                    className="sr-only"
                                  />
                                  <span className={`text-sm font-semibold ${
                                    formData.lama_kampus === option ? 'text-blue-700' : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                </motion.label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step B - Kondisi Saat Ini */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📊</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kondisi Saat Ini</h2>
                            <p className="text-gray-600">Bagaimana pengalaman Anda dengan sistem yang ada?</p>
                          </div>

                          {/* 4. Menggunakan sistem */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              4. Apakah Anda menggunakan beberapa sistem berbeda? <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              {["Ya", "Tidak"].map((option) => (
                                <motion.label
                                  key={option}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`cursor-pointer p-6 rounded-xl border-2 text-center transition-all ${
                                    formData.menggunakan_sistem === option
                                      ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                      : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="menggunakan_sistem"
                                    value={option}
                                    checked={formData.menggunakan_sistem === option}
                                    onChange={handleChange}
                                    required
                                    className="sr-only"
                                  />
                                  <span className={`text-3xl block mb-2`}>
                                    {option === "Ya" ? "✅" : "❌"}
                                  </span>
                                  <span className={`text-lg font-bold ${
                                    formData.menggunakan_sistem === option ? 'text-indigo-700' : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                </motion.label>
                              ))}
                            </div>
                          </div>

                          {/* Conditional: Sebutkan sistem */}
                          {formData.menggunakan_sistem === "Ya" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="bg-indigo-50 p-6 rounded-xl"
                            >
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sebutkan sistem yang sering Anda gunakan
                              </label>
                              <textarea
                                name="sistem_digunakan"
                                value={formData.sistem_digunakan}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Contoh: Siakadu, SISTER, SIMPONILA, dll."
                              />
                            </motion.div>
                          )}

                          {/* 5. TABEL FREKUENSI - PERTANYAAN YANG HILANG! */}
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              5. Seberapa sering Anda mengakses jenis data berikut dalam pekerjaan/aktivitas Anda? <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-4">
                              💡 Pilih tingkat frekuensi untuk setiap jenis data
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                                <thead>
                                  <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                                    <th className="border border-indigo-200 px-3 py-3 text-left text-xs font-bold">
                                      Jenis Data
                                    </th>
                                    {["Tidak Pernah", "Jarang", "Kadang", "Sering", "Sangat Sering"].map((freq) => (
                                      <th key={freq} className="border border-indigo-200 px-2 py-3 text-center text-xs font-bold">
                                        {freq}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { key: "freq_dosen", label: "Data Dosen" },
                                    { key: "freq_mahasiswa", label: "Data Mahasiswa" },
                                    { key: "freq_staf", label: "Data Staf" },
                                    { key: "freq_akademik", label: "Data Akademik (jadwal, KRS, nilai, dll.)" },
                                    { key: "freq_tridarma", label: "Data Tridarma (penelitian, publikasi, pengabdian)" },
                                  ].map((row, idx) => (
                                    <tr key={row.key} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-colors`}>
                                      <td className="border border-indigo-200 px-3 py-3 text-sm text-gray-700 font-medium">
                                        {row.label}
                                      </td>
                                      {["Tidak Pernah", "Jarang", "Kadang", "Sering", "Sangat Sering"].map((freq) => (
                                        <td key={freq} className="border border-indigo-200 px-2 py-3 text-center">
                                          <input
                                            type="radio"
                                            name={row.key}
                                            value={freq}
                                            checked={formData[row.key as keyof typeof formData] === freq}
                                            onChange={handleChange}
                                            required
                                            className="w-5 h-5 text-indigo-600 cursor-pointer"
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="mt-3 text-xs text-indigo-600 font-medium">
                              ✅ Pilih satu frekuensi untuk setiap jenis data
                            </p>
                          </div>

                          {/* 6. Kendala */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              6. Apa kendala utama? (pilih yang sesuai)
                            </label>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                              {[
                                { text: "Data tidak terhubung antar sistem", emoji: "🔗" },
                                { text: "Penginputan data berulang", emoji: "🔄" },
                                { text: "Kesulitan mencari data", emoji: "🔍" },
                                { text: "Tampilan tidak intuitif", emoji: "🎨" },
                                { text: "Akses lambat / error", emoji: "🐌" },
                                { text: "Kurang pelatihan", emoji: "📚" },
                                { text: "Hak akses membingungkan", emoji: "🔐" },
                              ].map((option) => (
                                <motion.label
                                  key={option.text}
                                  whileHover={{ x: 5 }}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.kendala.includes(option.text)
                                      ? 'border-indigo-500 bg-indigo-50'
                                      : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name="kendala[]"
                                    value={option.text}
                                    checked={formData.kendala.includes(option.text)}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="text-xl">{option.emoji}</span>
                                  <span className="text-sm text-gray-700 flex-1">{option.text}</span>
                                </motion.label>
                              ))}
                            </div>
                            <div className="mt-3">
                              <input
                                type="text"
                                name="kendala_lainnya"
                                value={formData.kendala_lainnya}
                                onChange={handleChange}
                                placeholder="Kendala lainnya (sebutkan)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step C - Kebutuhan Fitur */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">⚙️</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kebutuhan Fitur</h2>
                            <p className="text-gray-600">Fitur apa yang Anda butuhkan?</p>
                          </div>

                          {/* 7. Fitur Wajib */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              7. Pilih fitur yang Anda anggap penting
                            </label>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                              {[
                                { text: "Dashboard ringkasan", emoji: "📊" },
                                { text: "Integrasi data akademik", emoji: "🎓" },
                                { text: "Rekam jejak tridarma", emoji: "📝" },
                                { text: "Laporan otomatis (PDF/Excel)", emoji: "📄" },
                                { text: "Pencarian cepat", emoji: "🔍" },
                                { text: "Notifikasi otomatis", emoji: "🔔" },
                                { text: "Upload dokumen", emoji: "📁" },
                                { text: "Manajemen alumni", emoji: "👥" },
                                { text: "API integrasi eksternal", emoji: "🔌" },
                                { text: "Hak akses berbasis peran", emoji: "🔐" },
                                { text: "Audit log", emoji: "📋" },
                                { text: "Backup otomatis", emoji: "💾" },
                              ].map((option) => (
                                <motion.label
                                  key={option.text}
                                  whileHover={{ x: 5 }}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.fitur_wajib.includes(option.text)
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name="fitur_wajib[]"
                                    value={option.text}
                                    checked={formData.fitur_wajib.includes(option.text)}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-purple-600 rounded"
                                  />
                                  <span className="text-xl">{option.emoji}</span>
                                  <span className="text-sm text-gray-700 flex-1">{option.text}</span>
                                </motion.label>
                              ))}
                            </div>
                            <div className="mt-3">
                              <input
                                type="text"
                                name="fitur_lainnya"
                                value={formData.fitur_lainnya}
                                onChange={handleChange}
                                placeholder="Fitur lainnya (sebutkan)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            {formData.fitur_wajib.length > 0 && (
                              <p className="mt-3 text-sm text-purple-600 font-medium">
                                ✨ {formData.fitur_wajib.length} fitur dipilih
                              </p>
                            )}
                          </div>

                          {/* 8. Modul Prioritas */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              8. Modul mana yang paling penting? (opsional)
                            </label>
                            <textarea
                              name="modul_prioritas"
                              value={formData.modul_prioritas}
                              onChange={handleChange}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                              placeholder="Ceritakan modul prioritas Anda..."
                            />
                          </div>

                          {/* 9. AKSES PENGGUNA - PERTANYAAN YANG HILANG! */}
                          <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              9. Siapa yang perlu akses ke data ini? (centang semua yang berlaku)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { text: "Dosen", emoji: "👨‍🏫" },
                                { text: "Mahasiswa", emoji: "🎓" },
                                { text: "Staf administrasi", emoji: "👔" },
                                { text: "Pimpinan", emoji: "👨‍💼" },
                                { text: "Alumni", emoji: "🎖️" },
                              ].map((option) => (
                                <motion.label
                                  key={option.text}
                                  whileHover={{ scale: 1.02 }}
                                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.akses_pengguna.includes(option.text)
                                      ? 'border-purple-500 bg-purple-100'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name="akses_pengguna[]"
                                    value={option.text}
                                    checked={formData.akses_pengguna.includes(option.text)}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-purple-600 rounded"
                                  />
                                  <span className="text-xl">{option.emoji}</span>
                                  <span className="text-sm font-medium text-gray-700">{option.text}</span>
                                </motion.label>
                              ))}
                            </div>
                            <div className="mt-3">
                              <input
                                type="text"
                                name="akses_lainnya"
                                value={formData.akses_lainnya}
                                onChange={handleChange}
                                placeholder="Lainnya (sebutkan)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step D - Harapan */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">✨</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Harapan Anda</h2>
                            <p className="text-gray-600">Apa yang Anda harapkan dari myUnila?</p>
                          </div>

                          {/* 10. Harapan (max 3) */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              10. Pilih minimal 1, maksimal 5 harapan terpenting Anda <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              {[
                                "Akses data lintas unit",
                                "Data akurat real-time",
                                "Kurangi duplikasi input",
                                "Efisiensi kerja lebih baik",
                                "Visualisasi data mudah dipahami",
                                "Integrasi SISTER/PDDikti",
                                "Keamanan data tinggi",
                                "Akses dari mana saja",
                              ].map((option) => (
                                <motion.label
                                  key={option}
                                  whileHover={{ x: 5 }}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.harapan.includes(option)
                                      ? 'border-emerald-500 bg-emerald-50'
                                      : formData.harapan.length >= 5
                                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                      : 'border-gray-200 hover:border-emerald-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name="harapan[]"
                                    value={option}
                                    checked={formData.harapan.includes(option)}
                                    onChange={handleChange}
                                    disabled={formData.harapan.length >= 5 && !formData.harapan.includes(option)}
                                    className="w-5 h-5 text-emerald-600 rounded disabled:opacity-50"
                                  />
                                  <span className="text-sm text-gray-700 flex-1">{option}</span>
                                  {formData.harapan.includes(option) && (
                                    <span className="text-emerald-600 font-bold">✓</span>
                                  )}
                                </motion.label>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <div
                                    key={num}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      formData.harapan.length >= num
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {formData.harapan.length}/5 dipilih
                              </span>
                            </div>
                          </div>

                          {/* 11. HARAPAN LAINNYA - YANG HILANG! */}
                          <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              11. Harapan lainnya (opsional)
                            </label>
                            <textarea
                              name="harapan_lainnya"
                              value={formData.harapan_lainnya}
                              onChange={handleChange}
                              rows={2}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
                              placeholder="Tuliskan harapan lainnya yang tidak tercantum di atas..."
                            />
                          </div>

                          {/* 12. Portal Terpadu */}
                          <div className="bg-emerald-50 p-6 rounded-xl">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              12. Seberapa penting menurut Anda memiliki satu portal terpadu untuk seluruh data dan layanan UNILA? <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-600 mb-4">
                              💡 Berikan penilaian pentingnya integrasi sistem dalam satu portal
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {["Tidak Penting", "Kurang Penting", "Cukup Penting", "Penting", "Sangat Penting"].map((option, idx) => (
                                <motion.label
                                  key={option}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                    formData.pentingnya_portal === option
                                      ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                      : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="pentingnya_portal"
                                    value={option}
                                    checked={formData.pentingnya_portal === option}
                                    onChange={handleChange}
                                    required
                                    className="sr-only"
                                  />
                                  {"⭐".repeat(idx + 1)} {option.split(" ")[formData.pentingnya_portal === option ? 0 : 1]}
                                </motion.label>
                              ))}
                            </div>
                          </div>

                          {/* 13. UI/UX Harapan */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              13. Harapan UI/UX <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { text: "Sederhana & mudah", icon: "🎯" },
                                { text: "Lengkap & canggih", icon: "⚡" },
                                { text: "Interaktif & menarik", icon: "🎨" },
                                { text: "Konsisten dengan sistem lain", icon: "🔄" },
                              ].map((option) => (
                                <motion.label
                                  key={option.text}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                    formData.harapan_ui === option.text
                                      ? 'border-emerald-500 bg-emerald-50'
                                      : 'border-gray-200 hover:border-emerald-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="harapan_ui"
                                    value={option.text}
                                    checked={formData.harapan_ui === option.text}
                                    onChange={handleChange}
                                    required
                                    className="sr-only"
                                  />
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{option.icon}</span>
                                    <span className="text-sm font-medium">{option.text}</span>
                                  </div>
                                </motion.label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step E - Saran */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">💡</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Saran & Masukan</h2>
                            <p className="text-gray-600">Ide Anda sangat berharga!</p>
                          </div>

                          {/* 14. Tantangan */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              14. Tantangan terbesar dalam membangun sistem terintegrasi?
                            </label>
                            <textarea
                              name="tantangan"
                              value={formData.tantangan}
                              onChange={handleChange}
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                              placeholder="Bagikan pandangan Anda..."
                            />
                          </div>

                          {/* 15. Ide Penting */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              15. Satu ide penting untuk myUnila?
                            </label>
                            <textarea
                              name="ide_penting"
                              value={formData.ide_penting}
                              onChange={handleChange}
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                              placeholder="Ide terbaik Anda..."
                            />
                          </div>

                          {/* 16. Ideal Tim */}
                          <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              16. Menurut Anda, berapa ideal jumlah tim pengembang (developer, designer, tester, dll.) untuk mengembangkan dan maintain myUnila secara optimal?
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { value: "1-3 orang", icon: "👤", color: "blue" },
                                { value: "4-6 orang", icon: "👥", color: "indigo" },
                                { value: "7-10 orang", icon: "👨‍👩‍👧‍👦", color: "purple" },
                                { value: "> 10 orang", icon: "👨‍👩‍👧‍👦👨‍👩‍👧‍👦", color: "amber" },
                              ].map((option) => (
                                <motion.label
                                  key={option.value}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                                    formData.ideal_tim === option.value
                                      ? `border-${option.color}-500 bg-${option.color}-50`
                                      : 'border-gray-200 hover:border-amber-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="ideal_tim"
                                    value={option.value}
                                    checked={formData.ideal_tim === option.value}
                                    onChange={handleChange}
                                    className="sr-only"
                                  />
                                  <div className="text-3xl mb-2">{option.icon}</div>
                                  <div className="text-sm font-medium text-gray-700">{option.value}</div>
                                </motion.label>
                              ))}
                            </div>
                            <p className="mt-3 text-xs text-amber-600 font-medium">
                              💡 Estimasi tim ideal untuk development, maintenance, dan support
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step F - Kontak */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📧</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kontak (Opsional)</h2>
                            <p className="text-gray-600">Jika ingin kami hubungi untuk diskusi lebih lanjut</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama
                              </label>
                              <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500"
                                placeholder="Nama lengkap Anda"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email / HP
                              </label>
                              <input
                                type="text"
                                name="kontak"
                                value={formData.kontak}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500"
                                placeholder="email@unila.ac.id"
                              />
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">🎉</div>
                              <div>
                                <h4 className="font-bold text-gray-800 mb-2">Hampir Selesai!</h4>
                                <p className="text-sm text-gray-600">
                                  Klik tombol "Kirim Survey" untuk menyelesaikan. Terima kasih atas partisipasi Anda!
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    {currentStep > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali
                      </motion.button>
                    )}

                    {currentStep < steps.length - 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={nextStep}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Lanjut
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Kirim Survey
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>

                {/* Privacy Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100"
                >
                  <div className="flex items-start gap-2">
                    <div className="text-xl">🔒</div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Data Anda aman dan hanya digunakan untuk pengembangan myUnila
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
