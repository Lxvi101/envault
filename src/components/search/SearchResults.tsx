import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Key, Tag } from "lucide-react";
import clsx from "clsx";
import type { VaultProject } from "@/types/vault";
import { ServiceIcon } from "@/components/vault/ServiceIcon";
import { SearchHighlight } from "./SearchHighlight";

interface SearchResult {
  project: VaultProject;
  matchField: "name" | "description" | "tag" | "variable";
  matchText: string;
  envName?: string;
}

interface SearchResultsProps {
  projects: VaultProject[];
  query: string;
  onSelect: (projectId: string) => void;
}

function searchProjects(
  projects: VaultProject[],
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const project of projects) {
    if (project.name.toLowerCase().includes(q)) {
      results.push({
        project,
        matchField: "name",
        matchText: project.name,
      });
    }

    if (project.description.toLowerCase().includes(q)) {
      results.push({
        project,
        matchField: "description",
        matchText: project.description,
      });
    }

    for (const tag of project.tags) {
      if (tag.toLowerCase().includes(q)) {
        results.push({
          project,
          matchField: "tag",
          matchText: tag,
        });
        break;
      }
    }

    for (const env of project.environments) {
      for (const variable of env.variables) {
        if (variable.key.toLowerCase().includes(q)) {
          results.push({
            project,
            matchField: "variable",
            matchText: variable.key,
            envName: env.name,
          });
          break;
        }
      }
    }
  }

  // Deduplicate by project+field
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.project.id}:${r.matchField}:${r.matchText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const fieldIcons = {
  name: null,
  description: null,
  tag: Tag,
  variable: Key,
};

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

export function SearchResults({
  projects,
  query,
  onSelect,
}: SearchResultsProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => searchProjects(projects, query),
    [projects, query]
  );

  // Reset focus when results change
  useEffect(() => {
    setFocusedIndex(0);
  }, [results.length, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const result = results[focusedIndex];
        if (result) onSelect(result.project.id);
      }
    },
    [results, focusedIndex, onSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll focused item into view
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current.children[focusedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  if (!query.trim()) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-vault-muted/60">
          Search projects, variables, and tags...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-vault-muted">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs text-vault-muted/50 mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  // Group results by project
  const grouped = results.reduce<
    Record<string, { project: VaultProject; matches: SearchResult[] }>
  >((acc, result) => {
    const id = result.project.id;
    if (!acc[id]) {
      acc[id] = { project: result.project, matches: [] };
    }
    acc[id].matches.push(result);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <div ref={containerRef} className="max-h-[360px] overflow-y-auto py-2">
      <motion.div variants={listVariants} initial="hidden" animate="visible">
        {Object.values(grouped).map(({ project, matches }) => (
          <div key={project.id}>
            {matches.map((result) => {
              const idx = globalIndex++;
              const isFocused = idx === focusedIndex;
              const FieldIcon = fieldIcons[result.matchField];

              return (
                <motion.button
                  key={`${result.project.id}-${result.matchField}-${result.matchText}`}
                  variants={itemVariants}
                  onClick={() => onSelect(project.id)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    isFocused
                      ? "bg-vault-accent/10"
                      : "hover:bg-vault-raised/50"
                  )}
                >
                  <ServiceIcon name={project.icon} size={28} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-vault-text truncate">
                        <SearchHighlight
                          text={project.name}
                          query={
                            result.matchField === "name" ? query : ""
                          }
                        />
                      </span>
                      {result.matchField !== "name" && (
                        <span className="flex items-center gap-1 text-xs text-vault-muted/60 flex-shrink-0">
                          {FieldIcon && <FieldIcon className="w-3 h-3" />}
                          <SearchHighlight
                            text={result.matchText}
                            query={query}
                          />
                          {result.envName && (
                            <span className="text-vault-muted/40">
                              in {result.envName}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {result.matchField === "description" && (
                      <p className="text-xs text-vault-muted truncate mt-0.5">
                        <SearchHighlight
                          text={project.description}
                          query={query}
                        />
                      </p>
                    )}
                  </div>

                  {isFocused && (
                    <ArrowRight className="w-4 h-4 text-vault-accent flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </motion.div>

      <div className="px-4 pt-2 pb-1 border-t border-vault-border/40">
        <p className="text-[11px] text-vault-muted/50">
          {results.length} result{results.length !== 1 ? "s" : ""} &mdash;{" "}
          <kbd className="px-1 py-0.5 rounded bg-vault-raised text-[10px] font-mono">
            &uarr;&darr;
          </kbd>{" "}
          navigate{" "}
          <kbd className="px-1 py-0.5 rounded bg-vault-raised text-[10px] font-mono">
            Enter
          </kbd>{" "}
          select{" "}
          <kbd className="px-1 py-0.5 rounded bg-vault-raised text-[10px] font-mono">
            Esc
          </kbd>{" "}
          close
        </p>
      </div>
    </div>
  );
}
