"use client";
import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  gradient?: string;
  icon?: React.ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  description,
  gradient = "from-blue-600 via-indigo-600 to-purple-600",
  icon,
}: PageHeroProps) {
  return (
    <section className={`relative min-h-[45vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] flex items-start justify-center overflow-hidden bg-gradient-to-br ${gradient} pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-12 lg:pb-16`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white space-y-3 sm:space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {icon && (
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-3 sm:mb-4 md:mb-6">
                {icon}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium opacity-90 px-3">
              {subtitle}
            </p>
          </motion.div>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg opacity-80 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-3 leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-white/50 mx-auto mt-2 sm:mt-3 md:mt-4"
          />
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            className="text-gray-50"
          />
        </svg>
      </div>
    </section>
  );
}
