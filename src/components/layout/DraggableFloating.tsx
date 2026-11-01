import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface DraggableFloatingProps {
  storageKey: string;
  defaultPosition: Position;
  className?: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function DraggableFloating({
  storageKey,
  defaultPosition,
  className,
  children,
}: DraggableFloatingProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Position;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return parsed;
        }
      } catch {
        // Ignore malformed localStorage values.
      }
    }
    return defaultPosition;
  });

  const rootRef = useRef<HTMLDivElement>(null);

  // After mount, clamp position into the real viewport (fixes wrong init when viewport was tiny).
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setPosition((prev) => ({
      x: clamp(prev.x, 8, Math.max(8, window.innerWidth  - w - 8)),
      y: clamp(prev.y, 8, Math.max(8, window.innerHeight - h - 8)),
    }));
  }, []); // runs once after first paint

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position, storageKey]);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => {
        const width  = rootRef.current?.offsetWidth  ?? 0;
        const height = rootRef.current?.offsetHeight ?? 0;
        return {
          x: clamp(prev.x, 8, Math.max(8, window.innerWidth  - width  - 8)),
          y: clamp(prev.y, 8, Math.max(8, window.innerHeight - height - 8)),
        };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Shared move / end logic ──────────────────────────────────────────────
  const handleMove = (clientX: number, clientY: number) => {
    const d = dragStartRef.current;
    if (!d) return;

    const dx = clientX - d.clientX;
    const dy = clientY - d.clientY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      movedRef.current = true;
    }

    const width  = rootRef.current?.offsetWidth  ?? 0;
    const height = rootRef.current?.offsetHeight ?? 0;

    setPosition({
      x: clamp(d.startX + dx, 8, Math.max(8, window.innerWidth  - width  - 8)),
      y: clamp(d.startY + dy, 8, Math.max(8, window.innerHeight - height - 8)),
    });
  };

  const handleEnd = () => {
    if (movedRef.current) {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    dragStartRef.current = null;
    movedRef.current     = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup",   onMouseUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend",  onTouchEnd);
  };

  // ── Mouse ────────────────────────────────────────────────────────────────
  const onMouseMove = (e: MouseEvent)  => handleMove(e.clientX, e.clientY);
  const onMouseUp   = ()               => handleEnd();

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (!(e.target as HTMLElement).closest("[data-drag-handle='true']")) return;

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    e.preventDefault();
  };

  // ── Touch ────────────────────────────────────────────────────────────────
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) handleMove(t.clientX, t.clientY);
    e.preventDefault(); // prevent scroll while dragging
  };
  const onTouchEnd = () => handleEnd();

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest("[data-drag-handle='true']")) return;
    const t = e.touches[0];
    if (!t) return;

    dragStartRef.current = {
      clientX: t.clientX,
      clientY: t.clientY,
      startX: position.x,
      startY: position.y,
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
  };

  return (
    <div
      ref={rootRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClickCapture={(e) => {
        if (suppressClickRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      style={{ left: position.x, top: position.y }}
      className={cn("fixed z-[1200] select-none touch-none", className)}
    >
      {children}
    </div>
  );
}
