import { cn } from "../../lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline";
  colorScheme?: "blue" | "green" | "red" | "purple";
}

export function Badge({
  className,
  variant = "solid",
  colorScheme = "blue",
  ...props
}: BadgeProps) {
  const colorClasses = {
    blue: {
      solid: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      outline: "border-2 border-blue-200 text-blue-800 hover:bg-blue-50",
    },
    green: {
      solid: "bg-green-100 text-green-800 hover:bg-green-200",
      outline: "border-2 border-green-200 text-green-800 hover:bg-green-50",
    },
    red: {
      solid: "bg-red-100 text-red-800 hover:bg-red-200",
      outline: "border-2 border-red-200 text-red-800 hover:bg-red-50",
    },
    purple: {
      solid: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      outline: "border-2 border-purple-200 text-purple-800 hover:bg-purple-50",
    },
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-base font-medium transition-colors",
        colorClasses[colorScheme][variant],
        className
      )}
      {...props}
    />
  );
}