import { useCallback, useEffect, useState } from 'react';
import {
  Lock,
  Minus,
  Square,
  X,
  Search,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSearchStore } from '@/stores/useSearchStore';
import { APP_NAME } from '@/lib/constants';
import * as api from '@/lib/api';

interface TitleBarProps {
  onNewItem?: () => void;
}

export function TitleBar({ onNewItem }: TitleBarProps) {
  const { lock, isLocked } = useAuthStore();
  const { open: openSearch } = useSearchStore();
  const [platform, setPlatform] = useState('darwin');
  const isMac = platform === 'darwin';

  useEffect(() => {
    api.getPlatform().then(setPlatform).catch(() => setPlatform('darwin'));
  }, []);

  const handleLock = useCallback(() => {
    if (!isLocked) lock();
  }, [lock, isLocked]);

  const handleMinimize = useCallback(() => api.minimize(), []);
  const handleMaximize = useCallback(() => api.maximize(), []);
  const handleClose = useCallback(() => api.close(), []);

  return (
    <div
      className={clsx(
        'h-12 flex items-center shrink-0 select-none',
        'bg-white border-b border-vault-border',
      )}
      style={{
        // @ts-expect-error -- webkit non-standard property
        WebkitAppRegion: 'drag',
      }}
    >
      {/* macOS traffic light spacer */}
      {isMac && <div className="w-[72px] shrink-0" />}

      {/* Non-macOS: left padding */}
      {!isMac && <div className="w-3 shrink-0" />}

      {/* App name */}
      <div className="flex items-center gap-2 px-2 shrink-0"
        style={{
          // @ts-expect-error -- webkit non-standard property
          WebkitAppRegion: 'no-drag',
        }}
      >
        <span className="text-[14px] font-bold text-vault-text">
          {APP_NAME}
        </span>
      </div>

      {/* Search bar - centered */}
      <div
        className="flex-1 flex justify-center px-4"
        style={{
          // @ts-expect-error -- webkit non-standard property
          WebkitAppRegion: 'no-drag',
        }}
      >
        <button
          onClick={openSearch}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg w-full max-w-md',
            'bg-vault-surface border border-vault-border',
            'text-vault-muted text-[13px]',
            'hover:border-vault-accent/30 transition-colors',
          )}
        >
          <Search size={14} strokeWidth={2} className="shrink-0 text-vault-muted" />
          <span className="flex-1 text-left">Search in {APP_NAME}</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-vault-raised text-vault-muted font-medium border border-vault-border">
            {'\u2318'}K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div
        className="flex items-center gap-1 pr-3 shrink-0"
        style={{
          // @ts-expect-error -- webkit non-standard property
          WebkitAppRegion: 'no-drag',
        }}
      >
        {/* New Item button */}
        {!isLocked && onNewItem && (
          <button
            onClick={onNewItem}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium',
              'bg-vault-accent text-white hover:bg-vault-accent-hover',
              'transition-colors shadow-sm active:scale-[0.98]',
            )}
          >
            <Plus size={14} strokeWidth={2.5} />
            New Item
          </button>
        )}

        {/* Lock button */}
        {!isLocked && (
          <button
            onClick={handleLock}
            className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors ml-1"
            title="Lock vault"
          >
            <Lock size={15} strokeWidth={1.75} />
          </button>
        )}

        {/* Non-macOS window controls */}
        {!isMac && (
          <div className="flex items-center ml-2 gap-0.5">
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded hover:bg-vault-raised text-vault-muted hover:text-vault-text transition-colors"
            >
              <Minus size={13} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded hover:bg-vault-raised text-vault-muted hover:text-vault-text transition-colors"
            >
              <Square size={11} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded hover:bg-vault-danger text-vault-muted hover:text-white transition-colors"
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
