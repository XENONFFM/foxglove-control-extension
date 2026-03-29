import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string | undefined;
  setValue: (nextValue: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return context;
}

function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const currentValue = value ?? internalValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (value == undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div data-slot="tabs" className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn("inline-flex w-full items-center rounded-md border border-border/70 bg-background/70 p-0.5", className)}
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  value,
  disabled,
  className,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
}): React.ReactElement {
  const { value: currentValue, setValue } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setValue(value);
        }
      }}
      className={cn(
        "inline-flex h-6 min-w-0 flex-1 items-center justify-center gap-1 rounded-sm border-0 px-0.5 text-[9px] text-muted-foreground transition-colors",
        "hover:text-foreground data-[state=active]:bg-muted/55 data-[state=active]:text-foreground",
        disabled && "cursor-not-allowed opacity-35",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Tabs, TabsList, TabsTrigger };