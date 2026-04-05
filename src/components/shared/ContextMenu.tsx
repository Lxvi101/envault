import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export interface ContextMenuItem {
  type: "item" | "divider";
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
  className?: string;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const menuW = 200;
      const menuH = items.length * 36;

      setPosition({
        x: Math.min(e.clientX, viewportW - menuW - 8),
        y: Math.min(e.clientY, viewportH - menuH - 8),
      });
      setIsOpen(true);
      setFocusedIndex(-1);
    },
    [items.length]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev + 1;
          while (next < items.length && (items[next].type === "divider" || items[next].disabled)) {
            next++;
          }
          return next >= items.length ? prev : next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && (items[next].type === "divider" || items[next].disabled)) {
            next--;
          }
          return next < 0 ? prev : next;
        });
      }

      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item.type === "item" && item.onClick && !item.disabled) {
          item.onClick();
          close();
        }
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, focusedIndex, items, close]);

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.92, transformOrigin: "top left" }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed z-[100] min-w-[180px] py-1.5 rounded-xl bg-vault-surface border border-vault-border shadow-2xl shadow-black/40"
            style={{ left: position.x, top: position.y }}
          >
            {items.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 mx-2 border-t border-vault-border/60"
                  />
                );
              }

              return (
                <button
                  key={`${item.label}-${index}`}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      close();
                    }
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    focusedIndex === index && "bg-vault-raised",
                    item.danger
                      ? "text-vault-danger hover:bg-vault-danger/10"
                      : "text-vault-text hover:bg-vault-raised",
                    item.disabled && "opacity-40 cursor-not-allowed"
                  )}
                  onMouseEnter={() => setFocusedIndex(index)}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
