"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * /artikel/[slug] → redirect ke /berita/[slug] (sumber tunggal).
 * Artikel & berita digabung jadi 1 feed dengan filter tipe.
 */
export default function PublicArtikelDetailRedirect() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  useEffect(() => {
    router.replace(`/berita/${slug}`);
  }, [router, slug]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
