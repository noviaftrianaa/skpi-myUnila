"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SikepGolonganPage() {
  return (
    <ComingSoonPage
      title="Golongan"
      parentModule="Data SIKEP"
      description="Halaman untuk mengelola dan sinkronisasi data golongan kepegawaian dari sistem SIKEP UNILA."
      features={[
        "Sinkronisasi data golongan pegawai",
        "Riwayat kenaikan pangkat",
        "TMT dan SK kenaikan pangkat",
        "Statistik golongan per unit",
      ]}
    />
  );
}
