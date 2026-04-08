import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useSearchStore } from "@/stores/useSearchStore";
import { useVaultStore } from "@/stores/useVaultStore";
import { SearchResults } from "./SearchResults";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -20,
    transition: { duration: 0.15 },
  },
};

export function SearchOverlay() {
  const { isOpen, query, setQuery, close } = useSearchStore();
  const { projects, selectProject: setSelectedProjectId } = useVaultStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      close();
    },
    [setSelectedProjectId, close]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[15vh]"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[640px] mx-4 rounded-xl overflow-hidden bg-white border border-vault-border shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-vault-border">
              <Search className="w-5 h-5 text-vault-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, variables, tags..."
                className="flex-1 bg-transparent text-base text-vault-text placeholder:text-vault-muted outline-none"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-vault-surface border border-vault-border text-[11px] text-vault-muted font-mono">
                <span className="text-[10px]">Esc</span>
              </kbd>
            </div>

            <SearchResults
              projects={projects}
              query={query}
              onSelect={handleSelect}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
