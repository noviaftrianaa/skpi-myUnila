"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduMataKuliahPage() {
  return (
    <ComingSoonPage
      title="Mata Kuliah"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data mata kuliah dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data mata kuliah",
        "SKS teori dan praktik",
        "Mapping kode MK ke Neo Feeder",
        "Prasyarat mata kuliah",
      ]}
    />
  );
}
