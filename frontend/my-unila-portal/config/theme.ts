/**
 * ====================================
 * BASE THEME CONFIGURATION
 * Profil myUnila - Modern Blue Gradient
 * ====================================
 *
 * LOGO & BRANDING:
 * - Font: Poppins (Bold) - Mirip dengan logo asli myUnila
 * - Color: #0B5EA8 (text-myunila)
 * - Logo Component: @/components/common/Logo
 *
 *    Contoh:
 *    import Logo from '@/components/common/Logo';
 *    <Logo size="lg" />
 *
 * PANDUAN PENGGUNAAN STYLING:
 *
 * 1. GLOBAL CSS CLASSES (Rekomendasi untuk konsistensi)
 *    Gunakan class yang sudah didefinisikan di globals.css
 *
 *    Contoh:
 *    <button className="btn-gradient-primary">Click Me</button>
 *    <h1 className="text-gradient-primary">Hello</h1>
 *
 * 2. UTILITY CONSTANTS (Rekomendasi untuk component reusable)
 *    Import dari @/lib/utils/styles
 *
 *    Contoh:
 *    import { buttonStyles, textStyles } from '@/lib/utils/styles';
 *    <Button className={buttonStyles.gradientPrimary}>Click</Button>
 *    <h1 className={textStyles.gradientPrimary}>Hello</h1>
 *
 * 3. TAILWIND CLASSES (Untuk custom styling)
 *    Pakai langsung dari tailwind.config.ts
 *
 *    Contoh:
 *    <div className="bg-gradient-blue-modern">Content</div>
 *    <div className="text-myunila">myUnila Blue</div>
 */

export const theme = {
  // Gradient Backgrounds - Modern & Trendy
  gradients: {
    primary: 'bg-gradient-primary', // Purple gradient (#667eea → #764ba2)
    blueModern: 'bg-gradient-blue-modern', // Blue shades (#3b82f6 → #2563eb → #1e40af)
    ocean: 'bg-gradient-ocean', // Cyan to Blue (#00d2ff → #3a7bd5)
    sky: 'bg-gradient-sky', // Sky blue (#0ea5e9 → #0284c7 → #0369a1)
    twilight: 'bg-gradient-twilight', // Purple to Pink (#667eea → #764ba2 → #f093fb)
  },

  // Primary Colors (Blue) - Sesuai Hero UI theme
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // DEFAULT - Warna utama
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // DEFAULT - Warna sekunder
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
  },

  // Text Gradients untuk Headings
  textGradients: {
    primary: 'text-gradient-primary',
    ocean: 'text-gradient-ocean',
    twilight: 'text-gradient-twilight',
  },

  // Button Variants
  buttons: {
    gradientPrimary: 'btn-gradient-primary',
    gradientOcean: 'btn-gradient-ocean',
    gradientTwilight: 'btn-gradient-twilight',
    outlinePrimary: 'btn-outline-primary',
  },
};

export default theme;
