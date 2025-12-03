"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduTranskripPage() {
  return (
    <ComingSoonPage
      title="Transkrip"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data transkrip nilai dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi transkrip nilai",
        "Validasi dengan Neo Feeder",
        "Cetak transkrip digital",
        "Rekap capaian SKS",
      ]}
    />
  );
}
