import Link from "next/link";
import Image from "next/image";
import { Github, Heart, Instagram, Twitter, Youtube } from "lucide-react";

export function ApexFooter() {
  return (
    <footer className="relative mt-16 bg-slate-50 dark:bg-[#060B1A] border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          {/* Brand col — gabung deskripsi */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/assets/images/logo-unila.png"
                alt="Universitas Lampung"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="font-poppins font-bold text-lg text-myunila dark:text-myunila-300 tracking-tight">Blog Unila</span>
            </Link>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Wadah publikasi civitas akademik Universitas Lampung — tulisan dari mahasiswa, dosen, dan staf.
              Bagian dari ekosistem <a href="https://myunila.unila.ac.id" target="_blank" rel="noopener noreferrer" className="font-semibold text-myunila hover:underline">myUnila Portal</a>:
              akses tunggal untuk akademik, kepegawaian, dan publikasi civitas.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {[
                { Icon: Twitter,   href: "https://twitter.com/unilalampung",  label: "Twitter" },
                { Icon: Instagram, href: "https://instagram.com/unilaofficial", label: "Instagram" },
                { Icon: Youtube,   href: "https://youtube.com/@UniversitasLampung", label: "YouTube" },
                { Icon: Github,    href: "https://github.com/unila",           label: "GitHub" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-myunila hover:border-myunila/40 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Jelajahi" links={[
            { label: "Trending",    href: "/trending" },
            { label: "Teknologi",   href: "/kategori/teknologi" },
            { label: "Riset",       href: "/kategori/riset" },
            { label: "Opini",       href: "/kategori/opini" },
            { label: "Beasiswa",    href: "/kategori/beasiswa" },
          ]} />

          <FooterCol title="Akun" links={[
            { label: "Login Portal",    href: "https://myunila.unila.ac.id/login?redirect=blog", external: true },
            { label: "Mulai Menulis",   href: "https://myunila.unila.ac.id/dashboard/blog-platform", external: true },
            { label: "Klaim Subdomain", href: "/tentang#klaim" },
          ]} />

          <FooterCol title="Tentang" links={[
            { label: "Tentang",   href: "/tentang" },
            { label: "FAQ",       href: "/tentang#faq" },
            { label: "Privasi",   href: "/tentang#privacy" },
            { label: "S&K",       href: "/tentang#terms" },
            { label: "RSS Feed",  href: "/feed.xml" },
          ]} />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Universitas Lampung · blog.unila.ac.id</p>
          <p className="inline-flex items-center gap-1.5">
            Dibangun dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500/30" aria-label="cinta" /> oleh{" "}
            <a href="https://upa-tik.unila.ac.id" target="_blank" rel="noopener noreferrer" className="font-semibold text-myunila hover:underline">UPA TIK Unila</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">{title}</h4>
      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        {links.map((l) => {
          const Comp = l.external ? "a" : Link;
          return (
            <li key={l.label}>
              <Comp
                href={l.href}
                {...(l.external && { target: "_blank", rel: "noopener noreferrer" })}
                className="hover:text-myunila transition-colors"
              >
                {l.label}
              </Comp>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
