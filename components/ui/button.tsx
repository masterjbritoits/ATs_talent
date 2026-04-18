import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-[#132f55]",
  secondary: "bg-white text-foreground border border-border hover:bg-slate-50",
  ghost: "bg-transparent text-foreground hover:bg-slate-100",
  danger: "bg-danger text-white hover:bg-[#992d34]"
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl"
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
});
