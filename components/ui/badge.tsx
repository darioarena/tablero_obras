import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "alta" | "media" | "baja" | "active" | "inactive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
    outline: "text-slate-700 border-slate-300 bg-white",
    // Badges de severidad de alertas de obra
    alta: "bg-red-50 text-red-700 border-red-200/80 font-semibold",
    media: "bg-amber-50 text-amber-800 border-amber-200/80 font-medium",
    baja: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium",
    // Estados de usuario u obra
    active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    inactive: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
