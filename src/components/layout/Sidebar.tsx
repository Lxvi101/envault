import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  Layers,
  Globe,
  Code,
  Smartphone,
  Server,
  Database,
  Cloud,
  Building,
  MoreHorizontal,
  Lock,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/stores/useUIStore';
import { useVaultStore } from '@/stores/useVaultStore';
import { useSearchStore } from '@/stores/useSearchStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { sidebarItemVariants } from '@/components/motion/variants';
import type { ProjectCategory } from '@/types/vault';
import { CATEGORY_LABELS } from '@/types/vault';

const CATEGORY_ICONS: Record<ProjectCategory, React.ElementType> = {
  'web-app': Globe,
  api: Code,
  mobile: Smartphone,
  infrastructure: Server,
  database: Database,
  saas: Cloud,
  internal: Building,
  other: MoreHorizontal,
};

const CATEGORY_ORDER: ProjectCategory[] = [
  'web-app',
  'api',
  'mobile',
  'infrastructure',
  'database',
  'saas',
  'internal',
  'other',
];

interface SidebarNavItemProps {
  icon: React.ElementType;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  layoutId: string;
}

function SidebarNavItem({ icon: Icon, label, count, isActive, onClick, layoutId: _layoutId }: SidebarNavItemProps) {
  return (
    <motion.button
      variants={sidebarItemVariants}
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm',
        'transition-colors duration-150 relative',
        isActive ? 'text-vault-text' : 'text-vault-muted hover:text-vault-text hover:bg-vault-raised/50',
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-vault-accent/10 border border-vault-accent/20"
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        />
      )}
      <Icon size={16} className={clsx('relative z-10 shrink-0', isActive && 'text-vault-accent')} />
      <span className="relative z-10 truncate flex-1 text-left">{label}</span>
      {count > 0 && (
        <span
          className={clsx(
            'relative z-10 text-[11px] tabular-nums px-1.5 py-0.5 rounded-md min-w-[20px] text-center',
            isActive ? 'text-vault-accent bg-vault-accent/10' : 'text-vault-muted/70 bg-vault-bg/50',
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

export function Sidebar() {
  const { sidebarWidth, activeCategory: activeView, setActiveCategory: setActiveView } = useUIStore();
  const { projects } = useVaultStore();
  const { open: openSearch } = useSearchStore();
  const { lock } = useAuthStore();

  const favoritesCount = useMemo(
    () => projects.filter((p) => p.isFavorite).length,
    [projects],
  );

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<ProjectCategory, number>> = {};
    for (const project of projects) {
      counts[project.category] = (counts[project.category] ?? 0) + 1;
    }
    return counts;
  }, [projects]);

  const activeCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => (categoryCounts[cat] ?? 0) > 0),
    [categoryCounts],
  );

  return (
    <div
      style={{ width: sidebarWidth }}
      className={clsx(
        'h-full flex flex-col shrink-0 select-none',
        'bg-vault-surface/40 backdrop-blur-md',
        'border-r border-vault-border/50',
      )}
    >
      {/* Quick search button */}
      <div className="p-3 pb-2">
        <button
          onClick={openSearch}
          className={clsx(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
            'bg-vault-bg/60 text-vault-muted',
            'border border-vault-border/50',
            'hover:border-vault-border hover:text-vault-text',
            'transition-all duration-150',
          )}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search...</span>
          <kbd
            className={clsx(
              'text-[10px] px-1.5 py-0.5 rounded',
              'bg-vault-raised text-vault-muted/60',
              'border border-vault-border/60',
            )}
          >
            {'\u2318'}K
          </kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-none">
        {/* All Items */}
        <SidebarNavItem
          icon={Layers}
          label="All Items"
          count={projects.length}
          isActive={activeView === 'all'}
          onClick={() => setActiveView('all')}
          layoutId="sidebar-all"
        />

        {/* Favorites */}
        <SidebarNavItem
          icon={Star}
          label="Favorites"
          count={favoritesCount}
          isActive={activeView === 'favorites'}
          onClick={() => setActiveView('favorites')}
          layoutId="sidebar-favorites"
        />

        {/* Separator */}
        {activeCategories.length > 0 && (
          <div className="py-2">
            <div className="h-px bg-vault-border/40 mx-1" />
          </div>
        )}

        {/* Categories header */}
        {activeCategories.length > 0 && (
          <div className="px-3 pt-1 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-vault-muted/50">
              Categories
            </span>
          </div>
        )}

        {/* Category items */}
        {activeCategories.map((category) => (
          <SidebarNavItem
            key={category}
            icon={CATEGORY_ICONS[category]}
            label={CATEGORY_LABELS[category]}
            count={categoryCounts[category] ?? 0}
            isActive={activeView === category}
            onClick={() => setActiveView(category)}
            layoutId={`sidebar-${category}`}
          />
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-2 border-t border-vault-border/30 flex items-center gap-1">
        <button
          onClick={lock}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm flex-1',
            'text-vault-muted hover:text-vault-text hover:bg-vault-raised/50',
            'transition-colors duration-150',
          )}
        >
          <Lock size={14} />
          <span>Lock</span>
        </button>
        <button
          className={clsx(
            'p-1.5 rounded-lg',
            'text-vault-muted hover:text-vault-text hover:bg-vault-raised/50',
            'transition-colors duration-150',
          )}
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
