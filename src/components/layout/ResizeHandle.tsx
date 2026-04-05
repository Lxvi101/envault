import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        startXRef.current = moveEvent.clientX;
        onResize(delta);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [onResize],
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      className={clsx(
        'relative w-[1px] cursor-col-resize select-none shrink-0 group',
        className,
      )}
    >
      {/* Visual line */}
      <div
        className={clsx(
          'absolute inset-y-0 left-0 w-[1px] transition-colors duration-150',
          isDragging ? 'bg-vault-accent' : 'bg-vault-border group-hover:bg-vault-muted/40',
        )}
      />

      {/* Hit area */}
      <div className="absolute inset-y-0 -left-[3px] w-[8px]" />

      {/* Hover indicator */}
      <div
        className={clsx(
          'absolute inset-y-0 -left-[1px] w-[3px] rounded-full transition-opacity duration-150',
          isDragging
            ? 'opacity-100 bg-vault-accent/30'
            : 'opacity-0 group-hover:opacity-100 bg-vault-accent/20',
        )}
      />
    </div>
  );
}
