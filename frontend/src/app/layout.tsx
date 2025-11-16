import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-poppins" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
