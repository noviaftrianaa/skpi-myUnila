import {
  Hero,
  ProfileUnila,
  ProgramStudiTable,
  SebaranProgramStudi,
  AkreditasiProdi,
  WorldClassRanking
} from "@/shared/components";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Profile Unila Section */}
      <ProfileUnila />

      {/* Program Studi Table Section */}
      <ProgramStudiTable />

      {/* Sebaran Program Studi Chart Section */}
      <SebaranProgramStudi />

      {/* Akreditasi Program Studi Section */}
      <AkreditasiProdi />

      {/* World Class University Ranking Section */}
      <WorldClassRanking />
    </>
  );
}
