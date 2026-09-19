"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EASE_DRAWER } from "@/lib/ease";
import { PresenceGate } from "@/lib/presence-gate";
import { TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

const DRAWER = { duration: 0.35, ease: EASE_DRAWER } as const;

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heights (0-1 = fraction of viewport, or "auto"). First entry is default. */
  snapPoints?: (number | "auto")[];
  defaultSnap?: number;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Min drag distance (px) past current snap to dismiss. */
  dismissThreshold?: number;
}

export function BottomSheet({
  open,
  onOpenChange,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  title,
  description,
  children,
  className,
  dismissThreshold = 120,
}: BottomSheetProps) {
  const [snap, setSnap] = useState(defaultSnap);
  const [mounted, setMounted] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const heightRef = useRef(0);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1025);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) setSnap(defaultSnap);
  }, [open, defaultSnap]);

  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("modal-open-no-scroll");

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove("modal-open-no-scroll");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!isMobileScreen) return;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 600 || offset > dismissThreshold) {
      const smaller = snapPoints.map((_, i) => i).filter((i) => i < snap);
      if (smaller.length && velocity < 800 && offset < dismissThreshold * 1.6) {
        setSnap(smaller[smaller.length - 1]);
      } else {
        onOpenChange(false);
      }
      return;
    }

    if (velocity < -500) {
      setSnap((current) => Math.min(snapPoints.length - 1, current + 1));
      return;
    }

    setSnap((current) => {
      if (offset > 80 && current > 0) return current - 1;
      if (offset < -80 && current < snapPoints.length - 1) return current + 1;
      return current;
    });
  };

  const snapValue = snapPoints[snap];
  const heightStyle = isMobileScreen
    ? snapValue === "auto"
      ? { maxHeight: "92vh" }
      : { height: `${snapValue * 100}vh` }
    : {};

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label="Close modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={DRAWER}
              {...gate}
              onClick={() => onOpenChange(false)}
              className="pointer-events-auto fixed inset-0 z-50 bg-foreground/50 dark:bg-background/50 backdrop-blur-sm"
            />
          )}
        </PresenceGate>
      ) : null}
      {open ? (
        <PresenceGate key="sheet">
          {({ gate }) => (
            <div className={cn(
              "fixed inset-0 z-50 flex pointer-events-none",
              isMobileScreen ? "items-end justify-center" : "items-center justify-center p-4"
            )}>
              <motion.div
                ref={sheetRef}
                drag={isMobileScreen ? "y" : false}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.02, bottom: 0.4 }}
                dragMomentum={false}
                onDragEnd={onDragEnd}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : isMobileScreen
                    ? { y: "100%" }
                    : { opacity: 0, scale: 0.96, y: 8 }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : isMobileScreen
                    ? { y: 0 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : isMobileScreen
                    ? { y: "100%" }
                    : { opacity: 0, scale: 0.96, y: 8 }
                }
                transition={reduce ? { duration: 0.18, ease: EASE_DRAWER } : DRAWER}
                onAnimationComplete={() => {
                  if (sheetRef.current)
                    heightRef.current = sheetRef.current.offsetHeight;
                }}
                {...gate}
                style={
                  isMobileScreen
                    ? { ...heightStyle, ...(gate.style as Record<string, any>) }
                    : { ...(gate.style as Record<string, any>) }
                }
                className={cn(
                  "pointer-events-auto flex flex-col overflow-hidden bg-card border border-border will-change-transform",
                  isMobileScreen
                    ? "w-full max-w-2xl rounded-t-3xl"
                    : "w-full max-w-md rounded-2xl max-h-[85vh]",
                  className
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descriptionId : undefined}
                aria-label={title ? undefined : "Modal dialog"}
                data-bottom-sheet="true"
              >
                <div className="flex flex-col items-center px-6 pb-2 pt-4">
                  {/* Drag handle pill only on mobile */}
                  {isMobileScreen && (
                    <div
                      onPointerDown={(event) => dragControls.start(event)}
                      className={cn(
                        "flex cursor-grab touch-none items-center justify-center py-1 active:cursor-grabbing mb-1",
                        TOUCH_GESTURE_CONTENT_CLASS
                      )}
                    >
                      <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
                    </div>
                  )}
                  {title || description ? (
                    <div className="mt-1 w-full text-left">
                      {title ? (
                        <h2
                          id={titleId}
                          className="text-lg font-semibold text-foreground tracking-tight"
                        >
                          {title}
                        </h2>
                      ) : null}
                      {description ? (
                        <p
                          id={descriptionId}
                          className="mt-1 text-sm text-muted-foreground leading-relaxed"
                        >
                          {description}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div
                  className={cn(
                    "flex-1 overflow-y-auto overscroll-contain px-6 pb-6 bottom-sheet-content",
                    "max-sm:[-ms-overflow-style:none] max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden"
                  )}
                >
                  {children}
                </div>
              </motion.div>
            </div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
