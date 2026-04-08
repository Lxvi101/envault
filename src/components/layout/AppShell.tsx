import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';
import { useVaultStore } from '@/stores/useVaultStore';
import * as api from '@/lib/api';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { ItemList } from './ItemList';
import { DetailPane } from './DetailPane';
import { ResizeHandle } from './ResizeHandle';
import { StatusBar } from './StatusBar';
import { CreateProjectModal } from '@/components/vault/CreateProjectModal';
import type { VaultProject } from '@/types/vault';

export function AppShell() {
  const { sidebarWidth, listWidth, setSidebarWidth, setListWidth } = useUIStore();
  const refreshProjects = useVaultStore((s) => s.refreshProjects);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<VaultProject | null>(null);

  useEffect(() => {
    // Only fetch if not already loaded
    if (useVaultStore.getState().projects.length === 0) {
      refreshProjects();
    }

    const unsubscribe = api.onVaultChanged(() => refreshProjects());
    return unsubscribe;
  }, [refreshProjects]);

  const handleSidebarResize = useCallback(
    (delta: number) => {
      setSidebarWidth(sidebarWidth + delta);
    },
    [sidebarWidth, setSidebarWidth],
  );

  const handleListResize = useCallback(
    (delta: number) => {
      setListWidth(listWidth + delta);
    },
    [listWidth, setListWidth],
  );

  const handleNewProject = useCallback(() => {
    setEditingProject(null);
    setCreateModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: VaultProject) => {
    setEditingProject(project);
    setCreateModalOpen(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col bg-white overflow-hidden"
    >
      <TitleBar onNewItem={handleNewProject} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ResizeHandle onResize={handleSidebarResize} />
        <ItemList onNewProject={handleNewProject} />
        <ResizeHandle onResize={handleListResize} />
        <DetailPane onEditProject={handleEditProject} />
      </div>

      <StatusBar />

      {/* Create / Edit Project Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingProject(null);
        }}
        existingProject={editingProject}
      />
    </motion.div>
  );
}
