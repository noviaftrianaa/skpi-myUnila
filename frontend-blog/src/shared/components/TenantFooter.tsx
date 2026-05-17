import Link from "next/link";
import type { Author } from "@/types/blog";

interface Props {
  blog: Author;
  basePath?: string;
}

export function TenantFooter({ blog, basePath = "" }: Props) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{blog.nm_blog}</p>
            <p className="mt-1">© {new Date().getFullYear()} {blog.nm_tampilan}</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`${basePath}/about`} className="hover:text-myunila">Tentang</Link>
            <Link href={`${basePath}/archive`} className="hover:text-myunila">Arsip</Link>
            <a href={`${basePath}/feed.xml`} className="hover:text-myunila">RSS</a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-500 text-center">
          Powered by{" "}
          <a href={`https://${process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}`} className="font-medium hover:text-myunila">
            Blog Unila
          </a>
          {" — "}
          Platform blog civitas akademik Universitas Lampung
        </div>
      </div>
    </footer>
  );
}
