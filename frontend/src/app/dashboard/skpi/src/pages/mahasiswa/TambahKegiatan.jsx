// src/pages/mahasiswa/TambahKegiatan.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Upload, Check, X, ChevronDown, Lock, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../../components/common/SidebarMahasiswa";

const STORAGE_KEY = "skpi_kegiatan";

const KATEGORI  = ["Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi", "Karya", "PKKMB Universitas"];
const TAHUN     = ["2025", "2024", "2023", "2022", "2021"];
const JABATAN   = ["Peserta", "Ketua", "Anggota", "Panitia", "Pembicara", "Juri"];
const TINGKATAN = ["Internasional", "Nasional", "Regional", "Provinsi", "Universitas", "Fakultas", "Jurusan"];
const DOSEN_PEMBIMBING = [
  "Dr. Eng. Admi Syarif",
  "Prof. Dr. Ir. Suharno, M.S.",
  "Ahmad Zakaria, Ph.D.",
  "Dr. Ryan Randy Suryono"
];

const getJabatanOptions = (kategori) => {
  if (kategori === "Lomba") return ["Peserta", "Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Harapan 3"];
  if (kategori === "Organisasi" || kategori === "Kepanitiaan") return ["Ketua", "Wakil Ketua", "Sekretaris", "Wakil Sekretaris", "Bendahara", "Wakil Bendahara", "Anggota", "Ketua Bidang / Koordinator / Departemen"];
  if (kategori === "Pelatihan" || kategori === "Seminar") return ["Narasumber / Pembicara", "Moderator", "Peserta"];
  if (kategori === "Publikasi") return ["Ketua", "Anggota"];
  return JABATAN;
};

function SelectField({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-left hover:border-[#1D4ED8] transition-colors font-poppins"
        >
          <span className={value ? "text-[#0F172A]" : "text-[#94A3B8]"}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-[14px] text-[#374151] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] transition-colors font-poppins"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins"
      />
    </div>
  );
}

const EMPTY_FORM = {
  judul: "", kategori: "", tahun: "", jabatan: "",
  tingkatan: "", nomorSertifikat: "", tanggalSertifikat: "", tautanSertifikat: "",
  pembimbing: "", bentukKarya: "",
};

export default function TambahKegiatan() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [file, setFile]       = useState(null);
  const [skFile, setSkFile]   = useState(null);
  const [anggotaTim, setAnggotaTim] = useState([{ nama: "", npm: "" }]);
  const [dragOver, setDragOver] = useState(false);
  const [skDragOver, setSkDragOver] = useState(false);
  const [error, setError]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef();
  const skFileRef = useRef();

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSkDrop = (e) => {
    e.preventDefault();
    setSkDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setSkFile(f);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setSkFile(null);
    setAnggotaTim([{ nama: "", npm: "" }]);
    setError("");
  };

  const handleAddAnggota = () => setAnggotaTim([...anggotaTim, { nama: "", npm: "" }]);
  const handleRemoveAnggota = (index) => setAnggotaTim(anggotaTim.filter((_, i) => i !== index));
  const handleChangeAnggota = (index, field, value) => {
    const newAnggota = [...anggotaTim];
    newAnggota[index][field] = value;
    setAnggotaTim(newAnggota);
  };

  // Konversi File ke base64 string
  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result); // hasil: "data:image/png;base64,..."
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(f);
    });

  const handleSubmit = async () => {
    if (!form.judul.trim()) { setError("Judul kegiatan wajib diisi."); return; }
    if (!form.kategori)     { setError("Kategori wajib dipilih."); return; }
    if (!form.tahun)        { setError("Tahun wajib dipilih."); return; }
    setError("");

    // Konversi file sertifikat ke base64 jika ada (karena ini prototype, kita batasi pembacaannya atau pakai dummy agar tidak quota exceeded)
    let certificateBase64 = null;
    let skBase64 = null;
    if (file) {
      certificateBase64 = "/Sertifikat.png"; // Gunakan dummy gambar agar tidak memakan localStorage
    }
    if (skFile && form.kategori === "Lomba") {
      skBase64 = "/Sertifikat.png";
    }

    // Baca data yang sudah ada dari localStorage
    let existing = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        existing = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      existing = [];
    }

    const newItem = {
      id:         Date.now(),
      title:      form.judul.trim(),
      date:       form.tanggalSertifikat || `${form.tahun}-01-01`,
      location:   "-",
      kategori:   form.kategori,
      tingkatan:  form.tingkatan,
      jabatan:    form.jabatan,
      nomorSertifikat:  form.nomorSertifikat,
      tautanSertifikat: form.tautanSertifikat,
      pembimbing: form.kategori === "Lomba" ? form.pembimbing : "",
      anggotaTim: form.kategori === "Lomba" ? anggotaTim.filter(a => a.nama.trim() || a.npm.trim()) : [],
      skFile:     skBase64,
      tags:        form.kategori === "Karya" ? ["Karya", form.bentukKarya].filter(Boolean) : [form.kategori, form.tingkatan].filter(Boolean),
      status:     form.kategori === "Karya" ? "Diarsipkan" : "Belum Diperiksa",
      statusColor: form.kategori === "Karya" ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-[#B45309] bg-[#FEF9C3]",
      dot:        form.kategori === "Karya" ? "bg-slate-400" : "bg-[#F59E0B]",
      poin:       null,
      certificate: certificateBase64, // null jika tidak ada file
      isNew:      true,
      createdAt:  Date.now(),
    };

    // Simpan ke localStorage — item terbaru di depan
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existing]));
    } catch (err) {
      setError("Gagal menyimpan data. File mungkin terlalu besar.");
      return;
    }

    setSuccessMsg("Kegiatan berhasil ditambahkan!");
    
    // Tunggu sebentar agar pesan sukses terlihat
    setTimeout(() => {
      setSuccessMsg("");
      handleReset();
      // Langsung arahkan ke halaman riwayat pengajuan atau data karya
      if (form.kategori === "Karya") {
        navigate("/data-karya");
      } else {
        navigate("/pengajuan");
      }
    }, 1500);
  };

  const isLocked = typeof window !== "undefined" ? localStorage.getItem("skpi_lock_2020021001") === "true" : false;

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-[26px] font-bold text-[#0F172A] mb-6 font-poppins">
          Tambahkan Kegiatan
        </h1>

        {isLocked ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-4xl text-center flex flex-col items-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm border border-red-100">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] font-poppins">Akses Ditutup: SKPI Terkunci</h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed font-poppins">
              Transkrip SKPI final Anda telah resmi diterbitkan oleh Program Studi. Anda tidak diperkenankan lagi untuk menambahkan data kegiatan baru ke dalam lembar SKPI Anda.
            </p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#374151] rounded-xl text-sm font-semibold transition active:scale-[0.98] font-poppins"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => navigate("/pengajuan")}
                className="px-6 py-3 bg-[#0B5EA8] hover:bg-[#073864] text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98] font-poppins"
              >
                Lihat Riwayat &amp; Transkrip
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl">

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-[13px] font-medium font-poppins flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="mb-5 px-4 py-3 bg-[#DCFCE7] text-[#16A34A] rounded-xl text-[13px] font-medium font-poppins flex items-center gap-2">
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          {/* Judul */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Award size={16} className="text-[#6D28D9]" />
              <label className="text-[13px] font-medium text-[#374151] font-poppins">
                Judul Kegiatan
              </label>
            </div>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => set("judul")(e.target.value)}
              placeholder="contoh: National Hackathon 2025"
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins"
            />
          </div>

          {/* Kategori + Tahun */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <SelectField label="Kategori"  options={KATEGORI} value={form.kategori}  onChange={set("kategori")}  placeholder="Pilih Kategori" />
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">Tahun</label>
              <input
                type="text"
                maxLength={4}
                value={form.tahun}
                onChange={(e) => setForm({ ...form, tahun: e.target.value.replace(/\D/g, '') })}
                placeholder="Pilih Tahun"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins"
              />
            </div>
          </div>

          {/* Jabatan + Tingkatan ATAU Bentuk Karya */}
          {form.kategori === "Karya" ? (
            <div className="mb-5">
              <SelectField label="Bentuk Karya" options={["Aplikasi / Software", "Karya Tulis / Jurnal", "Karya Seni / Desain", "Proyek Multimedia", "Lainnya"]} value={form.bentukKarya} onChange={set("bentukKarya")} placeholder="Pilih Bentuk Karya" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <SelectField label={form.kategori === "Lomba" ? "Prestasi / Pencapaian" : "Jabatan"} options={getJabatanOptions(form.kategori)} value={form.jabatan} onChange={set("jabatan")} placeholder={form.kategori === "Lomba" ? "Pilih Prestasi" : "Pilih Jabatan"} />
              <SelectField label="Tingkatan" options={TINGKATAN} value={form.tingkatan} onChange={set("tingkatan")} placeholder="Pilih Tingkatan" />
            </div>
          )}

          {/* Dosen Pembimbing (Hanya muncul jika kategori Lomba) */}
          {/* Dosen Pembimbing & Tim (Hanya muncul jika kategori Lomba) */}
          {form.kategori === "Lomba" && (
            <>
              <div className="mb-5">
                <SelectField label="Dosen Pembimbing Lomba (Opsional)" options={DOSEN_PEMBIMBING} value={form.pembimbing} onChange={set("pembimbing")} placeholder="Pilih Dosen Pembimbing" />
              </div>
              
              {/* Anggota Tim */}
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-[#374151] mb-2 font-poppins">Anggota Tim (Opsional)</label>
                {anggotaTim.map((anggota, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <input type="text" placeholder="Nama" value={anggota.nama} onChange={(e) => handleChangeAnggota(index, "nama", e.target.value)} className="w-1/2 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins" />
                    <input type="text" placeholder="NPM" value={anggota.npm} onChange={(e) => handleChangeAnggota(index, "npm", e.target.value)} className="w-1/3 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins" />
                    {anggotaTim.length > 1 && (
                      <button type="button" onClick={() => handleRemoveAnggota(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddAnggota} className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#1D4ED8] hover:text-[#1E40AF] transition font-poppins">
                  <Plus size={16} /> Tambah Anggota
                </button>
              </div>

              {/* Upload SK */}
              <div className="mb-8">
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">Unggah SK Pembimbing / Tim</label>
                <div onClick={() => skFileRef.current.click()} onDrop={handleSkDrop} onDragOver={(e) => { e.preventDefault(); setSkDragOver(true); }} onDragLeave={() => setSkDragOver(false)} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${skDragOver ? "border-[#1D4ED8] bg-[#EEF4FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#1D4ED8]"}`}>
                  <Upload size={20} className="text-[#64748B] mb-2" />
                  {skFile ? <p className="text-[13px] font-medium text-[#1D4ED8] font-poppins">{skFile.name}</p> : <p className="text-[13px] text-[#64748B] font-poppins">Klik atau tarik file SK ke sini</p>}
                </div>
                <input ref={skFileRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setSkFile(e.target.files[0])} />
              </div>
            </>
          )}

          {/* Nomor Sertifikat (Sembunyikan untuk Karya) */}
          {form.kategori !== "Karya" && (
            <div className="mb-5">
              <InputField label="Nomor Sertifikat" placeholder="Masukkan nomor sertifikat" value={form.nomorSertifikat} onChange={set("nomorSertifikat")} />
            </div>
          )}

          {/* Tanggal Sertifikat / Tanggal Karya */}
          <div className="mb-5">
            <InputField label={form.kategori === "Karya" ? "Tanggal Karya / Pembuatan" : "Tanggal Sertifikat"} placeholder="" value={form.tanggalSertifikat} onChange={set("tanggalSertifikat")} type="date" />
          </div>

          {/* Tautan Sertifikat / Karya */}
          <div className="mb-5">
            <InputField label={form.kategori === "Karya" ? "Tautan Karya / Portofolio" : "Tautan Sertifikat"} placeholder={form.kategori === "Karya" ? "Masukkan tautan portofolio / GDrive" : "Masukkan tautan sertifikat"} value={form.tautanSertifikat} onChange={set("tautanSertifikat")} />
          </div>

          {/* Upload */}
          <div className="mb-8">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
              Unggah Dokumen Pendukung
            </label>
            <div
              onClick={() => fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragOver ? "border-[#1D4ED8] bg-[#EEF4FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#1D4ED8]"
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.1) 0%, rgba(58,184,186,0.1) 100%)" }}
              >
                <Upload size={22} className="text-[#0B5EA8]" />
              </div>
              {file ? (
                <p className="text-[14px] font-medium text-[#1D4ED8] font-poppins">{file.name}</p>
              ) : (
                <>
                  <p className="text-[14px] text-[#64748B] font-poppins">Klik untuk upload atau tarik file ke sini</p>
                  <p className="text-[12px] text-[#94A3B8] mt-1 font-poppins">PNG, JPG, PDF (maks. 5MB)</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 text-white rounded-xl py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] font-poppins"
              style={{
                background: "linear-gradient(180deg, #073864 0%, #0B5EA8 100%)",
                boxShadow: "0px 4px 6px -4px #6D28D933, 0px 10px 15px -3px #6D28D933"
              }}
            >
              <Check size={17} /> Simpan
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 border border-[#E2E8F0] text-[#64748B] rounded-xl py-3 text-[14px] font-semibold hover:bg-[#F8FAFC] transition-colors font-poppins"
            >
              <X size={17} /> Kosongkan
            </button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}