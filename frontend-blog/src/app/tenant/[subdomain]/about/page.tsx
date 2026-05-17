import { notFound } from "next/navigation";
import { AuthorProfileHero } from "@/shared/components/AuthorProfileHero";
import { AuthorCV } from "@/shared/components/AuthorCV";
import { getBlogBySubdomain } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) return buildMetadata({ title: "Profil tidak ditemukan" });
  return buildMetadata({
    title: `Tentang ${blog.nm_tampilan}`,
    description: blog.bio || blog.tagline || undefined,
    image: blog.cover_url || undefined,
  });
}

export default async function TenantAboutPage({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) notFound();

  return (
    <>
      <AuthorProfileHero author={blog} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blog.cv_json ? (
          <AuthorCV cv={blog.cv_json} />
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 italic">Penulis belum melengkapi profil portofolio CV.</p>
          </div>
        )}

        <section className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-display font-semibold mb-3">Profil Civitas</h3>
          <dl className="text-sm space-y-2">
            <Row label="Status">{({MHS:"Mahasiswa",STAF:"Staf/Tendik",DOSEN:"Dosen",ALUMNI:"Alumni"} as Record<string,string>)[blog.tipe_role]}</Row>
            {blog.fakultas && <Row label="Fakultas">{blog.fakultas}</Row>}
            {blog.prodi && <Row label="Program Studi">{blog.prodi}</Row>}
            {blog.lokasi && <Row label="Lokasi">{blog.lokasi}</Row>}
            <Row label="Total Artikel">{blog.jumlah_post}</Row>
            <Row label="Total Views">{blog.jumlah_view.toLocaleString("id-ID")}</Row>
            <Row label="Subdomain">
              <a href={`https://${blog.subdomain}.${process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}`} className="text-myunila hover:underline">
                {blog.subdomain}.{process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}
              </a>
            </Row>
          </dl>

          <p className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            🔒 Privasi: Data sensitif (NIM/NIP penuh, email pribadi, telepon, alamat, IPK, NIK) tidak pernah ditampilkan
            di halaman publik. Hanya data yang dipilih penulis untuk dibagikan.
          </p>
        </section>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1">
      <dt className="sm:w-40 text-slate-500 shrink-0">{label}</dt>
      <dd className="font-medium text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}
