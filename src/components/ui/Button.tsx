import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1D9E75] text-white hover:bg-[#0F6E56] focus-visible:outline-[#1D9E75]",
  secondary:
    "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#cdeee1] focus-visible:outline-[#1D9E75]",
  danger:
    "bg-[#D85A30] text-white hover:bg-[#b54622] focus-visible:outline-[#D85A30]",
};

export function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const classes = [
    baseClasses,
    variantClasses[variant],
    fullWidth ? "w-full" : "w-auto",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  );
}
