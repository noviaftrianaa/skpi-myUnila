import Link from "next/link";
import { ArrowRight, Award, Edit3, Globe, Shield, Users } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tentang",
  description: "Tentang Blog Unila — platform publikasi civitas akademik Universitas Lampung.",
});

export default function TentangPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">Tentang Blog Unila</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 text-pretty">
          Wadah publikasi mandiri untuk seluruh civitas akademik Universitas Lampung.
        </p>
      </header>

      <section className="prose prose-blog">
        <h2>Apa ini?</h2>
        <p>
          Blog Unila adalah platform publikasi resmi yang disediakan UPA TIK Universitas Lampung untuk seluruh civitas — mahasiswa, dosen,
          staf/tendik, dan alumni. Setiap civitas mendapat <strong>subdomain personal</strong> di <code>blog.unila.ac.id</code> untuk
          mempublikasikan tulisan: artikel ilmiah populer, tutorial, opini, sastra, refleksi pembelajaran, dan apapun yang mendorong
          diskusi akademik.
        </p>

        <h2 id="klaim">Cara Memulai</h2>
        <p>
          Untuk mulai menulis, login ke <a href="https://myunila.unila.ac.id">MyUnila Portal</a> dengan akun SSO Anda, lalu buka menu
          <strong> Blog Platform</strong>. Sistem akan memandu Anda klaim subdomain dan menulis artikel pertama.
        </p>
        <ul>
          <li><strong>Mahasiswa</strong> — subdomain otomatis dari NIM, format: <code>{`{NIM}-mhs.blog.unila.ac.id`}</code></li>
          <li><strong>Staf/Tendik</strong> — pilih basename, format: <code>{`{nama}-staf.blog.unila.ac.id`}</code></li>
          <li><strong>Dosen</strong> — pilih basename, format: <code>{`{nama}-dosen.blog.unila.ac.id`}</code></li>
        </ul>
      </section>

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Feature icon={Edit3} title="Editor Modern" desc="TipTap rich text editor — tabel, code block, math, embed YouTube, dan lainnya." />
        <Feature icon={Globe} title="Subdomain Personal" desc="Setiap civitas dapat alamat blog sendiri. Lebih profesional, mudah dibagikan." />
        <Feature icon={Award} title="Theme Custom" desc="Pilih antara Modern dan Minimalist. Custom warna & font sesuai gaya Anda." />
        <Feature icon={Shield} title="Aman & Terverifikasi" desc="Login terintegrasi SSO MyUnila. Akun resmi pimpinan dapat verified badge." />
      </section>

      <section className="mt-12 prose prose-blog">
        <h2 id="faq">FAQ</h2>
        <h3>Apakah saya bisa pakai blog ini untuk publikasi pribadi?</h3>
        <p>Ya. Selama isi tulisan tidak melanggar S&K dan kode etik akademik Unila.</p>

        <h3>Apa beda dari Medium / WordPress.com?</h3>
        <p>Blog Unila terintegrasi dengan ekosistem akademik kampus — badge fakultas/prodi, integrasi dengan SSO, dan agregator publik
        khusus civitas Unila. Akun cepat lewat SSO MyUnila, tidak perlu daftar baru.</p>

        <h3>Bisakah artikel saya dihapus?</h3>
        <p>Anda penuh punya kontrol terhadap konten Anda. Admin platform dapat menyembunyikan konten yang melanggar S&K (lihat bagian
        <a href="#terms">Syarat & Ketentuan</a>).</p>

        <h2 id="privacy">Privasi</h2>
        <p>Kami menghormati privasi pengguna. View tracking di-anonymize via hash IP+UA. Tidak ada PII pembaca yang disimpan.</p>

        <h2 id="terms">Syarat & Ketentuan</h2>
        <p>Lihat dokumen lengkap S&K di <a href="https://unila.ac.id/legal/blog-tnc">unila.ac.id/legal/blog-tnc</a>.</p>
      </section>

      <div className="mt-12 p-6 rounded-2xl bg-myunila-50 dark:bg-myunila-900/20 border border-myunila-200 dark:border-myunila-800 text-center">
        <h3 className="text-xl font-display font-bold">Siap menulis artikel pertama?</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Login ke MyUnila Portal dan mulai berbagi gagasan Anda.</p>
        <a
          href="https://myunila.unila.ac.id/dashboard/blog-platform"
          className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-myunila text-white font-medium hover:bg-myunila-700 shadow-md"
        >
          Mulai Menulis <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Users; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <Icon className="w-8 h-8 text-myunila mb-3" />
      <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}
