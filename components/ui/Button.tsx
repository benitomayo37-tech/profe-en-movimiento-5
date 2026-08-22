import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

type LinkButtonProps = ButtonBaseProps &
  Omit<
    ComponentProps<typeof Link>,
    "children" | "className" | "onClick"
  > & {
    href: ComponentProps<typeof Link>["href"];
    disabled?: boolean;
  };

type ActionButtonProps = ButtonBaseProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  > & {
    href?: undefined;
  };

export type ButtonProps = LinkButtonProps | ActionButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-500 text-white shadow-lg hover:bg-orange-600",

  secondary:
    "border border-white/30 text-white hover:bg-white/10",

  outline:
    "border border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700",

  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",

  success:
    "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700",

  danger:
    "bg-red-600 text-white shadow-lg hover:bg-red-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-4 py-2 text-sm",
  md: "min-h-12 rounded-xl px-6 py-3",
  lg: "min-h-14 rounded-2xl px-8 py-4 text-lg",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export default function Button(props: ButtonProps) {
  const {
    children,
    className,
    variant = "primary",
    size = "md",
    fullWidth = false,
    leadingIcon,
    trailingIcon,
  } = props;

  const styles = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    !props.disabled && "hover:-translate-y-0.5",
    props.disabled && "pointer-events-none opacity-50",
    className,
  );

  const content = (
    <>
      {leadingIcon && (
        <span aria-hidden="true" className="shrink-0">
          {leadingIcon}
        </span>
      )}

      <span>{children}</span>

      {trailingIcon && (
        <span aria-hidden="true" className="shrink-0">
          {trailingIcon}
        </span>
      )}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    // Estas propiedades ya se aplicaron al contenido y no deben llegar a Link.
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      href,
      disabled,
      children: _children,
      className: _className,
      variant: _variant,
      size: _size,
      fullWidth: _fullWidth,
      leadingIcon: _leadingIcon,
      trailingIcon: _trailingIcon,
      ...linkProps
    } = props;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    if (disabled) {
      return (
        <span
          className={styles}
          aria-disabled="true"
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        {...linkProps}
        href={href}
        className={styles}
      >
        {content}
      </Link>
    );
  }

  // Estas propiedades ya se aplicaron al contenido y no deben llegar al DOM.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    href: _href,
    children: _children,
    className: _className,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    leadingIcon: _leadingIcon,
    trailingIcon: _trailingIcon,
    type = "button",
    ...buttonProps
  } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <button
      {...buttonProps}
      type={type}
      className={styles}
    >
      {content}
    </button>
  );
}
