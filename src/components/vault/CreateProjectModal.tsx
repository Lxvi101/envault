import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Globe,
  Code,
  Smartphone,
  Server,
  Database,
  Cloud,
  Building,
  MoreHorizontal,
  Plus,
  X,
  Save,
} from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { useVaultStore } from '@/stores/useVaultStore';
import { useToastStore } from '@/stores/useToastStore';
import type { VaultProject, ProjectCategory } from '@/types/vault';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/vault';

const CATEGORY_ICONS: Record<ProjectCategory, React.ElementType> = {
  'web-app': Globe,
  api: Code,
  mobile: Smartphone,
  infrastructure: Server,
  database: Database,
  saas: Cloud,
  internal: Building,
  other: MoreHorizontal,
};

const CATEGORIES: ProjectCategory[] = [
  'web-app', 'api', 'mobile', 'infrastructure', 'database', 'saas', 'internal', 'other',
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProject?: VaultProject | null;
}

export function CreateProjectModal({ isOpen, onClose, existingProject }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('other');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const { createProject, updateProject } = useVaultStore();
  const addToast = useToastStore((s) => s.addToast);

  const isEditMode = !!existingProject;

  useEffect(() => {
    if (isOpen) {
      if (existingProject) {
        setName(existingProject.name);
        setDescription(existingProject.description);
        setIcon(existingProject.icon);
        setCategory(existingProject.category);
        setTags([...existingProject.tags]);
      } else {
        setName('');
        setDescription('');
        setIcon('');
        setCategory('other');
        setTags([]);
      }
      setTagInput('');
      setError('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, existingProject]);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  }, [tags]);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || 'folder',
        category,
        tags,
      };

      if (isEditMode && existingProject) {
        await updateProject(existingProject.id, data);
        addToast('success', 'Project updated');
      } else {
        await createProject(data);
        addToast('success', 'Project created');
      }
      onClose();
    } catch {
      setError(isEditMode ? 'Failed to update project' : 'Failed to create project');
      addToast('error', isEditMode ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, icon, category, tags, isEditMode, existingProject, createProject, updateProject, addToast, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'New Project'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">
            Name <span className="text-vault-danger">*</span>
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="My Project"
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-[14px] text-vault-text placeholder:text-vault-muted/50 outline-none transition-all',
              error
                ? 'border-vault-danger focus:shadow-[0_0_0_3px_rgba(255,59,48,0.1)]'
                : 'border-vault-border focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]',
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          {error && <p className="text-[12px] text-vault-danger">{error}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this project..."
            className="w-full px-3 py-2.5 rounded-lg border border-vault-border text-[14px] text-vault-text placeholder:text-vault-muted/50 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
          />
        </div>

        {/* Icon */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">
            Icon <span className="text-vault-muted/50">(emoji or service name)</span>
          </label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. 🚀 or aws, vercel, supabase"
            className="w-full px-3 py-2.5 rounded-lg border border-vault-border text-[14px] text-vault-text placeholder:text-vault-muted/50 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">Category</label>
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const color = CATEGORY_COLORS[cat];
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[11px] font-medium transition-all',
                    isActive
                      ? 'border-vault-accent bg-vault-accent/5 text-vault-accent'
                      : 'border-vault-border text-vault-muted hover:border-vault-accent/30 hover:bg-vault-surface',
                  )}
                >
                  <Icon size={16} strokeWidth={1.75} style={{ color: isActive ? undefined : color }} />
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">Tags</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-vault-surface border border-vault-border text-[12px] text-vault-text"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 rounded-full hover:bg-vault-raised transition-colors"
                >
                  <X size={10} strokeWidth={2} />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleAddTag}
              placeholder="Add tag..."
              className="flex-1 min-w-[80px] px-2 py-1 text-[12px] text-vault-text placeholder:text-vault-muted/50 outline-none bg-transparent"
            />
          </div>
        </div>

        <p className="text-[11px] text-vault-muted text-right">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-vault-surface text-vault-muted text-[10px] font-mono border border-vault-border">
            Cmd+Enter
          </kbd>{' '}
          to save
        </p>
      </div>
    </Modal>
  );
}
