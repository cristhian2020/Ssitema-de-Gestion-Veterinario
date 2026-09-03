import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const variantStyles = {
      // Apple Action Blue pill
      primary:
        "bg-[#0066cc] text-white hover:bg-[#0071e3] active:bg-[#0055b3] shadow-sm rounded-full",
      // Apple Secondary pill
      secondary:
        "bg-[#ffffff] text-[#1d1d1f] hover:bg-[#f5f5f7] border border-[#e5e5ea] shadow-xs rounded-full",
      // Apple Dark utility pill
      dark:
        "bg-[#1d1d1f] text-white hover:bg-[#333333] shadow-sm rounded-full",
      // Subtle outline
      outline:
        "border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full",
      // Ghost
      ghost:
        "text-[#0066cc] hover:bg-[#0066cc]/10 rounded-full",
      // Danger pill
      danger:
        "bg-[#ff3b30] text-white hover:bg-[#e03126] shadow-sm rounded-full",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 h-8 gap-1.5",
      md: "text-sm px-5 py-2.5 h-10 gap-2",
      lg: "text-base px-6 py-3 h-12 gap-2.5 font-semibold",
      icon: "h-9 w-9 rounded-full p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
