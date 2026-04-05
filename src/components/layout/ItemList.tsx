import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Star, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/stores/useUIStore';
import { useVaultStore } from '@/stores/useVaultStore';
import { ListAnimation } from '@/components/motion/ListAnimation';
import { FadeIn } from '@/components/motion/FadeIn';
import type { VaultProject, ProjectCategory } from '@/types/vault';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/vault';

interface VaultItemCardProps {
  project: VaultProject;
  isSelected: boolean;
  onSelect: () => void;
}

function VaultItemCard({ project, isSelected, onSelect }: VaultItemCardProps) {
  const { toggleFavorite } = useVaultStore();
  const categoryColor = CATEGORY_COLORS[project.category];

  const variableCount = useMemo(
    () => project.environments.reduce((sum, env) => sum + env.variables.length, 0),
    [project.environments],
  );

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(project.id);
    },
    [project.id, toggleFavorite],
  );

  return (
    <div className="px-2 py-0.5">
      <motion.button
        whileHover={{ y: -1 }}
        transition={{ duration: 0.1 }}
        onClick={onSelect}
        className={clsx(
          'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 relative group',
          isSelected
            ? 'bg-vault-accent/8 border-l-2 border-vault-accent pl-[10px]'
            : 'hover:bg-vault-raised/40 border-l-2 border-transparent pl-[10px]',
        )}
      >
        <div className="flex items-start gap-3">
          {/* Category icon box */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5"
            style={{ backgroundColor: `${categoryColor}18` }}
          >
            {project.icon.length <= 2 ? (
              <span className="text-base leading-none">{project.icon}</span>
            ) : (
              <FolderOpen size={15} style={{ color: categoryColor }} strokeWidth={1.75} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={clsx(
                'text-[13px] font-medium truncate leading-snug',
                isSelected ? 'text-vault-text' : 'text-vault-text/85',
              )}
            >
              {project.name}
            </h3>

            {project.description && (
              <p className="text-[11px] text-vault-muted/70 truncate mt-0.5 leading-snug">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {/* Tags */}
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-vault-bg/80 text-vault-muted/60 border border-vault-border/25"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 2 && (
                <span className="text-[10px] text-vault-muted/40">
                  +{project.tags.length - 2}
                </span>
              )}

              {/* Variable count pill */}
              {variableCount > 0 && (
                <span className="text-[10px] text-vault-muted/40 ml-auto tabular-nums">
                  {variableCount} var{variableCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Favorite star */}
          <button
            onClick={handleFavoriteClick}
            className={clsx(
              'p-0.5 rounded transition-all duration-150 shrink-0 mt-0.5',
              project.isFavorite
                ? 'text-yellow-500'
                : 'text-transparent group-hover:text-vault-muted/25 hover:!text-vault-muted/60',
            )}
            title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={13} strokeWidth={1.75} fill={project.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <FadeIn className="flex flex-col items-center justify-center h-full py-12 px-6">
      <div className="w-11 h-11 rounded-xl bg-vault-surface/60 flex items-center justify-center mb-3 border border-vault-border/25">
        <FolderOpen size={18} className="text-vault-muted/30" strokeWidth={1.5} />
      </div>
      <p className="text-[12px] text-vault-muted/50 text-center leading-relaxed">{message}</p>
    </FadeIn>
  );
}

export function ItemList() {
  const { listWidth, activeCategory: activeView } = useUIStore();
  const { selectedProjectId, selectProject } = useVaultStore();
  const { projects } = useVaultStore();
  const [localFilter, setLocalFilter] = useState('');

  const title = useMemo(() => {
    if (activeView === 'all') return 'All Items';
    if (activeView === 'favorites') return 'Favorites';
    return CATEGORY_LABELS[activeView as ProjectCategory] ?? activeView;
  }, [activeView]);

  const filteredProjects = useMemo(() => {
    let items: VaultProject[];

    if (activeView === 'all') {
      items = projects;
    } else if (activeView === 'favorites') {
      items = projects.filter((p) => p.isFavorite);
    } else {
      items = projects.filter((p) => p.category === activeView);
    }

    if (localFilter) {
      const query = localFilter.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    return items.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  }, [projects, activeView, localFilter]);

  return (
    <div
      style={{ width: listWidth }}
      className="h-full flex flex-col shrink-0 bg-vault-bg border-r border-vault-border/30"
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-vault-text">{title}</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              'p-1.5 rounded-lg',
              'text-vault-muted/50 hover:text-vault-accent hover:bg-vault-accent/10',
              'transition-colors duration-150',
            )}
            title="New Project"
          >
            <Plus size={15} strokeWidth={1.75} />
          </motion.button>
        </div>

        {/* Local filter input */}
        <div className="relative">
          <Search
            size={12}
            strokeWidth={1.75}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vault-muted/40 pointer-events-none"
          />
          <input
            type="text"
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            placeholder="Filter items..."
            className={clsx(
              'w-full pl-7 pr-3 py-1.5 text-[12px] rounded-lg',
              'bg-vault-surface/50 text-vault-text placeholder-vault-muted/40',
              'border border-vault-border/30',
              'focus:border-vault-border/60 focus:outline-none',
              'transition-colors duration-150',
            )}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1 scrollbar-none">
        {filteredProjects.length === 0 ? (
          <EmptyState
            message={
              localFilter
                ? 'No items match your filter'
                : activeView === 'favorites'
                  ? 'No favorites yet'
                  : 'No projects in this category'
            }
          />
        ) : (
          <ListAnimation listKey={`${activeView}-${localFilter}`} className="pb-2">
            {filteredProjects.map((project) => (
              <VaultItemCard
                key={project.id}
                project={project}
                isSelected={selectedProjectId === project.id}
                onSelect={() => selectProject(project.id)}
              />
            ))}
          </ListAnimation>
        )}
      </div>

      {/* Footer count */}
      <div className="px-4 py-1.5 border-t border-vault-border/20 shrink-0">
        <span className="text-[10px] text-vault-muted/35 tabular-nums">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
