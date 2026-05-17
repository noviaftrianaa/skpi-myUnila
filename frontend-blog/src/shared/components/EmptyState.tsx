import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title = "Belum ada apa-apa di sini", message, action, icon, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4", className)}>
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
