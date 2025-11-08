"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/styles";
import { useMemo } from "react";
import { GlobalSearch } from "../search";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showCTA?: boolean;
  className?: string;
}

export default function Hero({
  title = "Selamat Datang di myUnila",
  subtitle = "Portal Terpadu Satu Data Universitas Lampung",
  description = "Platform terintegrasi untuk seluruh sivitas akademika. Akses mudah, cepat, dan aman untuk data akademik, administrasi, hingga layanan kampus dalam satu pintu digital.",
  showCTA = true,
  className,
}: HeroProps) {
  // Generate static random values to avoid hydration mismatch
  const floatingParticles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: i < 6 ? 5 + (i * 15) : 70 + ((i - 6) * 5), // Posisi di kiri dan kanan saja
      top: 15 + (i * 10) % 70,
      color: i % 3 === 0 ? 'bg-blue-300' : i % 3 === 1 ? 'bg-indigo-300' : 'bg-purple-300',
      duration: 4 + (i % 3) * 0.5,
      delay: (i % 5) * 0.3,
      xOffset: (i % 2 === 0 ? 1 : -1) * ((i % 2) + 1) * 2,
    })),
  []);

  const binaryColumns = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 10 + i * 12,
      duration: 8 + (i % 3) * 2,
      delay: i * 0.5,
      binary: Array.from({ length: 10 }, (_, j) => (i + j) % 2 === 0 ? '1' : '0').join('\n'),
    })),
  []);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const floatAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-32 pb-20 px-4 overflow-hidden",
        className
      )}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      {/* Floating Particles - Modern Style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, particle.xOffset, 0],
              opacity: [0.05, 0.15, 0.05],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${particle.color} opacity-40`} />
          </motion.div>
        ))}
      </div>

      {/* Animated Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rotating Rings */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 border-2 border-blue-200/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-48 h-48 border-2 border-indigo-200/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Icons - Data Themed */}
        <motion.div
          className="absolute top-20 left-[10%] text-blue-300/40"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-[15%] text-indigo-300/40"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-[5%] text-purple-300/40"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-[20%] text-blue-300/40"
          animate={{ y: [0, 15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-40 right-[8%] text-indigo-300/40"
          animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <svg className="w-18 h-18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        </motion.div>

        {/* Binary Code Rain Effect */}
        {binaryColumns.map((column) => (
          <motion.div
            key={`binary-${column.id}`}
            className="absolute text-blue-300/20 font-mono text-xs"
            style={{
              left: `${column.left}%`,
              top: '-5%',
            }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: column.duration,
              repeat: Infinity,
              ease: "linear",
              delay: column.delay,
            }}
          >
            {column.binary}
          </motion.div>
        ))}
      </div>

      {/* Floating Tech Keywords - Digitalisasi Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { text: "SATU DATA", x: "15%", y: "25%", delay: 0 },
          { text: "TERINTEGRASI", x: "75%", y: "20%", delay: 1 },
          { text: "DIGITALISASI", x: "10%", y: "70%", delay: 2 },
          { text: "REAL-TIME", x: "80%", y: "65%", delay: 0.5 },
          { text: "SECURE 🔒", x: "85%", y: "40%", delay: 1.5 },
          { text: "CLOUD ☁️", x: "20%", y: "50%", delay: 2.5 },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-xs font-bold text-blue-400/20 tracking-wider"
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.25, 0.1],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Data Flow Animation - Connecting Dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-20">
          {/* Animated Connection Lines */}
          <motion.path
            d="M 100 200 Q 300 100 500 200"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M 700 150 Q 900 300 1100 200"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Security Shield Animation */}
      <motion.div
        className="absolute top-[15%] right-[12%] text-blue-300/20"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      </motion.div>

      {/* Database Icon with Pulse */}
      <motion.div
        className="absolute bottom-[25%] left-[8%] text-indigo-300/25"
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
        </svg>
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 border-2 border-indigo-300 rounded-full"
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Cloud Sync Animation */}
      <motion.div
        className="absolute top-[60%] right-[18%] text-purple-300/25"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
        <motion.div
          className="absolute -right-1 top-3"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg className="w-5 h-5 text-blue-400/40" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Network Nodes - Sistem Terintegrasi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central Node */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400/40 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.4)",
              "0 0 0 10px rgba(59, 130, 246, 0)",
              "0 0 0 0 rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Connecting Nodes */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/30 rounded-full"
            style={{
              top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 100}px)`,
              left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 100}px)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Mesh Gradient Overlay - Trendy Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto text-center px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Title with Gradient */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-blue-600 via-myunila to-blue-800 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-3"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {description}
        </motion.p>

        {/* Search Bar - Global Search */}
        {showCTA && (
          <motion.div variants={itemVariants} className="mb-12 max-w-3xl mx-auto">
            <GlobalSearch variant="hero" className="w-full" />

            {/* Quick Links below search */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Coba cari:</span>
              <Link href="/search?q=teknik informatika&category=prodi" className="text-sm text-myunila hover:underline">
                Teknik Informatika
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/search?q=machine learning&category=penelitian" className="text-sm text-myunila hover:underline">
                Machine Learning
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/search?q=dosen&category=dosen" className="text-sm text-myunila hover:underline">
                Dosen
              </Link>
            </div>
          </motion.div>
        )}

        {/* Feature Cards - myUnila Satu Data */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-20 mb-10"
        >
          {[
            {
              icon: (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>),
              title: "Satu Data Terpadu",
              description: "Integrasi seluruh data civitas akademika dalam satu sistem terpusat yang aman dan efisien",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>),
              title: "Real-time Update",
              description: "Akses informasi akademik, administrasi, dan layanan kampus yang selalu ter-update secara real-time",
              gradient: "from-indigo-500 to-purple-500"
            },
            {
              icon: (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>),
              title: "Keamanan Terjamin",
              description: "Sistem keamanan berlapis dengan enkripsi data untuk melindungi privasi dan informasi sensitif",
              gradient: "from-emerald-500 to-teal-500"
            },
            {
              icon: (<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>),
              title: "Dashboard Analytics",
              description: "Visualisasi data dan statistik kampus yang komprehensif untuk mendukung pengambilan keputusan",
              gradient: "from-orange-500 to-red-500"
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="relative text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="relative text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator - Outside content wrapper */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.button
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            });
          }}
          className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:text-myunila transition-colors focus:outline-none focus:ring-2 focus:ring-myunila/50 rounded-lg p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll ke bawah"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}
