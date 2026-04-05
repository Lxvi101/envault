import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "disabled"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-vault-accent to-indigo-500 text-white shadow-lg shadow-vault-accent/20 hover:shadow-vault-accent/30",
  secondary:
    "bg-vault-surface border border-vault-border text-vault-text hover:bg-vault-raised hover:border-vault-border/80",
  danger:
    "bg-vault-danger/10 border border-vault-danger/30 text-vault-danger hover:bg-vault-danger/20 hover:border-vault-danger/50",
  ghost:
    "bg-transparent text-vault-muted hover:text-vault-text hover:bg-vault-raised/60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled = false,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-vault-bg",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
