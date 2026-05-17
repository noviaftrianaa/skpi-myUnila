"use client";

import { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** "search" pakai magnifying-glass SVG, "folder" pakai folder SVG (default). */
  variant?: "folder" | "search";
  className?: string;
};

function DefaultIllustration({ variant = "folder" }: { variant?: "folder" | "search" }) {
  if (variant === "search") {
    return (
      <svg
        viewBox="0 0 200 160"
        className="w-40 h-32 mx-auto text-gray-300 dark:text-gray-600"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="85" cy="70" r="40" stroke="currentColor" strokeWidth="6" />
        <line x1="115" y1="100" x2="145" y2="130" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="85" cy="70" r="22" stroke="currentColor" strokeWidth="4" strokeDasharray="4 4" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 200 160"
      className="w-40 h-32 mx-auto text-gray-300 dark:text-gray-600"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M30 60 L30 130 Q30 140 40 140 L160 140 Q170 140 170 130 L170 70 Q170 60 160 60 L100 60 L90 50 L40 50 Q30 50 30 60 Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <line x1="55" y1="95" x2="145" y2="95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="55" y1="110" x2="125" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/**
 * Empty state untuk Data Unila pages.
 * Default: SVG ilustrasi + title + optional description + optional CTA.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "folder",
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 ${className}`}
    >
      <div className="mb-4">
        {icon ?? <DefaultIllustration variant={variant} />}
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
