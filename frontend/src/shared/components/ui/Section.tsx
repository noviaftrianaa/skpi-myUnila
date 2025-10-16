import { ReactNode } from "react";
import { cn } from "@/lib/utils/styles";
import Container from "../common/Container";

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  background?: "white" | "gray" | "gradient" | "transparent";
}

const backgroundClasses = {
  white: "bg-white",
  gray: "bg-gray-50",
  gradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
  transparent: "bg-transparent",
};

export default function Section({
  children,
  title,
  subtitle,
  className,
  containerSize = "lg",
  background = "white",
}: SectionProps) {
  return (
    <section className={cn("py-16", backgroundClasses[background], className)}>
      <Container size={containerSize}>
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Section Content */}
        {children}
      </Container>
    </section>
  );
}
