import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Key } from "lucide-react";
import clsx from "clsx";
import type { VaultProject } from "@/types/vault";
import { ServiceIcon } from "./ServiceIcon";
import { CategoryBadge } from "./CategoryBadge";

interface VaultItemProps {
  project: VaultProject;
  isSelected: boolean;
  index: number;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function VaultItem({
  project,
  isSelected,
  index,
  onSelect,
  onToggleFavorite,
}: VaultItemProps) {
  const variableCount = useMemo(
    () =>
      project.environments.reduce((sum, env) => sum + env.variables.length, 0),
    [project.environments]
  );

  const modified = useMemo(
    () => timeAgo(project.modifiedAt),
    [project.modifiedAt]
  );

  return (
    <motion.div
      custom={index}
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ backgroundColor: "rgba(26, 26, 38, 0.5)" }}
      onClick={() => onSelect(project.id)}
      className={clsx(
        "relative cursor-pointer px-4 py-3.5 transition-colors duration-150",
        "border-l-[3px]",
        isSelected
          ? "bg-vault-raised border-l-vault-accent"
          : "border-l-transparent hover:bg-vault-raised/30"
      )}
    >
      <div className="flex items-start gap-3">
        <ServiceIcon name={project.icon} size={36} className="mt-0.5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={clsx(
                "text-sm font-medium truncate",
                isSelected ? "text-vault-text" : "text-vault-text/90"
              )}
            >
              {project.name}
            </h3>
            {variableCount > 0 && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-vault-accent/10 text-vault-accent text-[10px] font-medium">
                <Key className="w-2.5 h-2.5" />
                {variableCount}
              </span>
            )}
          </div>

          {project.description && (
            <p className="text-xs text-vault-muted truncate mt-0.5">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <CategoryBadge category={project.category} />
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] bg-vault-raised text-vault-muted border border-vault-border/50"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="text-[10px] text-vault-muted">
                +{project.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(project.id);
            }}
            className="p-1 rounded-md hover:bg-vault-raised transition-colors"
            aria-label={
              project.isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Star
              className={clsx(
                "w-3.5 h-3.5 transition-colors",
                project.isFavorite
                  ? "fill-vault-warning text-vault-warning"
                  : "text-vault-muted/50 hover:text-vault-muted"
              )}
            />
          </motion.button>
          <span className="text-[10px] text-vault-muted/60 whitespace-nowrap">
            {modified}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
