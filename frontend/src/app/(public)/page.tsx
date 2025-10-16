import {
  Hero,
  ProfileUnila,
  ProgramStudiTable,
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

      {/* Akreditasi Program Studi Section */}
      <AkreditasiProdi />

      {/* World Class University Ranking Section */}
      <WorldClassRanking />
    </>
  );
}
