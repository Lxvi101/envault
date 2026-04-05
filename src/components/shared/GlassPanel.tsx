import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: "light" | "medium" | "heavy";
}

const intensityMap = {
  light: "bg-vault-surface/40 backdrop-blur-md backdrop-saturate-150",
  medium: "bg-vault-surface/60 backdrop-blur-xl backdrop-saturate-[1.8]",
  heavy: "bg-vault-surface/80 backdrop-blur-2xl backdrop-saturate-200",
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, intensity = "medium", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          intensityMap[intensity],
          "border border-vault-border/50 rounded-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";
