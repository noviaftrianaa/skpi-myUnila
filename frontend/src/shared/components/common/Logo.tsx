import { cn } from "@/lib/utils/styles";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
  xl: 'text-6xl md:text-7xl',
};

export default function Logo({ size = 'md', className, color = 'text-myunila' }: LogoProps) {
  return (
    <h1 className={cn('font-bold tracking-tight', sizeClasses[size], color, className)}>
      myUnila
    </h1>
  );
}
