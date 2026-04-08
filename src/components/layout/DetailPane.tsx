import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  Shield,
  Copy,
  Check,
  Eye,
  EyeOff,
  Star,
  Tag,
  Trash2,
  Edit3,
  Download,
  Upload,
  Plus,
  FolderOpen,
  KeyRound,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';
import { useToastStore } from '@/stores/useToastStore';
import * as apiLib from '@/lib/api';
import { FadeIn } from '@/components/motion/FadeIn';
import { ContextMenu, type ContextMenuItem } from '@/components/shared/ContextMenu';
import { DeleteConfirm } from '@/components/vault/DeleteConfirm';
import type { VaultProject, Environment, EnvVariable } from '@/types/vault';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/vault';

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyDetailState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <FadeIn className="text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-vault-surface border border-vault-border flex items-center justify-center mx-auto mb-5">
          <Shield size={28} className="text-vault-muted/40" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-medium text-vault-muted mb-1">
          Select an item
        </p>
        <p className="text-[13px] text-vault-muted/60">
          Choose an item from the list to view its details
        </p>
      </FadeIn>
    </div>
  );
}

// ─── Inline variable editor ─────────────────────────────────────────────────

interface InlineEditorProps {
  initial?: EnvVariable | null;
  existingKeys: string[];
  onSave: (data: Partial<EnvVariable>) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

function InlineEditor({ initial, existingKeys, onSave, onCancel, autoFocus = true }: InlineEditorProps) {
  const [key, setKey] = useState(initial?.key ?? '');
  const [value, setValue] = useState(initial?.value ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isSecret, setIsSecret] = useState(initial?.isSecret ?? false);
  const [showValue, setShowValue] = useState(!initial?.isSecret);
  const [error, setError] = useState('');
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => keyRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const handleSave = useCallback(() => {
    const trimmedKey = key.trim().toUpperCase();
    if (!trimmedKey) {
      setError('Key is required');
      return;
    }
    // Check for duplicates (skip self)
    const isDuplicate = existingKeys.some(
      (k) => k.toUpperCase() === trimmedKey && (!initial || initial.key.toUpperCase() !== trimmedKey),
    );
    if (isDuplicate) {
      setError('Duplicate key');
      return;
    }
    onSave({ key: trimmedKey, value, description: description.trim(), isSecret });
  }, [key, value, description, isSecret, existingKeys, initial, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSave, onCancel],
  );

  return (
    <div className="px-6 py-3 bg-vault-surface/50 border-b border-vault-border/60" onKeyDown={handleKeyDown}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={keyRef}
              value={key}
              onChange={(e) => {
                setKey(e.target.value.toUpperCase().replace(/\s/g, '_'));
                setError('');
              }}
              placeholder="KEY_NAME"
              className={clsx(
                'w-full px-3 py-2 rounded-lg border text-[13px] font-mono text-vault-accent placeholder:text-vault-muted/40 outline-none transition-all',
                error
                  ? 'border-vault-danger focus:shadow-[0_0_0_3px_rgba(255,59,48,0.1)]'
                  : 'border-vault-border focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]',
              )}
            />
            {error && <p className="text-[11px] text-vault-danger mt-0.5">{error}</p>}
          </div>
          <div className="flex-[2] relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type={showValue ? 'text' : 'password'}
              placeholder="value"
              className="w-full px-3 py-2 pr-9 rounded-lg border border-vault-border text-[13px] font-mono text-vault-text placeholder:text-vault-muted/40 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowValue(!showValue)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text transition-colors"
              tabIndex={-1}
            >
              {showValue ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-1.5 rounded-lg border border-vault-border text-[12px] text-vault-muted placeholder:text-vault-muted/40 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-[18px] rounded-full bg-vault-raised peer-checked:bg-vault-accent transition-colors" />
              <div className="absolute top-[1px] left-[1px] w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-[14px] transition-all" />
            </div>
            <span className="text-[12px] text-vault-muted">Secret</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
            >
              <X size={12} strokeWidth={2} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-vault-accent text-white hover:bg-vault-accent-hover transition-colors"
            >
              <Check size={12} strokeWidth={2} />
              {initial ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field row (1Password style) ─────────────────────────────────────────────

interface FieldRowProps {
  variable: EnvVariable;
  onEdit: (variable: EnvVariable) => void;
  onDelete: (variable: EnvVariable) => void;
  isEditing: boolean;
  existingKeys: string[];
  onSave: (data: Partial<EnvVariable>) => void;
  onCancelEdit: () => void;
}

function FieldRow({ variable, onEdit, onDelete, isEditing, existingKeys, onSave, onCancelEdit }: FieldRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = variable.isSecret && !revealed
    ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
    : variable.value;

  const handleCopy = useCallback(async () => {
    try {
      await apiLib.copySecret(variable.value);
    } catch {
      try {
        await navigator.clipboard.writeText(variable.value);
      } catch { /* silently ignore */ }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [variable.value]);

  const contextMenuItems: ContextMenuItem[] = useMemo(() => [
    {
      type: 'item',
      label: 'Copy Value',
      icon: <Copy size={14} strokeWidth={1.75} />,
      onClick: handleCopy,
    },
    {
      type: 'item',
      label: 'Edit',
      icon: <Edit3 size={14} strokeWidth={1.75} />,
      onClick: () => onEdit(variable),
    },
    ...(variable.isSecret
      ? [{
          type: 'item' as const,
          label: revealed ? 'Hide Value' : 'Reveal Value',
          icon: revealed ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />,
          onClick: () => setRevealed(!revealed),
        }]
      : []),
    { type: 'divider' as const },
    {
      type: 'item' as const,
      label: 'Delete',
      icon: <Trash2 size={14} strokeWidth={1.75} />,
      onClick: () => onDelete(variable),
      danger: true,
    },
  ], [variable, revealed, handleCopy, onEdit, onDelete]);

  if (isEditing) {
    return (
      <InlineEditor
        initial={variable}
        existingKeys={existingKeys}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <ContextMenu items={contextMenuItems}>
      <div
        className={clsx(
          'group px-6 py-3 border-b border-vault-border/60 last:border-b-0',
          'hover:bg-vault-surface/50 transition-colors duration-75',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-vault-accent mb-0.5">
              {variable.key.toLowerCase().replace(/_/g, ' ')}
            </p>
            <p
              className={clsx(
                'text-[14px] font-mono',
                variable.isSecret && !revealed
                  ? 'text-vault-text/60 tracking-[0.2em]'
                  : 'text-vault-text',
              )}
            >
              {displayValue}
            </p>
            {variable.description && (
              <p className="text-[11px] text-vault-muted mt-0.5">{variable.description}</p>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-75">
            {variable.isSecret && (
              <button
                onClick={() => setRevealed(!revealed)}
                className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
                title={revealed ? 'Hide value' : 'Reveal value'}
              >
                {revealed ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
              </button>
            )}
            <button
              onClick={handleCopy}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                copied
                  ? 'text-vault-success'
                  : 'text-vault-muted hover:text-vault-text hover:bg-vault-raised',
              )}
              title="Copy value"
            >
              {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
            </button>
            <button
              onClick={() => onEdit(variable)}
              className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
              title="Edit"
            >
              <Edit3 size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => onDelete(variable)}
              className="p-1.5 rounded-lg text-vault-muted hover:text-vault-danger hover:bg-vault-danger/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </ContextMenu>
  );
}

// ─── Environment tabs + variable list ────────────────────────────────────────

interface EnvSectionProps {
  environments: Environment[];
  projectId: string;
}

function EnvSection({ environments, projectId }: EnvSectionProps) {
  const [activeEnvId, setActiveEnvId] = useState<string>(environments[0]?.id ?? '');
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EnvVariable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addVariable, updateVariable, deleteVariable } = useVaultStore();
  const addToast = useToastStore((s) => s.addToast);

  // Reset tab when project changes
  useEffect(() => {
    if (environments.length > 0) {
      setActiveEnvId(environments[0].id);
    }
    setEditingVariableId(null);
    setIsAdding(false);
  }, [environments]);

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvId) ?? environments[0],
    [environments, activeEnvId],
  );

  const existingKeys = useMemo(
    () => (activeEnv?.variables ?? []).map((v) => v.key),
    [activeEnv],
  );

  const handleEditVariable = useCallback((variable: EnvVariable) => {
    setEditingVariableId(variable.id);
    setIsAdding(false);
  }, []);

  const handleSaveVariable = useCallback(
    async (variableId: string | null, data: Partial<EnvVariable>) => {
      if (!activeEnv) return;
      try {
        if (variableId) {
          await updateVariable(projectId, activeEnv.id, variableId, data);
          addToast('success', 'Variable updated');
        } else {
          await addVariable(projectId, activeEnv.id, data);
          addToast('success', 'Variable added');
        }
        setEditingVariableId(null);
        setIsAdding(false);
      } catch {
        addToast('error', 'Failed to save variable');
      }
    },
    [activeEnv, projectId, addVariable, updateVariable, addToast],
  );

  const handleDeleteVariable = useCallback(async () => {
    if (!activeEnv || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVariable(projectId, activeEnv.id, deleteTarget.id);
      addToast('success', 'Variable deleted');
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Failed to delete variable');
    } finally {
      setIsDeleting(false);
    }
  }, [activeEnv, deleteTarget, projectId, deleteVariable, addToast]);

  if (environments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-[13px] text-vault-muted">No environments configured</p>
      </div>
    );
  }

  const regularVars = activeEnv?.variables.filter((v) => !v.isSecret) ?? [];
  const secretVars = activeEnv?.variables.filter((v) => v.isSecret) ?? [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-6 pt-3 pb-0 border-b border-vault-border shrink-0">
        {environments.map((env) => {
          const isActive = env.id === activeEnvId;
          return (
            <button
              key={env.id}
              onClick={() => setActiveEnvId(env.id)}
              className={clsx(
                'relative px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors duration-75',
                isActive ? 'text-vault-accent' : 'text-vault-muted hover:text-vault-text',
              )}
            >
              {env.name}
              <span
                className={clsx(
                  'ml-1.5 text-[11px] tabular-nums',
                  isActive ? 'text-vault-accent/60' : 'text-vault-muted/50',
                )}
              >
                {env.variables.length}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-vault-accent rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Variables */}
      <div className="flex-1 overflow-y-auto">
        {activeEnv && activeEnv.variables.length > 0 ? (
          <>
            {regularVars.length > 0 && (
              <div className="border-b border-vault-border/40">
                {regularVars.map((variable) => (
                  <FieldRow
                    key={variable.id}
                    variable={variable}
                    onEdit={handleEditVariable}
                    onDelete={(v) => setDeleteTarget(v)}
                    isEditing={editingVariableId === variable.id}
                    existingKeys={existingKeys}
                    onSave={(data) => handleSaveVariable(variable.id, data)}
                    onCancelEdit={() => setEditingVariableId(null)}
                  />
                ))}
              </div>
            )}

            {secretVars.length > 0 && (
              <>
                <div className="px-6 pt-4 pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-vault-text flex items-center gap-1.5">
                    <KeyRound size={12} strokeWidth={2} />
                    Security
                  </p>
                </div>
                <div className="border-b border-vault-border/40">
                  {secretVars.map((variable) => (
                    <FieldRow
                      key={variable.id}
                      variable={variable}
                      onEdit={handleEditVariable}
                      onDelete={(v) => setDeleteTarget(v)}
                      isEditing={editingVariableId === variable.id}
                      existingKeys={existingKeys}
                      onSave={(data) => handleSaveVariable(variable.id, data)}
                      onCancelEdit={() => setEditingVariableId(null)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Inline add form */}
            {isAdding ? (
              <InlineEditor
                existingKeys={existingKeys}
                onSave={(data) => handleSaveVariable(null, data)}
                onCancel={() => setIsAdding(false)}
              />
            ) : (
              <div className="px-6 py-4">
                <button
                  onClick={() => { setIsAdding(true); setEditingVariableId(null); }}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
                    'border border-dashed border-vault-border',
                    'text-[13px] text-vault-muted hover:text-vault-accent',
                    'hover:border-vault-accent/40 hover:bg-vault-accent/5',
                    'transition-all duration-100',
                  )}
                >
                  <Plus size={14} strokeWidth={2} />
                  Add Variable
                </button>
              </div>
            )}
          </>
        ) : isAdding ? (
          <InlineEditor
            existingKeys={existingKeys}
            onSave={(data) => handleSaveVariable(null, data)}
            onCancel={() => setIsAdding(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-12 h-12 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-center mb-3">
              <KeyRound size={20} className="text-vault-muted" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-vault-muted mb-4">No variables yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-vault-accent text-white text-[13px] font-medium',
                'hover:bg-vault-accent-hover transition-colors',
              )}
            >
              <Plus size={14} strokeWidth={2} />
              Add first variable
            </button>
          </div>
        )}

        {/* Last edited section */}
        {activeEnv && (
          <div className="px-6 py-3 border-t border-vault-border/40">
            <span className="text-[12px] text-vault-muted">
              Last edited {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteVariable}
        isLoading={isDeleting}
        title="Delete Variable"
        description={`Are you sure you want to delete "${deleteTarget?.key}"? This action cannot be undone.`}
      />
    </div>
  );
}

// ─── Project detail ───────────────────────────────────────────────────────────

interface ProjectDetailProps {
  project: VaultProject;
  onEdit: () => void;
}

function ProjectDetail({ project, onEdit }: ProjectDetailProps) {
  const { toggleFavorite, deleteProject } = useVaultStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const categoryColor = CATEGORY_COLORS[project.category];

  const handleExport = useCallback(async () => {
    if (project.environments.length === 0) return;
    try {
      const result = await apiLib.exportEnv(project.id, project.environments[0].id);
      if (result.success) {
        addToast('success', `Exported to ${result.path}`);
      }
    } catch {
      addToast('error', 'Failed to export');
    }
  }, [project, addToast]);

  const handleImport = useCallback(async () => {
    if (project.environments.length === 0) return;
    try {
      const result = await apiLib.importEnv(project.id, project.environments[0].id);
      if (result.success) {
        addToast('success', `Imported ${result.count} variables`);
        useVaultStore.getState().refreshProjects();
      }
    } catch {
      addToast('error', 'Failed to import');
    }
  }, [project, addToast]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      addToast('success', 'Project deleted');
      setShowDeleteConfirm(false);
    } catch {
      addToast('error', 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  }, [project.id, deleteProject, addToast]);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Top bar with breadcrumb and actions */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-vault-border shrink-0">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-vault-muted flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-vault-accent/10 flex items-center justify-center">
              <FolderOpen size={11} className="text-vault-accent" strokeWidth={2} />
            </div>
            My Vault
          </span>
          <span className="text-vault-muted">&middot;</span>
          <span
            className="font-medium px-1.5 py-0.5 rounded text-[12px]"
            style={{ backgroundColor: `${categoryColor}12`, color: categoryColor }}
          >
            {CATEGORY_LABELS[project.category]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
          >
            <Edit3 size={13} strokeWidth={1.75} />
            Edit
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-3 border border-vault-border"
            style={{ backgroundColor: `${categoryColor}10` }}
          >
            {project.icon.length <= 2 ? (
              <span>{project.icon}</span>
            ) : (
              <FolderOpen size={28} style={{ color: categoryColor }} strokeWidth={1.5} />
            )}
          </div>

          <h1 className="text-[22px] font-bold text-vault-text mb-1">
            {project.name}
          </h1>

          <button
            onClick={() => toggleFavorite(project.id)}
            className={clsx(
              'p-1 rounded transition-colors mb-2',
              project.isFavorite
                ? 'text-yellow-500'
                : 'text-vault-muted/30 hover:text-yellow-500',
            )}
          >
            <Star
              size={18}
              strokeWidth={1.75}
              fill={project.isFavorite ? 'currentColor' : 'none'}
            />
          </button>

          {project.description && (
            <p className="text-[13px] text-vault-muted mb-3 max-w-md">
              {project.description}
            </p>
          )}

          {project.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center mb-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] text-vault-muted px-2 py-0.5 rounded-full bg-vault-surface border border-vault-border"
                >
                  <Tag size={9} strokeWidth={2} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-vault-surface border border-vault-border text-vault-text hover:bg-vault-raised transition-colors"
          >
            <Edit3 size={12} strokeWidth={1.75} />
            Edit
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-vault-surface border border-vault-border text-vault-text hover:bg-vault-raised transition-colors"
          >
            <Download size={12} strokeWidth={1.75} />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-vault-surface border border-vault-border text-vault-text hover:bg-vault-raised transition-colors"
          >
            <Upload size={12} strokeWidth={1.75} />
            Import
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-vault-danger hover:bg-vault-danger/10 border border-transparent hover:border-vault-danger/20 transition-colors"
          >
            <Trash2 size={12} strokeWidth={1.75} />
            Delete
          </button>
        </div>
      </div>

      {/* Environment tabs + variables */}
      <EnvSection environments={project.environments} projectId={project.id} />

      {/* Delete project confirmation */}
      <DeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? All environments and variables will be permanently deleted.`}
      />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

interface DetailPaneProps {
  onEditProject?: (project: VaultProject) => void;
}

export function DetailPane({ onEditProject }: DetailPaneProps) {
  const selectedProjectId = useVaultStore((s) => s.selectedProjectId);
  const projects = useVaultStore((s) => s.projects);

  const project = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  return (
    <div className="flex-1 min-w-0 h-full bg-white flex flex-col">
      {project ? (
        <ProjectDetail
          key={project.id}
          project={project}
          onEdit={() => onEditProject?.(project)}
        />
      ) : (
        <EmptyDetailState />
      )}
    </div>
  );
}
