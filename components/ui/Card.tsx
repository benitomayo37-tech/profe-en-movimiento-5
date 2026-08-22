import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type CardVariant =
  | "default"
  | "outlined"
  | "muted"
  | "brand"
  | "success"
  | "warning"
  | "danger";

type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "border-slate-200 bg-white text-slate-900 shadow-lg",

  outlined:
    "border-slate-200 bg-white text-slate-900 shadow-sm",

  muted:
    "border-slate-200 bg-slate-50 text-slate-900 shadow-sm",

  brand:
    "border-blue-200 bg-blue-50 text-blue-950 shadow-sm",

  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-sm",

  warning:
    "border-amber-200 bg-amber-50 text-amber-950 shadow-sm",

  danger:
    "border-red-200 bg-red-50 text-red-950 shadow-sm",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  hover = true,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-3xl border transition-all duration-300",
        variantStyles[variant],
        paddingStyles[padding],
        hover &&
          "hover:-translate-y-1 hover:shadow-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}