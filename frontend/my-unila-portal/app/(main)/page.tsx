import { Hero, ProfileUnila, ProgramStudiTable } from "@/components";
import AkreditasiProdi from "@/components/AkreditasiProdi";
import WorldClassRanking from "@/components/statistik/WorldClassRanking";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Profile Unila Section */}
      <ProfileUnila />

      {/* Program Studi Table Section */}
      <ProgramStudiTable />

      {/* Akreditasi Program Studi Section */}
      <AkreditasiProdi />

      {/* World Class University Ranking Section */}
      <WorldClassRanking />
    </>
  );
}
