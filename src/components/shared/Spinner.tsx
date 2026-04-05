import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-6 w-6 border-[2.5px]",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", color, className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-solid border-current border-r-transparent",
        sizeMap[size],
        className
      )}
      style={color ? { color } : undefined}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
