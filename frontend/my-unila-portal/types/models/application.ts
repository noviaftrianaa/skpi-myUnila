/**
 * Application Model Types
 * Data model untuk Application Dashboard
 */

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isFavorite: boolean;
  href: string;
  category?: string;
}

export interface AppCategory {
  category: string;
  apps: Application[];
}
