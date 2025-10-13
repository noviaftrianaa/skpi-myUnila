import { ReactNode } from "react";
import { cn } from "@/lib/utils/styles";

interface ContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  noPadding?: boolean;
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

export default function Container({
  children,
  size = "lg",
  className,
  noPadding = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        !noPadding && "px-6 py-12",
        className
      )}
    >
      {children}
    </div>
  );
}
