import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "green" | "amber" | "red" | "gray" | "purple";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "gray",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    blue: "bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/20",
    green: "bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20",
    amber: "bg-[#ff9500]/10 text-[#b26a00] border-[#ff9500]/20",
    red: "bg-[#ff3b30]/10 text-[#d70015] border-[#ff3b30]/20",
    gray: "bg-[#8e8e93]/10 text-[#636366] border-[#8e8e93]/20",
    purple: "bg-[#af52de]/10 text-[#8944ab] border-[#af52de]/20",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border tracking-tight select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
