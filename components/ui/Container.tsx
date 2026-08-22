import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ContainerSize = "default" | "wide" | "fluid";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

const sizeStyles: Record<ContainerSize, string> = {
  default: "max-w-7xl",
  wide: "max-w-[1600px]",
  fluid: "max-w-none",
};

export default function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </div>
  );
}