"use client";

import { useState } from 'react';
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        <HeroUIProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
