import { ApexHeader } from "@/shared/components/ApexHeader";
import { ApexFooter } from "@/shared/components/ApexFooter";

export default function ApexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ApexHeader />
      <main className="flex-1">{children}</main>
      <ApexFooter />
    </div>
  );
}
