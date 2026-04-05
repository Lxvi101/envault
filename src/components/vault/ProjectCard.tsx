import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { VaultProject } from "@/types/vault";
import { CATEGORY_COLORS } from "@/types/vault";
import { ServiceIcon } from "./ServiceIcon";
import { CategoryBadge } from "./CategoryBadge";
import { DeleteConfirm } from "./DeleteConfirm";
import { Tooltip } from "@/components/shared/Tooltip";

interface ProjectCardProps {
  project: VaultProject;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ProjectCardProps) {
  const [showDelete, setShowDelete] = useState(false);

  const categoryColor = CATEGORY_COLORS[project.category];

  const handleDelete = useCallback(() => {
    onDelete(project.id);
    setShowDelete(false);
  }, [project.id, onDelete]);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-vault-border/60">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg, ${categoryColor} 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-vault-surface/50" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <ServiceIcon name={project.icon} size={48} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-vault-text truncate">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-sm text-vault-muted mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Tooltip content={project.isFavorite ? "Unfavorite" : "Favorite"}>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onToggleFavorite(project.id)}
                      className="p-2 rounded-lg hover:bg-vault-raised/60 transition-colors"
                      aria-label="Toggle favorite"
                    >
                      <motion.div
                        animate={
                          project.isFavorite
                            ? { scale: [1, 1.3, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <Star
                          className={clsx(
                            "w-5 h-5 transition-colors",
                            project.isFavorite
                              ? "fill-vault-warning text-vault-warning"
                              : "text-vault-muted/50 hover:text-vault-muted"
                          )}
                        />
                      </motion.div>
                    </motion.button>
                  </Tooltip>

                  <Tooltip content="Edit project">
                    <button
                      onClick={onEdit}
                      className="p-2 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-raised/60 transition-colors"
                      aria-label="Edit project"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Delete project">
                    <button
                      onClick={() => setShowDelete(true)}
                      className="p-2 rounded-lg text-vault-muted hover:text-vault-danger hover:bg-vault-danger/10 transition-colors"
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <CategoryBadge category={project.category} size="md" />
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs bg-vault-raised border border-vault-border/50 text-vault-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        description={`This will permanently delete "${project.name}" and all its environments and variables. This action cannot be undone.`}
      />
    </>
  );
}
