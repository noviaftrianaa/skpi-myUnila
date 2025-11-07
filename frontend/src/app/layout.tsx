import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "myUnila - Portal Terpadu Universitas Lampung",
    template: "%s | myUnila",
  },
  description: "Platform terintegrasi untuk seluruh sivitas akademika Universitas Lampung",
  icons: {
    icon: [{ url: "/assets/images/logo-unila.png", type: "image/png", sizes: "any" }],
    shortcut: "/assets/images/logo-unila.png",
    apple: "/assets/images/logo-unila.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${poppins.variable} font-poppins`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
