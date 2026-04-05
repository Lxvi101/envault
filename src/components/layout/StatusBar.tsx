import { useMemo } from 'react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';

export function StatusBar() {
  const projects = useVaultStore((s) => s.projects);

  const totalVars = useMemo(
    () =>
      projects.reduce(
        (total, p) =>
          total + p.environments.reduce((envTotal, e) => envTotal + e.variables.length, 0),
        0,
      ),
    [projects],
  );

  return (
    <div
      className={clsx(
        'h-6 flex items-center px-3 gap-3 shrink-0 select-none',
        'bg-vault-bg border-t border-vault-border/20',
        'text-[10px] text-vault-muted/35 tabular-nums',
      )}
    >
      {/* Sync status */}
      <div className="flex items-center gap-1.5">
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            projects.length > 0 ? 'bg-vault-success/50' : 'bg-vault-muted/30',
          )}
        />
        <span>{projects.length > 0 ? 'Synced' : 'Local'}</span>
      </div>

      <div className="flex-1" />

      {/* Counts */}
      <span>
        {projects.length} project{projects.length !== 1 ? 's' : ''}
      </span>
      <span className="text-vault-border/40">/</span>
      <span>
        {totalVars} variable{totalVars !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
