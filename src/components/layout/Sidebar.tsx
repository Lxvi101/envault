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
}

function SidebarNavItem({ icon: Icon, label, count, isActive, onClick }: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 text-sm relative group',
        'transition-colors duration-150',
        'rounded-lg overflow-hidden',
        isActive
          ? 'bg-vault-accent/10 text-vault-text border-l-2 border-vault-accent pl-[10px] pr-3 py-1.5'
          : 'border-l-2 border-transparent pl-[10px] pr-3 py-1.5 text-vault-muted hover:text-vault-text hover:bg-vault-raised/50',
      )}
    >
      <Icon
        size={15}
        strokeWidth={1.75}
        className={clsx(
          'shrink-0 transition-colors duration-150',
          isActive ? 'text-vault-accent' : 'text-vault-muted/60 group-hover:text-vault-muted',
        )}
      />
      <span className="truncate flex-1 text-left text-[13px]">{label}</span>
      {count > 0 && (
        <span
          className={clsx(
            'text-[11px] tabular-nums px-1.5 py-0.5 rounded-md min-w-[20px] text-center font-medium',
            isActive
              ? 'text-vault-accent bg-vault-accent/15'
              : 'text-vault-muted/50 bg-vault-bg/60',
          )}
        >
          {count}
        </span>
      )}
    </button>
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
        'bg-vault-surface/50',
        'border-r border-vault-border/40',
      )}
    >
      {/* Search button */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          onClick={openSearch}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            'bg-vault-bg/60 text-vault-muted/70',
            'border border-vault-border/40',
            'hover:border-vault-border/70 hover:text-vault-muted',
            'transition-all duration-150',
          )}
        >
          <Search size={13} strokeWidth={1.75} className="shrink-0" />
          <span className="flex-1 text-left text-[12px]">Search...</span>
          <kbd
            className={clsx(
              'text-[10px] px-1.5 py-0.5 rounded font-medium',
              'bg-vault-raised/80 text-vault-muted/50',
              'border border-vault-border/50',
            )}
          >
            {'\u2318'}K
          </kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 scrollbar-none">
        {/* All Items */}
        <SidebarNavItem
          icon={Layers}
          label="All Items"
          count={projects.length}
          isActive={activeView === 'all'}
          onClick={() => setActiveView('all')}
        />

        {/* Favorites */}
        <SidebarNavItem
          icon={Star}
          label="Favorites"
          count={favoritesCount}
          isActive={activeView === 'favorites'}
          onClick={() => setActiveView('favorites')}
        />

        {/* Divider + Vaults label */}
        {activeCategories.length > 0 && (
          <>
            <div className="py-2.5 px-1">
              <div className="h-px bg-vault-border/30" />
            </div>
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-vault-muted/40">
                Vaults
              </span>
            </div>
          </>
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
          />
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 py-2 border-t border-vault-border/30 flex items-center gap-1 shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={lock}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] flex-1',
            'text-vault-muted/60 hover:text-vault-text hover:bg-vault-raised/50',
            'transition-colors duration-150',
          )}
        >
          <Lock size={13} strokeWidth={1.75} />
          <span>Lock Vault</span>
        </motion.button>
        <button
          className={clsx(
            'p-1.5 rounded-lg',
            'text-vault-muted/40 hover:text-vault-text hover:bg-vault-raised/50',
            'transition-colors duration-150',
          )}
          title="Settings"
        >
          <Settings size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
