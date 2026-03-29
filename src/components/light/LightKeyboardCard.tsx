import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import useKeyboard from "@/components/Keyboard/useKeyboard";
import { cn } from "@/lib/utils";
import { LightCardFrame } from "./LightCardFrame";

function KeyTile({
  label,
  active,
  sizePx,
}: {
  label: string;
  active: boolean;
  sizePx: number;
}): React.ReactElement {
  const fontSizePx = Math.max(10, Math.min(26, Math.round(sizePx * 0.34)));

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-md border font-semibold transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border/80 bg-muted/20 text-muted-foreground",
      )}
      style={{ width: `${sizePx}px`, height: `${sizePx}px`, fontSize: `${fontSizePx}px` }}
    >
      {label}
    </span>
  );
}

export function LightKeyboardCard({
  layout,
  enabled,
}: {
  layout: "wasd" | "arrows";
  enabled: boolean;
}): React.ReactElement {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [tileSizePx, setTileSizePx] = useState<number>(32);
  const [gapPx, setGapPx] = useState<number>(6);
  const keyState = useKeyboard();
  const labels: [string, string, string, string] =
    layout === "wasd" ? ["W", "A", "S", "D"] : ["↑", "←", "↓", "→"];
  const active =
    layout === "wasd"
      ? ([keyState.w, keyState.a, keyState.s, keyState.d] as [boolean, boolean, boolean, boolean])
      : ([
          keyState.arrowUp,
          keyState.arrowLeft,
          keyState.arrowDown,
          keyState.arrowRight,
        ] as [boolean, boolean, boolean, boolean]);

  useEffect(() => {
    const container = gridRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const recomputeSize = () => {
      const rect = container.getBoundingClientRect();
      const availableWidth = Math.max(0, rect.width);
      const availableHeight = Math.max(0, rect.height);

      if (availableWidth <= 0 || availableHeight <= 0) {
        return;
      }

      const baseGap = 8;
      const byWidth = (availableWidth - baseGap * 2) / 3;
      const byHeight = (availableHeight - baseGap) / 2;
      const rawTile = Math.floor(Math.min(byWidth, byHeight));
      const nextTile = Math.max(24, Math.min(140, rawTile));
      const nextGap = Math.max(4, Math.min(12, Math.round(nextTile * 0.18)));

      setTileSizePx(nextTile);
      setGapPx(nextGap);
    };

    recomputeSize();
    const observer = new ResizeObserver(() => {
      recomputeSize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <LightCardFrame
      title="Keyboard"
      subtitle={layout.toUpperCase()}
      showHeader={false}
      className={!enabled ? "opacity-70" : undefined}
    >
      <div ref={gridRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className="grid grid-cols-3"
          style={{ gap: `${gapPx}px` }}
        >
          <span style={{ width: `${tileSizePx}px`, height: `${tileSizePx}px` }} />
          <KeyTile label={labels[0]} active={active[0]} sizePx={tileSizePx} />
          <span style={{ width: `${tileSizePx}px`, height: `${tileSizePx}px` }} />
          <KeyTile label={labels[1]} active={active[1]} sizePx={tileSizePx} />
          <KeyTile label={labels[2]} active={active[2]} sizePx={tileSizePx} />
          <KeyTile label={labels[3]} active={active[3]} sizePx={tileSizePx} />
        </div>
      </div>
    </LightCardFrame>
  );
}
