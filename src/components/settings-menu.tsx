import {
  CircleDot,
  Gamepad2,
  Info,
  Keyboard,
  LogIn,
  LogOut,
  Monitor,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SettingsMenuSection {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

function getSectionIcon(label: string): React.ReactElement {
  const normalized = label.trim().toLowerCase();

  if (/display|visual|view/.test(normalized)) {
    return <Monitor className="size-4" />;
  }
  if (normalized.includes("input")) {
    return <LogIn className="size-4" />;
  }
  if (normalized.includes("output")) {
    return <LogOut className="size-4" />;
  }
  if (/gamepad|controller/.test(normalized)) {
    return <Gamepad2 className="size-4" />;
  }
  if (normalized.includes("keyboard")) {
    return <Keyboard className="size-4" />;
  }
  if (/api|info|detail/.test(normalized)) {
    return <Info className="size-4" />;
  }
  if (/mapping|axis|transform/.test(normalized)) {
    return <SlidersHorizontal className="size-4" />;
  }
  if (normalized.includes("joystick")) {
    return <CircleDot className="size-4" />;
  }

  return <Settings2 className="size-4" />;
}

export function SettingsMenuLayout({
  title,
  action,
  sections,
  selectedSectionKey,
  onSectionSelect,
  children,
  compactBreakpoint = 760,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  sections?: SettingsMenuSection[];
  selectedSectionKey?: string;
  onSectionSelect?: (key: string) => void;
  children: React.ReactNode;
  compactBreakpoint?: number;
  className?: string;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const hasSections = Boolean(sections && sections.length > 0 && onSectionSelect);
  const gridTemplateColumns = hasSections
    ? isCompact
      ? "4rem minmax(0,1fr)"
      : "14rem minmax(0,1fr)"
    : "minmax(0,1fr)";

  useEffect(() => {
    if (!hasSections) {
      setIsCompact(false);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateCompactMode = (): void => {
      // Collapse labels when the settings container is too narrow.
      setIsCompact(container.clientWidth < compactBreakpoint);
    };

    updateCompactMode();

    const observer = new ResizeObserver(() => {
      updateCompactMode();
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [compactBreakpoint, hasSections]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full min-h-0 w-full flex-1 flex-col rounded-2xl border border-border/35 bg-background/80 p-3",
        className,
      )}
    >
      <div
        style={{ gridTemplateColumns }}
        className={cn(
          "grid h-full min-h-0 flex-1 gap-4 overflow-hidden",
          !hasSections && "grid-cols-[minmax(0,1fr)]",
        )}
      >
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/60 p-2">
          <div
            className={cn(
              "relative flex items-center px-1 py-1",
              isCompact ? "justify-center" : "justify-between",
            )}
          >
            <h3
              className={cn(
                "text-base font-medium text-foreground/95 ml-3",
                isCompact && "sr-only",
              )}
            >
              {title}
            </h3>
            {action && (
              <div className={cn(isCompact ? "flex w-full justify-center" : "")}>{action}</div>
            )}
          </div>

          {hasSections && sections && onSectionSelect && (
            <div className="h-full min-h-0 rounded-lg p-1">
              <div className="-mx-2 h-full min-h-0 overflow-y-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="space-y-1">
                  {sections.map((section) => {
                    const isActive = section.key === selectedSectionKey;
                    const button = (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onSectionSelect(section.key);
                        }}
                        className={cn(
                          "h-9 rounded-lg text-sm font-medium",
                          isCompact
                            ? "w-full justify-center gap-0 px-0"
                            : "w-full justify-start gap-2 px-2.5",
                          isActive
                            ? "bg-muted/30 text-foreground"
                            : "text-muted-foreground hover:bg-transparent hover:text-muted-foreground",
                        )}
                        aria-label={section.label}
                      >
                        <span
                          className={cn(
                            "inline-flex size-4 items-center justify-center",
                            isActive ? "text-foreground/95" : "text-muted-foreground",
                          )}
                        >
                          {section.icon ?? getSectionIcon(section.label)}
                        </span>
                        <span className={cn(isCompact && "sr-only")}>{section.label}</span>
                      </Button>
                    );

                    if (!isCompact) {
                      return <div key={section.key}>{button}</div>;
                    }

                    return (
                      <Tooltip key={section.key}>
                        <TooltipTrigger render={button} />
                        <TooltipContent side="right" sideOffset={10}>
                          <p>{section.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-full min-h-0 overflow-hidden rounded-xl">
          <div className="-mx-2 h-full min-h-0 space-y-3 overflow-y-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
