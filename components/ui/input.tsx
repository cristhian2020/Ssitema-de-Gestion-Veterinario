import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#1d1d1f] tracking-tight uppercase"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-xl border border-[#d2d2d7] bg-[#ffffff] text-sm text-[#1d1d1f] placeholder:text-[#8e8e93] transition-all duration-150 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-[#0066cc]/15 disabled:opacity-50 disabled:bg-[#f5f5f7]",
            error && "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/15",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#ff3b30] font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
