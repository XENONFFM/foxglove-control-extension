import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function SettingsSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <div className="px-4">
          <h4 className="text-sm font-bold tracking-wide text-foreground/90">{title}</h4>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-muted/20">
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 && <Separator className="mx-4 h-px bg-border/25" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function SettingsItem({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 pr-2">
          <Label className="text-sm font-normal leading-5 text-foreground/95">{label}</Label>
          {description && <p className="mt-1 text-xs leading-5 text-muted-foreground/90">{description}</p>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

export function SettingsValue({
  mono = false,
  children,
}: {
  mono?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "block max-w-[18rem] wrap-break-word text-right text-sm font-medium leading-5 text-muted-foreground",
        mono && "font-mono tabular-nums",
      )}
    >
      {children}
    </span>
  );
}
