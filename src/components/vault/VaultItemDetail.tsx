import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Upload,
  FileText,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import type { VaultProject, EnvVariable } from "@/types/vault";
import { useVaultStore } from "@/stores/useVaultStore";
import { useToastStore } from "@/stores/useToastStore";
import { ProjectCard } from "./ProjectCard";
import { EnvVariableRow } from "./EnvVariableRow";
import { EnvEditor } from "./EnvEditor";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/shared/Button";

interface VaultItemDetailProps {
  project: VaultProject;
  onEdit: () => void;
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export function VaultItemDetail({ project, onEdit }: VaultItemDetailProps) {
  const [selectedEnvId, setSelectedEnvId] = useState<string>(
    project.environments[0]?.id ?? ""
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(
    null
  );
  const [isNotesEditing, setIsNotesEditing] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const { updateProject, deleteProject, toggleFavorite } = useVaultStore();
  const { addToast } = useToastStore();

  const selectedEnv = useMemo(
    () => project.environments.find((e) => e.id === selectedEnvId),
    [project.environments, selectedEnvId]
  );

  // When project changes, reset env selection
  useMemo(() => {
    if (!project.environments.find((e) => e.id === selectedEnvId)) {
      setSelectedEnvId(project.environments[0]?.id ?? "");
    }
  }, [project.id]);

  const existingKeys = useMemo(
    () => (selectedEnv?.variables ?? []).map((v) => v.key),
    [selectedEnv]
  );

  const handleAddVariable = useCallback(
    async (data: Partial<EnvVariable>) => {
      try {
        await window.api.addVariable(project.id, selectedEnvId, data);
        await useVaultStore.getState().refreshProjects();
        addToast("success", `Added ${data.key}`);
      } catch {
        addToast("error", "Failed to add variable");
      }
    },
    [project.id, selectedEnvId, addToast]
  );

  const handleUpdateVariable = useCallback(
    async (varId: string, data: Partial<EnvVariable>) => {
      try {
        await window.api.updateVariable(project.id, selectedEnvId, varId, data);
        await useVaultStore.getState().refreshProjects();
        addToast("success", "Variable updated");
      } catch {
        addToast("error", "Failed to update variable");
      }
    },
    [project.id, selectedEnvId, addToast]
  );

  const handleDeleteVariable = useCallback(
    async (varId: string) => {
      try {
        await window.api.deleteVariable(project.id, selectedEnvId, varId);
        await useVaultStore.getState().refreshProjects();
        addToast("info", "Variable deleted");
      } catch {
        addToast("error", "Failed to delete variable");
      }
    },
    [project.id, selectedEnvId, addToast]
  );

  const handleExport = useCallback(async () => {
    try {
      const result = await window.api.exportEnv(project.id, selectedEnvId);
      if (result.success) {
        addToast("success", `Exported to ${result.path}`);
      }
    } catch {
      addToast("error", "Failed to export .env file");
    }
  }, [project.id, selectedEnvId, addToast]);

  const handleImport = useCallback(async () => {
    try {
      const result = await window.api.importEnv(project.id, selectedEnvId);
      if (result.success) {
        await useVaultStore.getState().refreshProjects();
        addToast("success", `Imported ${result.count} variables`);
      }
    } catch {
      addToast("error", "Failed to import .env file");
    }
  }, [project.id, selectedEnvId, addToast]);

  const handleDeleteProject = useCallback(
    async (id: string) => {
      await deleteProject(id);
      addToast("info", "Project deleted");
    },
    [deleteProject, addToast]
  );

  const handleNotesBlur = useCallback(async () => {
    if (selectedEnv && notesValue !== selectedEnv.notes) {
      const updatedEnvs = project.environments.map((env) =>
        env.id === selectedEnvId ? { ...env, notes: notesValue } : env
      );
      await updateProject(project.id, { environments: updatedEnvs });
    }
    setIsNotesEditing(false);
  }, [
    selectedEnv,
    notesValue,
    selectedEnvId,
    project.id,
    project.environments,
    updateProject,
  ]);

  const envIconMap: Record<string, typeof Lock> = {
    production: Lock,
    staging: Upload,
    development: FileText,
  };

  return (
    <motion.div
      key={project.id}
      {...pageTransition}
      className="flex flex-col h-full"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-vault-border/40">
        {/* Project header card */}
        <ProjectCard
          project={project}
          onEdit={onEdit}
          onDelete={handleDeleteProject}
          onToggleFavorite={toggleFavorite}
        />

        {/* Environment tabs + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-vault-bg border border-vault-border/50">
            {project.environments.map((env) => {
              const isActive = env.id === selectedEnvId;
              const envName = env.name.toLowerCase();
              const EnvIcon = envIconMap[envName];

              return (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={clsx(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-vault-text"
                      : "text-vault-muted hover:text-vault-text/80"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`env-tab-${project.id}`}
                      className="absolute inset-0 bg-vault-raised rounded-lg border border-vault-border/60"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {EnvIcon && <EnvIcon className="w-3.5 h-3.5" />}
                    {env.name}
                    <span className="text-xs text-vault-muted/60">
                      ({env.variables.length})
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={handleImport}
            >
              Import
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-vault-border/40" />

        {/* Variables list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-vault-muted">
              Environment Variables
            </h3>
            <span className="text-xs text-vault-muted/60">
              {selectedEnv?.variables.length ?? 0} variables
            </span>
          </div>

          <AnimatePresence mode="wait">
            {selectedEnv && selectedEnv.variables.length > 0 ? (
              <motion.div
                key={selectedEnvId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                {selectedEnv.variables.map((variable, i) => (
                  <EnvVariableRow
                    key={variable.id}
                    variable={variable}
                    onUpdate={handleUpdateVariable}
                    onDelete={handleDeleteVariable}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptyState
                icon={<FileText className="w-10 h-10" />}
                title="No variables yet"
                description="Add your first environment variable to get started."
                action={{
                  label: "Add Variable",
                  onClick: () => {
                    setEditingVariable(null);
                    setIsEditorOpen(true);
                  },
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Add variable button */}
        {selectedEnv && selectedEnv.variables.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingVariable(null);
              setIsEditorOpen(true);
            }}
            className="w-full border-dashed"
          >
            Add Variable
          </Button>
        )}

        {/* Notes section */}
        <div className="border-t border-vault-border/40 pt-5">
          <h3 className="text-sm font-medium text-vault-muted mb-3">Notes</h3>
          {isNotesEditing ? (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesBlur}
              autoFocus
              placeholder="Add notes about this environment..."
              className="w-full h-28 px-3 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-sm text-vault-text placeholder:text-vault-muted/40 outline-none focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all resize-none"
            />
          ) : (
            <button
              onClick={() => {
                setNotesValue(selectedEnv?.notes ?? "");
                setIsNotesEditing(true);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-vault-bg/50 border border-vault-border/40 hover:border-vault-border/60 transition-colors"
            >
              <p className="text-sm text-vault-muted/60 whitespace-pre-wrap">
                {selectedEnv?.notes || "Click to add notes..."}
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Editor modal */}
      <EnvEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingVariable(null);
        }}
        onSave={
          editingVariable
            ? (data) => handleUpdateVariable(editingVariable.id, data)
            : handleAddVariable
        }
        existingVariable={editingVariable}
        existingKeys={existingKeys}
      />
    </motion.div>
  );
}
