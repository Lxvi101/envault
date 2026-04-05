import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<CSSProperties>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const actualPos = position === "top" && spaceAbove < 60 ? "bottom" : position;

        if (actualPos === "top") {
          setCoords({
            left: rect.left + rect.width / 2,
            top: rect.top - 8,
          });
        } else {
          setCoords({
            left: rect.left + rect.width / 2,
            top: rect.bottom + 8,
          });
        }
      }
      setIsVisible(true);
    }, delay);
  }, [delay, position]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  const yOffset = position === "top" ? 4 : -4;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={clsx("inline-flex", className)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: yOffset, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: yOffset, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[200] pointer-events-none"
            style={{
              ...coords,
              transform: `translateX(-50%) ${
                position === "top" ? "translateY(-100%)" : ""
              }`,
            }}
          >
            <div className="relative px-2.5 py-1.5 rounded-lg bg-vault-raised/95 backdrop-blur-sm border border-vault-border/60 shadow-lg shadow-black/30">
              <p className="text-xs text-vault-text whitespace-nowrap">
                {content}
              </p>
              <div
                className={clsx(
                  "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45",
                  "bg-vault-raised/95 border border-vault-border/60",
                  position === "top"
                    ? "bottom-[-5px] border-t-0 border-l-0"
                    : "top-[-5px] border-b-0 border-r-0"
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
