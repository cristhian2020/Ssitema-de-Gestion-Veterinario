import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#1d1d1f] tracking-tight uppercase"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full h-11 px-3.5 rounded-xl border border-[#d2d2d7] bg-[#ffffff] text-sm text-[#1d1d1f] transition-all duration-150 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-[#0066cc]/15 disabled:opacity-50 disabled:bg-[#f5f5f7] cursor-pointer",
            error && "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/15",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[#ff3b30] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
