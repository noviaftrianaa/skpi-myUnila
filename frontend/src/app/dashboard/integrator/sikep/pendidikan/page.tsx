"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SikepPendidikanPage() {
  return (
    <ComingSoonPage
      title="Pendidikan"
      parentModule="Data SIKEP"
      description="Halaman untuk mengelola dan sinkronisasi data pendidikan pegawai dari sistem SIKEP UNILA."
      features={[
        "Sinkronisasi riwayat pendidikan pegawai",
        "Data ijazah dan gelar",
        "Riwayat studi lanjut",
        "Integrasi dengan data dosen",
      ]}
    />
  );
}
