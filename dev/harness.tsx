import { type ReactElement, useEffect, useRef, useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlPanel } from "@/ControlPanel";
import { ControlPanelLite } from "@/ControlPanelLite";
import { PanelExtensionContext } from "@foxglove/extension";
import { SettingsSheet } from "./components/settings-sheet";

export function Harness({ context }: { context: PanelExtensionContext }): ReactElement {
  const overlayMenuRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState<"full" | "lite">(() => {
    if (typeof window === "undefined") {
      return "full";
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("page") === "lite" ? "lite" : "full";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.replaceState(null, "", url);
  }, [page]);

  const handleOverlayMenuMouseLeave = (): void => {
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement &&
      overlayMenuRef.current?.contains(activeElement)
    ) {
      // Clearing focus ensures group-focus-within drops when the pointer leaves.
      activeElement.blur();
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="nina-harness-theme">
      <TooltipProvider delay={1000}>
        <div className="relative mx-auto flex h-full w-full bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
            <div className="mx-auto flex w-full max-w-6xl justify-center px-4 mt-1.5">
              <div
                ref={overlayMenuRef}
                onMouseLeave={handleOverlayMenuMouseLeave}
                className="group pointer-events-auto relative inline-flex h-1 w-16 items-start justify-center overflow-visible"
              >
                <div className="absolute inset-x-0 -top-7 h-8" aria-hidden />
                <div className="h-1 w-16 rounded-full bg-foreground/55 shadow-[0_0_0_1px_color-mix(in_oklab,var(--background)_70%,transparent)] transition-opacity duration-150 group-hover:opacity-0 group-focus-within:opacity-0" />
                <SettingsSheet
                  context={context}
                  mode={page}
                  onModeToggle={() => {
                    setPage((prevPage) => (prevPage === "full" ? "lite" : "full"));
                  }}
                  className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-focus-within:pointer-events-auto group-hover:opacity-100 group-focus-within:opacity-100"
                />
              </div>
            </div>
          </div>

          {page === "lite" ? <ControlPanelLite context={context} /> : <ControlPanel context={context} />}
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
