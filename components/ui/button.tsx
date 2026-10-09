import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg";

    const variantStyles = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:bg-slate-950",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80 active:bg-slate-300",
      outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100",
      ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      accent: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:bg-blue-800",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
