import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Cloud, CloudOff, Minus, Square, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/useAuthStore';
import { APP_NAME } from '@/lib/constants';
import * as api from '@/lib/api';

export function TitleBar() {
  const { lock, isLocked } = useAuthStore();
  const [platform, setPlatform] = useState('darwin');
  const [isSynced] = useState(true);
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
        'bg-vault-surface/80 backdrop-blur-md',
        'border-b border-vault-border/50',
      )}
      style={{
        // @ts-expect-error -- webkit non-standard property
        WebkitAppRegion: 'drag',
      }}
    >
      {/* macOS traffic light spacer */}
      {isMac && <div className="w-[72px] shrink-0" />}

      {/* Non-macOS window controls (left side) */}
      {!isMac && (
        <div
          className="flex items-center shrink-0 pl-2"
          style={{
            // @ts-expect-error -- webkit non-standard property
            WebkitAppRegion: 'no-drag',
          }}
        >
          {/* Intentionally empty on left for non-mac; controls are on right */}
        </div>
      )}

      {/* App name - centered */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm font-semibold text-vault-muted/70 tracking-wide">
          {APP_NAME}
        </span>
      </div>

      {/* Right controls */}
      <div
        className="flex items-center gap-1 pr-3 shrink-0"
        style={{
          // @ts-expect-error -- webkit non-standard property
          WebkitAppRegion: 'no-drag',
        }}
      >
        {/* Sync status */}
        {!isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg mr-1"
            title={isSynced ? 'Synced' : 'Not synced'}
          >
            {isSynced ? (
              <Cloud size={14} className="text-vault-success/70" />
            ) : (
              <CloudOff size={14} className="text-vault-muted/50" />
            )}
            <span className="text-[11px] text-vault-muted/60">
              {isSynced ? 'Synced' : 'Local'}
            </span>
          </motion.div>
        )}

        {/* Lock button */}
        {!isLocked && (
          <button
            onClick={handleLock}
            className={clsx(
              'p-1.5 rounded-lg transition-colors duration-150',
              'text-vault-muted hover:text-vault-text hover:bg-vault-raised',
            )}
            title="Lock vault (Cmd+L)"
          >
            <Lock size={14} />
          </button>
        )}

        {/* Non-macOS window controls */}
        {!isMac && (
          <div className="flex items-center ml-2 gap-0.5">
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded hover:bg-vault-raised text-vault-muted hover:text-vault-text transition-colors"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded hover:bg-vault-raised text-vault-muted hover:text-vault-text transition-colors"
            >
              <Square size={12} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded hover:bg-vault-danger/80 text-vault-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
