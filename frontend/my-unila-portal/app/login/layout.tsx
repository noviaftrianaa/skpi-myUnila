import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - myUnila",
  description: "Login ke Portal Terpadu Universitas Lampung",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
