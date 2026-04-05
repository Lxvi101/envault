import clsx from "clsx";
import type { ProjectCategory } from "@/types/vault";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/vault";

interface CategoryBadgeProps {
  category: ProjectCategory;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({
  category,
  size = "sm",
  className,
}: CategoryBadgeProps) {
  const label = CATEGORY_LABELS[category];
  const color = CATEGORY_COLORS[category];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
