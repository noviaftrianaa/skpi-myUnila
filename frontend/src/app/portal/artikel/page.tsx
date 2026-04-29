"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /portal/artikel telah digabung dengan /portal/berita.
// Redirect agar tautan lama tetap bekerja.
export default function ArtikelRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/portal/berita");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
