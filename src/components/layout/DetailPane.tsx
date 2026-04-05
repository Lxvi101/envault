import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Copy,
  Eye,
  EyeOff,
  Star,
  Clock,
  Tag,
  Trash2,
  Edit3,
  Download,
  Upload,
  Plus,
  FolderOpen,
} from 'lucide-react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';
import * as apiLib from '@/lib/api';
import { pageVariants } from '@/components/motion/variants';
import { FadeIn } from '@/components/motion/FadeIn';
import type { VaultProject, Environment, EnvVariable } from '@/types/vault';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/vault';

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyDetailState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <FadeIn className="text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-vault-surface/40 border border-vault-border/25 flex items-center justify-center mx-auto mb-5">
          <Shield size={28} className="text-vault-muted/25" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] font-medium text-vault-muted/50 mb-1">
          Select a project
        </p>
        <p className="text-[12px] text-vault-muted/30">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-vault-raised/80 border border-vault-border/40 text-vault-muted/40 text-[10px] font-mono">
            {'\u2318'}K
          </kbd>{' '}
          to search your vault
        </p>
      </FadeIn>
    </div>
  );
}

// ─── Variable row ─────────────────────────────────────────────────────────────

interface VariableRowProps {
  variable: EnvVariable;
  projectId: string;
  envId: string;
}

function VariableRow({ variable }: VariableRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = useMemo(() => {
    if (variable.isSecret && !revealed) {
      return '\u2022'.repeat(Math.min(variable.value.length, 20));
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
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'group flex items-center gap-3 px-4 py-2.5',
        'hover:bg-vault-raised/25 transition-colors duration-100',
        'border-b border-vault-border/12 last:border-b-0',
      )}
    >
      {/* Key */}
      <div className="shrink-0" style={{ width: 180 }}>
        <span className="text-[11px] font-mono text-vault-accent/80 truncate block">
          {variable.key}
        </span>
        {variable.description && (
          <span className="text-[10px] text-vault-muted/35 truncate block mt-0.5">
            {variable.description}
          </span>
        )}
      </div>

      {/* Separator */}
      <span className="text-vault-border/60 text-[11px] shrink-0">=</span>

      {/* Value */}
      <div className="flex-1 min-w-0">
        <span
          className={clsx(
            'text-[11px] font-mono truncate block',
            variable.isSecret && !revealed
              ? 'text-vault-muted/35 tracking-widest'
              : 'text-vault-text/65',
          )}
        >
          {displayValue}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0">
        {variable.isSecret && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="p-1.5 rounded-md text-vault-muted/40 hover:text-vault-text hover:bg-vault-raised/60 transition-colors"
            title={revealed ? 'Hide value' : 'Reveal value'}
          >
            {revealed ? (
              <EyeOff size={12} strokeWidth={1.75} />
            ) : (
              <Eye size={12} strokeWidth={1.75} />
            )}
          </button>
        )}
        <button
          onClick={handleCopy}
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            copied
              ? 'text-vault-success'
              : 'text-vault-muted/40 hover:text-vault-text hover:bg-vault-raised/60',
          )}
          title="Copy value"
        >
          <Copy size={12} strokeWidth={1.75} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Environment tabs + variable list ────────────────────────────────────────

interface EnvTabsProps {
  environments: Environment[];
  projectId: string;
}

function EnvTabs({ environments, projectId }: EnvTabsProps) {
  const [activeEnvId, setActiveEnvId] = useState<string>(environments[0]?.id ?? '');

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

  if (environments.length === 0) {
    return (
      <FadeIn className="flex-1 flex items-center justify-center py-12">
        <p className="text-[12px] text-vault-muted/40">No environments configured</p>
      </FadeIn>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-6 pt-4 pb-0 border-b border-vault-border/20 shrink-0">
        {environments.map((env) => {
          const isActive = env.id === activeEnvId;
          return (
            <button
              key={env.id}
              onClick={() => setActiveEnvId(env.id)}
              className={clsx(
                'relative px-3 pb-3 pt-1 text-[12px] font-medium transition-colors duration-150',
                isActive ? 'text-vault-accent' : 'text-vault-muted/50 hover:text-vault-muted',
              )}
            >
              {env.name}
              <span
                className={clsx(
                  'ml-1.5 text-[10px] tabular-nums',
                  isActive ? 'text-vault-accent/60' : 'text-vault-muted/30',
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

      {/* Variables for active environment */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEnvId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="min-h-full"
          >
            {activeEnv && activeEnv.variables.length > 0 ? (
              <>
                {activeEnv.variables.map((variable) => (
                  <VariableRow
                    key={variable.id}
                    variable={variable}
                    projectId={projectId}
                    envId={activeEnv.id}
                  />
                ))}
                {/* Add Variable button */}
                <div className="px-4 py-3">
                  <button
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 py-2 rounded-lg',
                      'border border-dashed border-vault-border/35',
                      'text-[11px] text-vault-muted/40 hover:text-vault-muted/60',
                      'hover:border-vault-border/50 hover:bg-vault-raised/20',
                      'transition-all duration-150',
                    )}
                  >
                    <Plus size={12} strokeWidth={1.75} />
                    Add Variable
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <p className="text-[12px] text-vault-muted/35 mb-4">No variables yet</p>
                <button
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'border border-dashed border-vault-border/35',
                    'text-[12px] text-vault-muted/40 hover:text-vault-muted/60',
                    'hover:border-vault-border/50 hover:bg-vault-raised/20',
                    'transition-all duration-150',
                  )}
                >
                  <Plus size={13} strokeWidth={1.75} />
                  Add first variable
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Notes section */}
        {activeEnv && (
          <div className="px-4 pt-2 pb-5 border-t border-vault-border/15">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-vault-muted/35 mb-2 mt-3">
              Notes
            </p>
            {activeEnv.notes ? (
              <textarea
                defaultValue={activeEnv.notes}
                rows={3}
                className={clsx(
                  'w-full px-3 py-2 text-[12px] rounded-lg resize-none',
                  'bg-vault-surface/30 text-vault-text/70 placeholder-vault-muted/30',
                  'border border-vault-border/25',
                  'focus:border-vault-border/50 focus:outline-none',
                  'transition-colors duration-150',
                )}
              />
            ) : (
              <button
                className={clsx(
                  'w-full text-left px-3 py-2 text-[12px] rounded-lg',
                  'bg-vault-surface/20 text-vault-muted/30 italic',
                  'border border-vault-border/20 border-dashed',
                  'hover:bg-vault-raised/20 hover:text-vault-muted/50',
                  'transition-all duration-150',
                )}
              >
                Add notes...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project detail ───────────────────────────────────────────────────────────

function ProjectDetail({ project }: { project: VaultProject }) {
  const { toggleFavorite } = useVaultStore();
  const categoryColor = CATEGORY_COLORS[project.category];

  const totalVars = useMemo(
    () => project.environments.reduce((sum, env) => sum + env.variables.length, 0),
    [project.environments],
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-vault-border/20 shrink-0">
        <div className="flex items-start gap-4">
          {/* Project icon */}
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/5"
            style={{ backgroundColor: `${categoryColor}12` }}
          >
            {project.icon.length <= 2 ? (
              <span>{project.icon}</span>
            ) : (
              <FolderOpen size={22} style={{ color: categoryColor }} strokeWidth={1.5} />
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[18px] font-bold text-vault-text truncate leading-tight">
                {project.name}
              </h1>
              <button
                onClick={() => toggleFavorite(project.id)}
                className={clsx(
                  'p-1 rounded transition-colors shrink-0',
                  project.isFavorite
                    ? 'text-yellow-500'
                    : 'text-vault-muted/25 hover:text-vault-muted/60',
                )}
                title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={15}
                  strokeWidth={1.75}
                  fill={project.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {project.description && (
              <p className="text-[13px] text-vault-muted/70 leading-snug mb-2">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category badge */}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}22`,
                }}
              >
                {CATEGORY_LABELS[project.category]}
              </span>

              {/* Tags */}
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] text-vault-muted/55 px-1.5 py-0.5 rounded-md bg-vault-bg/60 border border-vault-border/20"
                >
                  <Tag size={9} strokeWidth={1.75} />
                  {tag}
                </span>
              ))}

              {/* Modified date — pushed right */}
              <span className="text-[10px] text-vault-muted/35 flex items-center gap-1 ml-auto">
                <Clock size={9} strokeWidth={1.75} />
                {new Date(project.modifiedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1.5 mt-4">
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]',
              'bg-vault-raised/40 text-vault-muted/60 hover:text-vault-text',
              'border border-vault-border/25 hover:border-vault-border/45',
              'transition-all duration-150',
            )}
          >
            <Edit3 size={11} strokeWidth={1.75} />
            Edit
          </button>
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]',
              'bg-vault-raised/40 text-vault-muted/60 hover:text-vault-text',
              'border border-vault-border/25 hover:border-vault-border/45',
              'transition-all duration-150',
            )}
          >
            <Download size={11} strokeWidth={1.75} />
            Export
          </button>
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]',
              'bg-vault-raised/40 text-vault-muted/60 hover:text-vault-text',
              'border border-vault-border/25 hover:border-vault-border/45',
              'transition-all duration-150',
            )}
          >
            <Upload size={11} strokeWidth={1.75} />
            Import
          </button>

          <div className="flex-1" />

          <span className="text-[10px] text-vault-muted/30 tabular-nums">
            {totalVars} var{totalVars !== 1 ? 's' : ''} &middot; {project.environments.length} env{project.environments.length !== 1 ? 's' : ''}
          </span>

          <button
            className={clsx(
              'p-1.5 rounded-lg text-vault-muted/25 hover:text-vault-danger hover:bg-vault-danger/8',
              'transition-colors duration-150',
            )}
            title="Delete project"
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Environment tabs + variables */}
      <EnvTabs environments={project.environments} projectId={project.id} />
    </motion.div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function DetailPane() {
  const selectedProject = useVaultStore((s) => s.selectedProject);
  const project = selectedProject();

  return (
    <div className="flex-1 min-w-0 h-full bg-vault-bg flex flex-col">
      <AnimatePresence mode="wait">
        {project ? (
          <ProjectDetail key={project.id} project={project} />
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
