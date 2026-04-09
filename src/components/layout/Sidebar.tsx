import { useMemo, useState, useCallback } from 'react';
import {
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
  Tag,
  Plus,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/stores/useUIStore';
import { useVaultStore } from '@/stores/useVaultStore';
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
  count?: number;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}

function SidebarNavItem({ icon: Icon, label, count, isActive, onClick, indent }: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 text-[13px] relative group',
        'transition-colors duration-100',
        'rounded-lg overflow-hidden',
        indent ? 'pl-8 pr-3 py-[5px]' : 'pl-3 pr-3 py-[5px]',
        isActive
          ? 'bg-vault-accent text-white'
          : 'text-vault-text hover:bg-black/[0.04]',
      )}
    >
      <Icon
        size={16}
        strokeWidth={1.75}
        className={clsx(
          'shrink-0',
          isActive ? 'text-white' : 'text-vault-muted',
        )}
      />
      <span className="truncate flex-1 text-left font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={clsx(
            'text-[11px] tabular-nums min-w-[18px] text-center font-medium',
            isActive ? 'text-white/70' : 'text-vault-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SectionHeader({ label, action }: { label: string; action?: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 pt-4 pb-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-vault-muted">
        {label}
      </span>
      {action && (
        <button
          onClick={action}
          className="p-0.5 rounded text-vault-muted hover:text-vault-text transition-colors"
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarWidth, activeCategory: activeView, activeTag, setActiveCategory: setActiveView, setActiveTag } = useUIStore();
  const { projects } = useVaultStore();
  const { lock, yoloMode, enableYolo, disableYolo } = useAuthStore();
  const [showYoloPrompt, setShowYoloPrompt] = useState(false);
  const [yoloPassword, setYoloPassword] = useState('');
  const [yoloError, setYoloError] = useState('');

  const handleYoloToggle = useCallback(async () => {
    if (yoloMode) {
      await disableYolo();
    } else {
      setShowYoloPrompt(true);
      setYoloPassword('');
      setYoloError('');
    }
  }, [yoloMode, disableYolo]);

  const handleYoloSubmit = useCallback(async () => {
    if (!yoloPassword) return;
    const success = await enableYolo(yoloPassword);
    if (success) {
      setShowYoloPrompt(false);
      setYoloPassword('');
    } else {
      setYoloError('Invalid password');
    }
  }, [yoloPassword, enableYolo]);

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

  // Collect unique tags with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const tag of project.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 12);
  }, [projects]);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  return (
    <div
      style={{ width: sidebarWidth }}
      className={clsx(
        'h-full flex flex-col shrink-0 select-none',
        'bg-vault-sidebar',
        'border-r border-vault-border',
      )}
    >
      {/* Vault header */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-vault-accent/10 flex items-center justify-center">
            <Layers size={15} className="text-vault-accent" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-vault-text truncate">My Vault</p>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 scrollbar-none">
        {/* Core items */}
        <div className="space-y-0.5 pb-1">
          <SidebarNavItem
            icon={Layers}
            label="All Items"
            count={projects.length}
            isActive={activeView === 'all' && !activeTag}
            onClick={() => setActiveView('all')}
          />
          <SidebarNavItem
            icon={Star}
            label="Favorites"
            count={favoritesCount}
            isActive={activeView === 'favorites' && !activeTag}
            onClick={() => setActiveView('favorites')}
          />
        </div>

        {/* Vaults / Categories */}
        {activeCategories.length > 0 && (
          <>
            <SectionHeader label="Vaults" />
            <div className="space-y-0.5">
              {activeCategories.map((category) => (
                <SidebarNavItem
                  key={category}
                  icon={CATEGORY_ICONS[category]}
                  label={CATEGORY_LABELS[category]}
                  count={categoryCounts[category] ?? 0}
                  isActive={activeView === category && !activeTag}
                  onClick={() => setActiveView(category)}
                />
              ))}
            </div>
          </>
        )}

        {/* Tags */}
        {tagCounts.length > 0 && (
          <>
            <SectionHeader label="Tags" />
            <div className="space-y-0.5">
              {tagCounts.map(([tag, count]) => (
                <SidebarNavItem
                  key={tag}
                  icon={Tag}
                  label={tag}
                  count={count}
                  isActive={activeTag === tag}
                  onClick={() => handleTagClick(tag)}
                  indent
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-2 border-t border-vault-border shrink-0 space-y-1">
        {/* YOLO mode toggle */}
        <button
          onClick={handleYoloToggle}
          className={clsx(
            'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium',
            'transition-colors duration-100',
            yoloMode
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
              : 'text-vault-muted hover:text-vault-text hover:bg-black/[0.04]',
          )}
        >
          <Zap size={14} strokeWidth={1.75} className={yoloMode ? 'fill-amber-500' : ''} />
          <span>YOLO Mode</span>
          <span
            className={clsx(
              'ml-auto text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
              yoloMode ? 'bg-amber-200 text-amber-800' : 'bg-vault-surface text-vault-muted',
            )}
          >
            {yoloMode ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* YOLO password prompt */}
        {showYoloPrompt && (
          <div className="px-2 py-2 bg-vault-surface rounded-lg border border-vault-border space-y-2">
            <p className="text-[11px] text-vault-muted">Enter master password to enable YOLO mode (skips lock screen):</p>
            <input
              type="password"
              value={yoloPassword}
              onChange={(e) => { setYoloPassword(e.target.value); setYoloError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleYoloSubmit()}
              placeholder="Master password"
              autoFocus
              className={clsx(
                'w-full px-2.5 py-1.5 text-[12px] rounded-md',
                'bg-white border border-vault-border',
                'focus:outline-none focus:ring-1 focus:ring-vault-accent',
                yoloError && 'border-vault-danger',
              )}
            />
            {yoloError && <p className="text-[11px] text-vault-danger">{yoloError}</p>}
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowYoloPrompt(false)}
                className="flex-1 py-1 text-[11px] rounded-md bg-vault-surface border border-vault-border text-vault-muted hover:text-vault-text"
              >
                Cancel
              </button>
              <button
                onClick={handleYoloSubmit}
                disabled={!yoloPassword}
                className="flex-1 py-1 text-[11px] rounded-md bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {/* Lock button (hidden in YOLO mode) */}
        {!yoloMode && (
          <button
            onClick={lock}
            className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium',
              'text-vault-muted hover:text-vault-text hover:bg-black/[0.04]',
              'transition-colors duration-100',
            )}
          >
            <Lock size={14} strokeWidth={1.75} />
            <span>Lock Vault</span>
          </button>
        )}
      </div>
    </div>
  );
}
