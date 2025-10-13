import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "myUnila - Portal Terpadu Universitas Lampung",
    template: "%s | myUnila",
  },
  description: "Platform terintegrasi untuk seluruh sivitas akademika Universitas Lampung. Akses mudah, cepat, dan aman untuk data akademik, administrasi, hingga layanan kampus dalam satu pintu digital.",
  icons: {
    icon: [
      { url: "/assets/images/logo-unila.png", type: "image/png", sizes: "any" },
    ],
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
    <html lang="id">
      <head>
        <link rel="icon" href="/assets/images/logo-unila.png" type="image/png" />
        <link rel="shortcut icon" href="/assets/images/logo-unila.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/images/logo-unila.png" />
      </head>
      <body className={poppins.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
