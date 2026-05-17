"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Author } from "@/types/blog";

interface Props {
  blog: Author;
  basePath?: string; // "" untuk subdomain native, "/tenant/{sub}" untuk apex preview
}

// Apex URL — di dev (localhost) cukup "/", di prod ke blog.unila.ac.id
function apexUrl(): string {
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  if (apex.includes("localhost") || apex === "blog.local") return "/";
  return `https://${apex}`;
}

export function TenantHeader({ blog, basePath = "" }: Props) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 dark:bg-[#0A1124]/80 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href={basePath || "/"} className="flex items-center gap-2 group">
            {blog.avatar_url && (
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Image src={blog.avatar_url} alt="" width={32} height={32} className="rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm" />
              </motion.div>
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-sm sm:text-base">{blog.nm_blog}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium inline-flex items-center gap-1.5">
                {blog.subdomain}
                {blog.kode_template && blog.kode_template !== "modern" && (
                  <span className="px-1.5 py-0.5 rounded bg-myunila/10 text-myunila dark:bg-myunila/20 dark:text-myunila-300 normal-case tracking-normal text-[9px] font-semibold">
                    🎨 {blog.kode_template}
                  </span>
                )}
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link href={`${basePath}/about`} className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:inline-block">
              Tentang
            </Link>
            <Link href={`${basePath}/archive`} className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:inline-block">
              Arsip
            </Link>
            <Link
              href={apexUrl()}
              className="ml-2 hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-myunila"
              title="Kembali ke Blog Unila"
            >
              Blog Unila <ArrowUpRight className="w-3 h-3" />
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
