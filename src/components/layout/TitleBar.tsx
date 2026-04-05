import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Cloud, Minus, Square, X, ShieldCheck } from 'lucide-react';
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
        'h-11 flex items-center shrink-0 select-none',
        'bg-vault-bg border-b border-vault-border/30',
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

      {/* App name centered */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        <ShieldCheck
          size={14}
          className="text-vault-text/50 shrink-0"
          strokeWidth={1.75}
        />
        <span className="text-[13px] font-medium text-vault-text/60 tracking-wide">
          {APP_NAME}
        </span>
      </div>

      {/* Right controls */}
      <div
        className="flex items-center gap-0.5 pr-2 shrink-0"
        style={{
          // @ts-expect-error -- webkit non-standard property
          WebkitAppRegion: 'no-drag',
        }}
      >
        {/* Sync indicator */}
        {!isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md mr-1"
            title={isSynced ? 'Vault synced' : 'Not synced'}
          >
            <Cloud
              size={13}
              className={isSynced ? 'text-vault-success/50' : 'text-vault-muted/40'}
              strokeWidth={1.75}
            />
            <span className="text-[11px] text-vault-muted/40 font-medium">
              {isSynced ? 'Synced' : 'Local'}
            </span>
          </motion.div>
        )}

        {/* Lock button */}
        {!isLocked && (
          <button
            onClick={handleLock}
            className={clsx(
              'p-1.5 rounded-md transition-colors duration-150',
              'text-vault-muted/50 hover:text-vault-text hover:bg-vault-raised/60',
            )}
            title="Lock vault (⌘L)"
          >
            <Lock size={13} strokeWidth={1.75} />
          </button>
        )}

        {/* Non-macOS window controls */}
        {!isMac && (
          <div className="flex items-center ml-2 gap-0.5">
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded hover:bg-vault-raised/60 text-vault-muted/50 hover:text-vault-text transition-colors"
            >
              <Minus size={13} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded hover:bg-vault-raised/60 text-vault-muted/50 hover:text-vault-text transition-colors"
            >
              <Square size={11} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded hover:bg-vault-danger/70 text-vault-muted/50 hover:text-white transition-colors"
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
