import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Share2,
  MoreVertical,
  KeyRound,
} from 'lucide-react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';
import { useToastStore } from '@/stores/useToastStore';
import * as apiLib from '@/lib/api';
import { pageVariants } from '@/components/motion/variants';
import { FadeIn } from '@/components/motion/FadeIn';
import { EnvEditor } from '@/components/vault/EnvEditor';
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

// ─── Field row (1Password style) ─────────────────────────────────────────────

interface FieldRowProps {
  variable: EnvVariable;
  projectId: string;
  envId: string;
  onEdit: (variable: EnvVariable) => void;
  onDelete: (variable: EnvVariable) => void;
}

function FieldRow({ variable, onEdit, onDelete }: FieldRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = useMemo(() => {
    if (variable.isSecret && !revealed) {
      return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
    }
    return variable.value;
  }, [variable.isSecret, variable.value, revealed]);

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

  return (
    <div
      className={clsx(
        'group px-6 py-3 border-b border-vault-border/60 last:border-b-0',
        'hover:bg-vault-surface/50 transition-colors duration-100 cursor-pointer',
      )}
      onClick={() => onEdit(variable)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label (like 1Password field labels in blue) */}
          <p className="text-[12px] font-medium text-vault-accent mb-0.5">
            {variable.key.toLowerCase().replace(/_/g, ' ')}
          </p>
          {/* Value */}
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
          {/* Description */}
          {variable.description && (
            <p className="text-[11px] text-vault-muted mt-0.5">{variable.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
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
            onClick={() => onDelete(variable)}
            className="p-1.5 rounded-lg text-vault-muted hover:text-vault-danger hover:bg-vault-danger/10 transition-colors"
            title="Delete variable"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Environment tabs + variable list ────────────────────────────────────────

interface EnvSectionProps {
  environments: Environment[];
  projectId: string;
}

function EnvSection({ environments, projectId }: EnvSectionProps) {
  const [activeEnvId, setActiveEnvId] = useState<string>(environments[0]?.id ?? '');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnvVariable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addVariable, updateVariable, deleteVariable } = useVaultStore();
  const addToast = useToastStore((s) => s.addToast);

  // Reset tab when environments change (different project selected)
  useEffect(() => {
    if (environments.length > 0) {
      setActiveEnvId(environments[0].id);
    }
  }, [environments]);

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvId) ?? environments[0],
    [environments, activeEnvId],
  );

  const existingKeys = useMemo(
    () => (activeEnv?.variables ?? []).map((v) => v.key),
    [activeEnv],
  );

  const handleAddVariable = useCallback(() => {
    setEditingVariable(null);
    setEditorOpen(true);
  }, []);

  const handleEditVariable = useCallback((variable: EnvVariable) => {
    setEditingVariable(variable);
    setEditorOpen(true);
  }, []);

  const handleSaveVariable = useCallback(
    async (data: Partial<EnvVariable>) => {
      if (!activeEnv) return;
      try {
        if (editingVariable) {
          await updateVariable(projectId, activeEnv.id, editingVariable.id, data);
          addToast('success', 'Variable updated');

        } else {
          await addVariable(projectId, activeEnv.id, data);
          addToast('success', 'Variable added');

        }
      } catch {
        addToast('error', 'Failed to save variable');

      }
    },
    [activeEnv, editingVariable, projectId, addVariable, updateVariable, addToast],
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
      <FadeIn className="flex-1 flex items-center justify-center py-12">
        <p className="text-[13px] text-vault-muted">No environments configured</p>
      </FadeIn>
    );
  }

  // Separate secret and non-secret variables
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
                'relative px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors duration-100',
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
                <motion.div
                  layoutId="active-env-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-vault-accent rounded-t-full"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Variables */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEnvId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {activeEnv && activeEnv.variables.length > 0 ? (
              <>
                {/* Regular variables */}
                {regularVars.length > 0 && (
                  <div className="border-b border-vault-border/40">
                    {regularVars.map((variable) => (
                      <FieldRow
                        key={variable.id}
                        variable={variable}
                        projectId={projectId}
                        envId={activeEnv.id}
                        onEdit={handleEditVariable}
                        onDelete={(v) => setDeleteTarget(v)}
                      />
                    ))}
                  </div>
                )}

                {/* Security section header */}
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
                          projectId={projectId}
                          envId={activeEnv.id}
                          onEdit={handleEditVariable}
                          onDelete={(v) => setDeleteTarget(v)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Add Variable button */}
                <div className="px-6 py-4">
                  <button
                    onClick={handleAddVariable}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
                      'border border-dashed border-vault-border',
                      'text-[13px] text-vault-muted hover:text-vault-accent',
                      'hover:border-vault-accent/40 hover:bg-vault-accent/5',
                      'transition-all duration-150',
                    )}
                  >
                    <Plus size={14} strokeWidth={2} />
                    Add Variable
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-12 h-12 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-center mb-3">
                  <KeyRound size={20} className="text-vault-muted" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-vault-muted mb-4">No variables yet</p>
                <button
                  onClick={handleAddVariable}
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
          </motion.div>
        </AnimatePresence>

        {/* Last edited section */}
        {activeEnv && (
          <div className="px-6 py-3 border-t border-vault-border/40">
            <button className="flex items-center gap-1.5 text-[12px] text-vault-muted hover:text-vault-text transition-colors">
              <ChevronDown size={14} strokeWidth={1.75} />
              <span>Last edited {new Date(activeEnv.notes ? Date.now() : Date.now()).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </button>
          </div>
        )}
      </div>

      {/* EnvEditor modal */}
      <EnvEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingVariable(null);
        }}
        onSave={handleSaveVariable}
        existingVariable={editingVariable}
        existingKeys={existingKeys}
      />

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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col"
    >
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
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors">
            <Share2 size={13} strokeWidth={1.75} />
            Share
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
          >
            <Edit3 size={13} strokeWidth={1.75} />
            Edit
          </button>
          <button className="p-1 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors">
            <MoreVertical size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex flex-col items-center text-center">
          {/* Project icon */}
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

          {/* Name */}
          <h1 className="text-[22px] font-bold text-vault-text mb-1">
            {project.name}
          </h1>

          {/* Favorite star */}
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

          {/* Description */}
          {project.description && (
            <p className="text-[13px] text-vault-muted mb-3 max-w-md">
              {project.description}
            </p>
          )}

          {/* Tags */}
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

        {/* Action bar */}
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
    </motion.div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

interface DetailPaneProps {
  onEditProject?: (project: VaultProject) => void;
}

export function DetailPane({ onEditProject }: DetailPaneProps) {
  const selectedProject = useVaultStore((s) => s.selectedProject);
  const project = selectedProject();

  return (
    <div className="flex-1 min-w-0 h-full bg-white flex flex-col">
      <AnimatePresence mode="wait">
        {project ? (
          <ProjectDetail
            key={project.id}
            project={project}
            onEdit={() => onEditProject?.(project)}
          />
        ) : (
          <motion.div
            key="empty"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col h-full"
          >
            <EmptyDetailState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
