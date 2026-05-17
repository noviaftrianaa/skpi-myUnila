"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Beranda",  href: "/" },
  { label: "Trending", href: "/trending" },
  { label: "Kategori", href: "/#kategori" },
  { label: "Tentang",  href: "/tentang" },
];

export function ApexHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-colors duration-300",
          scrolled
            ? "bg-white/85 dark:bg-[#0A1124]/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            : "bg-white/40 dark:bg-[#0A1124]/40 backdrop-blur-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("flex items-center justify-between transition-[height] duration-300", scrolled ? "h-14" : "h-16")}>
            {/* Logo Universitas Lampung + Blog Unila */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/assets/images/logo-unila.png"
                alt="Universitas Lampung"
                width={36}
                height={36}
                className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <span className="font-poppins font-bold text-xl sm:text-2xl text-myunila dark:text-myunila-300 tracking-tight">
                Blog Unila
              </span>
            </Link>

            {/* Desktop nav — simple color transition (no slide animation) */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                      active
                        ? "text-myunila bg-myunila/10 dark:bg-myunila/15 dark:text-myunila-300"
                        : "text-slate-600 dark:text-slate-300 hover:text-myunila dark:hover:text-myunila-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <LanguageToggle className="hidden sm:inline-flex" />
              <a
                href="https://myunila.unila.ac.id/login?redirect=blog"
                className="hidden sm:inline-flex h-9 items-center px-4 rounded-full bg-gradient-to-r from-myunila to-myunila-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-myunila/30 transition-shadow ring-1 ring-myunila-700/30"
              >
                Login Portal
              </a>
              <button
                type="button"
                className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer untuk fixed header */}
      <div className={cn("transition-[height] duration-300", scrolled ? "h-14" : "h-16")} aria-hidden />

      {/* Mobile drawer (sederhana, no stagger) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-40 w-72 bg-white dark:bg-[#0A1124] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Bahasa</span>
                <LanguageToggle />
              </div>
              <a
                href="https://myunila.unila.ac.id/login?redirect=blog"
                className="mt-4 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-myunila to-myunila-700 text-white text-sm font-semibold shadow-md"
              >
                Login Portal myUnila
              </a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
