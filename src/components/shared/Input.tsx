import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type InputVariant = "default" | "filled" | "ghost";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  label?: string;
}

const variantStyles: Record<InputVariant, string> = {
  default:
    "bg-vault-bg border border-vault-border focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]",
  filled:
    "bg-vault-raised border border-transparent focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]",
  ghost:
    "bg-transparent border border-transparent hover:bg-vault-raised/50 focus:bg-vault-raised focus:border-vault-accent/60",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      leftIcon,
      rightIcon,
      error,
      label,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-vault-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-lg px-3 py-2 text-sm text-vault-text",
              "placeholder:text-vault-muted/60",
              "outline-none transition-all duration-200",
              variantStyles[variant],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error &&
                "!border-vault-danger/60 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-vault-danger mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
