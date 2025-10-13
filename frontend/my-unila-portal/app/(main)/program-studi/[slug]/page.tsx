"use client";

import { useParams } from "next/navigation";
import ProfilProdi from "@/components/program-studi/ProfilProdi";

export default function ProgramStudiDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return <ProfilProdi slug={slug} />;
}
