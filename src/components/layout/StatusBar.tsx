import { useMemo } from 'react';
import { Cloud, CloudOff, Clock } from 'lucide-react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';

export function StatusBar() {
  const projects = useVaultStore((s) => s.projects);

  const totalVars = useMemo(
    () =>
      projects.reduce(
        (total, p) => total + p.environments.reduce((envTotal, e) => envTotal + e.variables.length, 0),
        0,
      ),
    [projects],
  );

  const lastModified = useMemo(() => {
    if (projects.length === 0) return null;
    const sorted = [...projects].sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
    );
    return sorted[0]?.modifiedAt ?? null;
  }, [projects]);

  const formattedLastModified = useMemo(() => {
    if (!lastModified) return null;
    const date = new Date(lastModified);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }, [lastModified]);

  return (
    <div
      className={clsx(
        'h-7 flex items-center px-3 gap-4 shrink-0 select-none',
        'bg-vault-surface/40 border-t border-vault-border/30',
        'text-[10px] text-vault-muted/50 tabular-nums',
      )}
    >
      {/* Sync status */}
      <div className="flex items-center gap-1.5">
        {projects.length > 0 ? (
          <>
            <Cloud size={10} className="text-vault-success/50" />
            <span>Synced</span>
          </>
        ) : (
          <>
            <CloudOff size={10} />
            <span>Local</span>
          </>
        )}
      </div>

      {/* Last modified */}
      {formattedLastModified && (
        <div className="flex items-center gap-1.5">
          <Clock size={10} />
          <span>Modified {formattedLastModified}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Counts */}
      <span>
        {projects.length} project{projects.length !== 1 ? 's' : ''}
      </span>
      <span className="text-vault-border">|</span>
      <span>
        {totalVars} variable{totalVars !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
