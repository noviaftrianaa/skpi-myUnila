import type { Metadata } from "next";
import { Inter, Poppins, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { DarkModeFab } from "@/shared/components/DarkModeFab";
import { SITE } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-white dark:bg-[#080F1F] text-slate-900 dark:text-slate-100 antialiased font-sans selection:bg-myunila/20 selection:text-myunila-700 dark:selection:text-myunila-300">
        <ThemeProvider>
          {children}
          <DarkModeFab />
        </ThemeProvider>
      </body>
    </html>
  );
}
