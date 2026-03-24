"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

// ─── MODAL ─────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: ReactNode;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export function Modal({ isOpen, onClose, size = "lg", children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0 ${className}`}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 overflow-y-auto flex-1 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

// ─── BUTTON ────────────────────────────────────────────────────────────────

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "flat";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  isIconOnly?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

const btnVariants = {
  primary: "bg-[#0B5EA8] hover:bg-[#094d8a] text-white shadow-sm",
  secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  flat: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400",
};

const btnSizes = {
  xs: "h-7 px-2 text-xs rounded-md",
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-xl",
};

export function Btn({ variant = "primary", size = "md", isLoading, isIconOnly, startContent, endContent, children, className = "", disabled, ...props }: BtnProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 
        ${btnVariants[variant]} ${isIconOnly ? `${size === "sm" ? "w-8 h-8" : size === "xs" ? "w-7 h-7" : "w-10 h-10"} px-0` : btnSizes[size]}
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
      ) : startContent}
      {!isIconOnly && children}
      {!isLoading && endContent}
    </button>
  );
}

// ─── INPUT ─────────────────────────────────────────────────────────────────

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  onValueChange?: (v: string) => void;
  inputSize?: "sm" | "md";
}

export const TwInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, startContent, endContent, onValueChange, className = "", inputSize = "md", onChange, ...props }, ref) => {
    const sz = inputSize === "sm" ? "h-8 text-sm" : "h-10 text-sm";
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>}
        <div className="relative">
          {startContent && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{startContent}</div>}
          <input
            ref={ref}
            className={`w-full ${sz} ${startContent ? "pl-9" : "pl-3"} ${endContent ? "pr-9" : "pr-3"} 
              border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#0B5EA8]/30 focus:border-[#0B5EA8]
              disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900
              transition-colors ${error ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : ""} ${className}`}
            onChange={(e) => {
              onChange?.(e);
              onValueChange?.(e.target.value);
            }}
            {...props}
          />
          {endContent && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{endContent}</div>}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
TwInput.displayName = "TwInput";

// ─── TEXTAREA ──────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  onValueChange?: (v: string) => void;
}

export function TwTextarea({ label, onValueChange, className = "", onChange, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#0B5EA8]/30 focus:border-[#0B5EA8]
          resize-y min-h-[80px] transition-colors ${className}`}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...props}
      />
    </div>
  );
}

// ─── SELECT ────────────────────────────────────────────────────────────────

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  selectSize?: "sm" | "md";
  onValueChange?: (v: string) => void;
}

export function TwSelect({ label, options, placeholder, selectSize = "md", onValueChange, className = "", onChange, ...props }: SelectProps) {
  const sz = selectSize === "sm" ? "h-8 text-sm" : "h-10 text-sm";
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>}
      <select
        className={`w-full ${sz} px-3 border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-[#0B5EA8]/30 focus:border-[#0B5EA8]
          disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900
          transition-colors appearance-none cursor-pointer ${className}`}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── CHIP ──────────────────────────────────────────────────────────────────

interface ChipProps {
  children: ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "danger" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

const chipColors = {
  default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  secondary: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function Chip({ children, color = "default", size = "sm", className = "" }: ChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full 
      ${size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"}
      ${chipColors[color]} ${className}`}>
      {children}
    </span>
  );
}

// ─── SPINNER ───────────────────────────────────────────────────────────────

export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <svg className={`animate-spin ${sz} text-[#0B5EA8] ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ─── CARD ──────────────────────────────────────────────────────────────────

export function Card({ children, className = "", ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// ─── PROGRESS BAR ──────────────────────────────────────────────────────────

export function Progress({ value = 0, color = "primary", className = "" }: { value?: number; color?: string; className?: string }) {
  const clr = color === "success" ? "bg-emerald-500" : color === "warning" ? "bg-amber-500" : color === "danger" ? "bg-red-500" : "bg-[#0B5EA8]";
  return (
    <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${clr}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
