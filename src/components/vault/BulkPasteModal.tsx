import { useState, useCallback, useEffect, useRef } from 'react';
import { ClipboardPaste, Check, AlertTriangle, KeyRound, X } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { parseEnvString } from '@/lib/env-parser';

interface ParsedEntry {
  key: string;
  value: string;
  isDuplicate: boolean;
}

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: { key: string; value: string }[]) => void;
  existingKeys: string[];
}

export function BulkPasteModal({
  isOpen,
  onClose,
  onImport,
  existingKeys,
}: BulkPasteModalProps) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<ParsedEntry[]>([]);
  const [hasAttempted, setHasAttempted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset when the modal opens
  useEffect(() => {
    if (isOpen) {
      setRaw('');
      setParsed([]);
      setHasAttempted(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Live-parse as the user types / pastes
  useEffect(() => {
    if (!raw.trim()) {
      setParsed([]);
      return;
    }

    const record = parseEnvString(raw);
    const upperExisting = new Set(existingKeys.map((k) => k.toUpperCase()));

    const entries: ParsedEntry[] = Object.entries(record).map(([key, value]) => ({
      key,
      value,
      isDuplicate: upperExisting.has(key.toUpperCase()),
    }));

    setParsed(entries);
  }, [raw, existingKeys]);

  const newEntries = parsed.filter((e) => !e.isDuplicate);
  const duplicateEntries = parsed.filter((e) => e.isDuplicate);

  const handleImport = useCallback(() => {
    setHasAttempted(true);
    if (newEntries.length === 0) return;

    onImport(newEntries.map(({ key, value }) => ({ key, value })));
    onClose();
  }, [newEntries, onImport, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paste Environment Variables"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={newEntries.length === 0}
            leftIcon={<ClipboardPaste className="w-4 h-4" />}
          >
            {newEntries.length > 0
              ? `Import ${newEntries.length} Variable${newEntries.length === 1 ? '' : 's'}`
              : 'Import'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Instructions */}
        <p className="text-[13px] text-vault-muted">
          Paste your <code className="px-1.5 py-0.5 rounded bg-vault-surface border border-vault-border text-[12px] font-mono text-vault-accent">.env</code> content
          below. Supports standard <code className="px-1.5 py-0.5 rounded bg-vault-surface border border-vault-border text-[12px] font-mono text-vault-accent">KEY=value</code> format,
          comments, quotes, and multi-line values.
        </p>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`DATABASE_URL=postgres://localhost:5432/mydb\nAPI_KEY=sk-1234567890\nNODE_ENV=production\n\n# Paste from Vercel, Railway, .env files, etc.`}
          spellCheck={false}
          className={clsx(
            'w-full h-48 px-4 py-3 rounded-lg border text-[13px] font-mono leading-relaxed',
            'bg-vault-surface text-vault-text placeholder:text-vault-muted/40',
            'outline-none resize-none transition-all',
            'border-vault-border focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]',
          )}
        />

        {/* Live preview */}
        {parsed.length > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-vault-muted flex items-center gap-1.5">
              <Check size={13} strokeWidth={2} className="text-vault-success" />
              {parsed.length} variable{parsed.length === 1 ? '' : 's'} detected
              {duplicateEntries.length > 0 && (
                <span className="text-vault-warning ml-1">
                  ({duplicateEntries.length} duplicate{duplicateEntries.length === 1 ? '' : 's'} will be skipped)
                </span>
              )}
            </p>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-vault-border divide-y divide-vault-border/60">
              {parsed.map((entry) => (
                <div
                  key={entry.key}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 text-[12px]',
                    entry.isDuplicate && 'opacity-50 bg-vault-surface/50',
                  )}
                >
                  <KeyRound
                    size={12}
                    strokeWidth={2}
                    className={entry.isDuplicate ? 'text-vault-warning shrink-0' : 'text-vault-accent shrink-0'}
                  />
                  <span className="font-mono font-medium text-vault-accent min-w-0 truncate shrink-0">
                    {entry.key}
                  </span>
                  <span className="text-vault-muted mx-1">=</span>
                  <span className="font-mono text-vault-text truncate min-w-0 flex-1">
                    {entry.value.length > 60 ? entry.value.slice(0, 60) + '...' : entry.value}
                  </span>
                  {entry.isDuplicate && (
                    <span className="flex items-center gap-1 text-vault-warning shrink-0">
                      <AlertTriangle size={11} strokeWidth={2} />
                      <span className="text-[11px]">exists</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state: tried to import with nothing parseable */}
        {hasAttempted && newEntries.length === 0 && raw.trim() && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-vault-danger/5 border border-vault-danger/20">
            <X size={14} strokeWidth={2} className="text-vault-danger shrink-0" />
            <p className="text-[12px] text-vault-danger">
              {parsed.length > 0
                ? 'All parsed variables already exist in this environment.'
                : 'No valid KEY=value pairs found. Check the format and try again.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
