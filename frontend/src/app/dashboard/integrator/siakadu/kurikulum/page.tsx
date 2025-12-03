"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduKurikulumPage() {
  return (
    <ComingSoonPage
      title="Kurikulum"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data kurikulum dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi struktur kurikulum",
        "Mapping kurikulum ke Neo Feeder",
        "Versi kurikulum per prodi",
        "Distribusi mata kuliah",
      ]}
    />
  );
}
