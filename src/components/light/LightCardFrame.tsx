import type * as React from "react";

import { cn } from "@/lib/utils";

export function LightCardFrame({
  title,
  subtitle,
  showHeader = true,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  showHeader?: boolean;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section className={cn("flex h-full min-h-0 w-full flex-col rounded-xl p-1", className)}>
      {showHeader && (
        <header className="mb-1 flex items-center justify-between gap-1.5">
          <h2 className="truncate text-[11px] font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <span className="truncate text-[9px] text-muted-foreground">{subtitle}</span>
          )}
        </header>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
