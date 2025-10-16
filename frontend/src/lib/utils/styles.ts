/**
 * Utility Styles - MyUnila Portal
 * Gunakan ini untuk styling yang konsisten di seluruh aplikasi
 *
 * CARA PAKAI:
 *
 * import { buttonStyles, textStyles, cardStyles } from '@/lib/utils/styles';
 * import { cn } from '@/lib/utils/styles';
 *
 * <Button className={buttonStyles.gradientPrimary}>Click Me</Button>
 * <h1 className={textStyles.gradientPrimary}>Hello World</h1>
 */

// Re-export cn function dari cn.ts (menggunakan clsx + tailwind-merge)
export { cn } from './cn';

export const buttonStyles = {
  // Gradient Buttons (sudah include hover effects)
  gradientPrimary: 'btn-gradient-primary',
  gradientOcean: 'btn-gradient-ocean',
  gradientTwilight: 'btn-gradient-twilight',

  // Outline Buttons
  outlinePrimary: 'btn-outline-primary',

  // Custom combinations
  solidPrimary: 'bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors',
  solidSecondary: 'bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors',
};

export const textStyles = {
  // Gradient Text for Headings
  gradientPrimary: 'text-gradient-primary',
  gradientOcean: 'text-gradient-ocean',
  gradientTwilight: 'text-gradient-twilight',

  // Typography
  heading1: 'text-5xl md:text-6xl font-bold',
  heading2: 'text-4xl md:text-5xl font-bold',
  heading3: 'text-3xl md:text-4xl font-bold',
  subtitle: 'text-xl md:text-2xl font-semibold',
  body: 'text-base text-gray-600',
  bodyLarge: 'text-lg text-gray-600',
};

export const cardStyles = {
  // Card Variants
  elevated: 'card-elevated',
  gradientHeader: 'card-gradient-header',

  // Custom combinations
  default: 'bg-white rounded-xl shadow-lg border border-gray-100',
  hover: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300',
};

export const backgroundStyles = {
  // Background Patterns
  primary: 'bg-pattern-primary',
  light: 'bg-pattern-light',

  // Solid backgrounds
  white: 'bg-white',
  gray: 'bg-gray-50',
};

export const animationStyles = {
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  hoverLift: 'hover-lift',
  hoverGlow: 'hover-glow',
};
