import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSearchStore } from '@/stores/useSearchStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { AutoLockProvider } from '@/components/auth/AutoLockProvider';
import { SetupWizard } from '@/components/auth/SetupWizard';
import { LockScreen } from '@/components/auth/LockScreen';
import { AppShell } from '@/components/layout/AppShell';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { ToastContainer } from '@/components/shared/ToastContainer';

function App() {
  const { isLocked, isFirstRun, isLoading, checkAuth } = useAuthStore();
  const { isOpen: searchOpen } = useSearchStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useKeyboard();

  // Show nothing while initial auth check is loading
  if (isLoading && !isFirstRun && isLocked) {
    return (
      <div className="h-screen w-screen bg-vault-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vault-accent/30 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AutoLockProvider>
      <AnimatePresence mode="wait">
        {isFirstRun ? (
          <SetupWizard key="setup" />
        ) : isLocked ? (
          <LockScreen key="lock" />
        ) : (
          <AppShell key="app" />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && <SearchOverlay key="search" />}
      </AnimatePresence>
      <ToastContainer />
    </AutoLockProvider>
  );
}

export default App;
