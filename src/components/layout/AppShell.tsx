import { useCallback, useEffect } from 'react';
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

export function AppShell() {
  const { sidebarWidth, listWidth, setSidebarWidth, setListWidth } = useUIStore();
  const refreshProjects = useVaultStore((s) => s.refreshProjects);

  useEffect(() => {
    // Only fetch if not already loaded (e.g. after page reload)
    if (useVaultStore.getState().projects.length === 0) {
      refreshProjects();
    }

    // Listen for vault changes from the main process
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col bg-vault-bg overflow-hidden"
    >
      <TitleBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ResizeHandle onResize={handleSidebarResize} />
        <ItemList />
        <ResizeHandle onResize={handleListResize} />
        <DetailPane />
      </div>

      <StatusBar />
    </motion.div>
  );
}
