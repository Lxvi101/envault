import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Copy,
  Eye,
  EyeOff,
  Star,
  Clock,
  Tag,
  ChevronDown,
  FileText,
  Trash2,
  Edit3,
  Download,
  Upload,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { useVaultStore } from '@/stores/useVaultStore';
import * as apiLib from '@/lib/api';
import { pageVariants } from '@/components/motion/variants';
import { FadeIn } from '@/components/motion/FadeIn';
import type { VaultProject, Environment, EnvVariable } from '@/types/vault';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/vault';

function EmptyDetailState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <FadeIn className="text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-vault-surface/60 border border-vault-border/30 flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-vault-muted/30" />
        </div>
        <p className="text-vault-muted/60 text-sm">
          Select a project to view its environment variables
        </p>
        <p className="text-vault-muted/30 text-xs mt-1">
          Or press <kbd className="px-1.5 py-0.5 rounded bg-vault-raised border border-vault-border/40 text-vault-muted/50 text-[10px]">{'\u2318'}K</kbd> to search
        </p>
      </FadeIn>
    </div>
  );
}

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
      return '\u2022'.repeat(Math.min(variable.value.length, 24));
    }
    return variable.value;
  }, [variable.isSecret, variable.value, revealed]);

  const handleCopy = useCallback(async () => {
    try {
      await apiLib.copySecret(variable.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback to browser clipboard API
      try {
        await navigator.clipboard.writeText(variable.value);
      } catch { /* silently ignore */ }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [variable.value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'group px-4 py-2.5 flex items-center gap-3',
        'hover:bg-vault-raised/30 transition-colors duration-100',
        'border-b border-vault-border/15 last:border-b-0',
      )}
    >
      {/* Key */}
      <div className="min-w-0 w-[200px] shrink-0">
        <span className="text-xs font-mono text-vault-accent/80 truncate block">
          {variable.key}
        </span>
        {variable.description && (
          <span className="text-[10px] text-vault-muted/40 truncate block mt-0.5">
            {variable.description}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex-1 min-w-0">
        <span
          className={clsx(
            'text-xs font-mono truncate block',
            variable.isSecret && !revealed ? 'text-vault-muted/40 tracking-wider' : 'text-vault-text/70',
          )}
        >
          {displayValue}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0">
        {variable.isSecret && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="p-1 rounded text-vault-muted/50 hover:text-vault-text transition-colors"
            title={revealed ? 'Hide' : 'Reveal'}
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        <button
          onClick={handleCopy}
          className={clsx(
            'p-1 rounded transition-colors',
            copied ? 'text-vault-success' : 'text-vault-muted/50 hover:text-vault-text',
          )}
          title="Copy value"
        >
          <Copy size={13} />
        </button>
      </div>
    </motion.div>
  );
}

interface EnvironmentSectionProps {
  env: Environment;
  projectId: string;
  defaultOpen?: boolean;
}

function EnvironmentSection({ env, projectId, defaultOpen = false }: EnvironmentSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-vault-border/25 rounded-lg overflow-hidden bg-vault-surface/20">
      {/* Environment header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center gap-2.5 px-4 py-2.5 text-left',
          'hover:bg-vault-raised/20 transition-colors duration-100',
        )}
      >
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={14} className="text-vault-muted/50" />
        </motion.div>
        <FileText size={14} className="text-vault-muted/60" />
        <span className="text-xs font-medium text-vault-text/80">{env.name}</span>
        <span className="text-[10px] text-vault-muted/40 ml-auto tabular-nums">
          {env.variables.length} var{env.variables.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Variables */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-vault-border/15"
          >
            {env.variables.length === 0 ? (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-vault-muted/40">No variables yet</p>
              </div>
            ) : (
              env.variables.map((variable) => (
                <VariableRow
                  key={variable.id}
                  variable={variable}
                  projectId={projectId}
                  envId={env.id}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      <div className="p-6 pb-4 border-b border-vault-border/20 shrink-0">
        <div className="flex items-start gap-4">
          {/* Project icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 border border-vault-border/30"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            {project.icon.length <= 2 ? (
              <span>{project.icon}</span>
            ) : (
              <Shield size={20} style={{ color: categoryColor }} />
            )}
          </div>

          {/* Title area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-vault-text truncate">
                {project.name}
              </h1>
              <button
                onClick={() => toggleFavorite(project.id)}
                className={clsx(
                  'p-1 rounded transition-colors shrink-0',
                  project.isFavorite ? 'text-yellow-500' : 'text-vault-muted/30 hover:text-vault-muted',
                )}
              >
                <Star size={16} fill={project.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {project.description && (
              <p className="text-sm text-vault-muted mt-0.5">{project.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Category badge */}
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}25`,
                }}
              >
                {CATEGORY_LABELS[project.category]}
              </span>

              {/* Tags */}
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] text-vault-muted/60 px-1.5 py-0.5 rounded bg-vault-bg/60 border border-vault-border/20"
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}

              {/* Stats */}
              <span className="text-[10px] text-vault-muted/40 flex items-center gap-1 ml-auto">
                <Clock size={10} />
                {new Date(project.modifiedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-4">
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
              'bg-vault-raised/50 text-vault-muted hover:text-vault-text',
              'border border-vault-border/30 hover:border-vault-border/50',
              'transition-all duration-150',
            )}
          >
            <Edit3 size={12} />
            Edit
          </button>
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
              'bg-vault-raised/50 text-vault-muted hover:text-vault-text',
              'border border-vault-border/30 hover:border-vault-border/50',
              'transition-all duration-150',
            )}
          >
            <Download size={12} />
            Export
          </button>
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
              'bg-vault-raised/50 text-vault-muted hover:text-vault-text',
              'border border-vault-border/30 hover:border-vault-border/50',
              'transition-all duration-150',
            )}
          >
            <Upload size={12} />
            Import
          </button>

          <div className="flex-1" />

          <span className="text-[10px] text-vault-muted/40 tabular-nums">
            {totalVars} variable{totalVars !== 1 ? 's' : ''} across {project.environments.length} environment{project.environments.length !== 1 ? 's' : ''}
          </span>

          <button
            className={clsx(
              'p-1.5 rounded-lg text-vault-muted/30 hover:text-vault-danger',
              'transition-colors duration-150',
            )}
            title="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Environments */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-3 scrollbar-none">
        {project.environments.length === 0 ? (
          <FadeIn className="text-center py-12">
            <p className="text-sm text-vault-muted/50">No environments configured</p>
          </FadeIn>
        ) : (
          project.environments.map((env, i) => (
            <EnvironmentSection
              key={env.id}
              env={env}
              projectId={project.id}
              defaultOpen={i === 0}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

export function DetailPane() {
  const selectedProject = useVaultStore((s) => s.selectedProject);

  const project = selectedProject();

  return (
    <div className="flex-1 min-w-0 h-full bg-vault-bg">
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
            className="h-full"
          >
            <EmptyDetailState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
