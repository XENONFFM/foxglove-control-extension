import * as React from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-2">
          <h4 className="text-xs font-bold tracking-wide text-muted-foreground">{title}</h4>
        </div>
      )}
      <div className="rounded-lg bg-muted/30">
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 && <Separator className="mx-4" />}
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
    <div className="px-4 py-3 first:pt-3 last:pb-3">
      <div className="flex items-center justify-between gap-4 mb-2">
        <Label className="text-sm font-medium">{label}</Label>
        {children}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
    <span className={`text-sm font-medium text-muted-foreground ${mono ? "font-mono" : ""}`}>
      {children}
    </span>
  );
}
