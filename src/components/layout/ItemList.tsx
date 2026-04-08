import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Star, FolderOpen, ChevronDown, Filter, Layers } from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/stores/useUIStore';
import { useVaultStore } from '@/stores/useVaultStore';
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

  const subtitle = useMemo(() => {
    // Show first env variable value or description as subtitle (like 1Password shows email/username)
    if (project.description) return project.description;
    const firstEnv = project.environments[0];
    if (firstEnv && firstEnv.variables.length > 0) {
      return firstEnv.variables[0].value;
    }
    return '';
  }, [project]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(project.id);
    },
    [project.id, toggleFavorite],
  );

  return (
    <div className="px-2">
      <button
        onClick={onSelect}
        className={clsx(
          'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-100 relative group flex items-center gap-3',
          isSelected
            ? 'bg-vault-accent text-white'
            : 'hover:bg-black/[0.04]',
        )}
      >
        {/* Icon */}
        <div
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0',
            isSelected ? 'bg-white/20' : '',
          )}
          style={!isSelected ? { backgroundColor: `${categoryColor}15` } : undefined}
        >
          {project.icon.length <= 2 ? (
            <span className="text-lg leading-none">{project.icon}</span>
          ) : (
            <FolderOpen
              size={18}
              style={{ color: isSelected ? 'white' : categoryColor }}
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3
              className={clsx(
                'text-[13px] font-semibold truncate leading-snug',
                isSelected ? 'text-white' : 'text-vault-text',
              )}
            >
              {project.name}
            </h3>
            {project.isFavorite && (
              <Star
                size={11}
                strokeWidth={2}
                fill="currentColor"
                className={isSelected ? 'text-yellow-300 shrink-0' : 'text-yellow-500 shrink-0'}
              />
            )}
          </div>
          {subtitle && (
            <p
              className={clsx(
                'text-[12px] truncate mt-0.5 leading-snug',
                isSelected ? 'text-white/70' : 'text-vault-muted',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Favorite toggle on hover */}
        {!project.isFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={clsx(
              'p-0.5 rounded transition-all duration-100 shrink-0 opacity-0 group-hover:opacity-100',
              isSelected
                ? 'text-white/40 hover:text-white'
                : 'text-vault-muted/30 hover:text-yellow-500',
            )}
            title="Add to favorites"
          >
            <Star size={13} strokeWidth={1.75} />
          </button>
        )}
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <FadeIn className="flex flex-col items-center justify-center h-full py-12 px-6">
      <div className="w-12 h-12 rounded-xl bg-vault-surface flex items-center justify-center mb-3 border border-vault-border">
        <FolderOpen size={20} className="text-vault-muted" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] text-vault-muted text-center leading-relaxed">{message}</p>
    </FadeIn>
  );
}

// Group projects by month/year
function groupByMonth(projects: VaultProject[]): { label: string; items: VaultProject[] }[] {
  const groups: Map<string, VaultProject[]> = new Map();

  for (const project of projects) {
    const date = new Date(project.modifiedAt);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(project);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

interface ItemListProps {
  onNewProject: () => void;
}

export function ItemList({ onNewProject }: ItemListProps) {
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

  const groupedProjects = useMemo(() => groupByMonth(filteredProjects), [filteredProjects]);

  return (
    <div
      style={{ width: listWidth }}
      className="h-full flex flex-col shrink-0 bg-white border-r border-vault-border"
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-vault-border">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1 text-[13px] font-semibold text-vault-text hover:text-vault-accent transition-colors">
            <Layers size={14} strokeWidth={2} className="text-vault-accent" />
            {title}
            <ChevronDown size={12} strokeWidth={2} className="text-vault-muted" />
          </button>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors" title="Filter">
              <Filter size={14} strokeWidth={1.75} />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onNewProject}
              className="p-1 rounded text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
              title="New Project"
            >
              <Plus size={16} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search
            size={13}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vault-muted pointer-events-none"
          />
          <input
            type="text"
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            placeholder="Filter items..."
            className={clsx(
              'w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg',
              'bg-vault-surface text-vault-text placeholder-vault-muted',
              'border border-vault-border',
              'focus:border-vault-accent/40 focus:outline-none',
              'transition-colors duration-150',
            )}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1 scrollbar-on-hover">
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
          <div className="pb-2">
            {groupedProjects.map((group) => (
              <div key={group.label}>
                {/* Month/year header */}
                <div className="px-5 pt-4 pb-1">
                  <span className="text-[11px] font-semibold text-vault-muted tracking-wide">
                    {group.label}
                  </span>
                </div>
                {group.items.map((project) => (
                  <VaultItemCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onSelect={() => selectProject(project.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="px-4 py-1.5 border-t border-vault-border shrink-0">
        <span className="text-[10px] text-vault-muted tabular-nums">
          {filteredProjects.length} item{filteredProjects.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
