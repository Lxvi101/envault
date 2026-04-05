import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  variant?: "default" | "filled" | "ghost";
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-0.5 rounded hover:text-vault-text transition-colors"
            tabIndex={-1}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
