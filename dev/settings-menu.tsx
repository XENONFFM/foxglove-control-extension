import { type ReactElement, useEffect, useMemo, useState } from "react";
import { LuSettings } from "react-icons/lu";

import { SettingsItem, SettingsSection } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  PanelExtensionContext,
  SettingsTreeAction,
  SettingsTreeField,
  SettingsTreeFieldValue,
  SettingsTreeNode,
} from "@foxglove/extension";
import { ChevronRightIcon } from "lucide-react";
import { MockPanelContext, MockSettingsEditor } from "./mockPanelContext";

function isMockPanelContext(context: PanelExtensionContext): context is MockPanelContext {
  return (
    "getSettingsEditor" in context &&
    typeof (context as MockPanelContext).getSettingsEditor === "function" &&
    "subscribeSettingsEditor" in context &&
    typeof (context as MockPanelContext).subscribeSettingsEditor === "function"
  );
}

function createSettingsUpdateAction(
  path: string[],
  input: SettingsTreeFieldValue["input"],
  value: SettingsTreeFieldValue["value"],
): SettingsTreeAction {
  return {
    action: "update",
    payload: {
      path,
      input,
      value,
    },
  } as SettingsTreeAction;
}

function renderFieldEditor(
  field: SettingsTreeField,
  path: string[],
  actionHandler: ((action: SettingsTreeAction) => void) | undefined,
): ReactElement {
  const handleUpdate = (value: SettingsTreeFieldValue["value"]): void => {
    if (!actionHandler) {
      return;
    }
    actionHandler(createSettingsUpdateAction(path, field.input, value));
  };

  if (field.input === "boolean") {
    return (
      <Switch
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => {
          handleUpdate(checked);
        }}
        disabled={field.disabled}
      />
    );
  }

  if (field.input === "select") {
    return (
      <Select
        value={String(field.value ?? "")}
        onValueChange={(value) => {
          handleUpdate(value ?? "");
        }}
        disabled={field.disabled}
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option, index) => {
            if (option.value == undefined) {
              return null;
            }
            return (
              <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  const isNumberInput = field.input === "number";
  return (
    <Input
      type={isNumberInput ? "number" : "text"}
      className="h-8 w-40"
      value={String(field.value ?? "")}
      onChange={(event) => {
        handleUpdate(event.currentTarget.value);
      }}
      disabled={field.disabled}
    />
  );
}

function renderSettingsNode(
  nodeKey: string,
  node: SettingsTreeNode | undefined,
  nodePath: string[],
  actionHandler: ((action: SettingsTreeAction) => void) | undefined,
): ReactElement | null {
  if (!node) {
    return null;
  }

  const fieldEntries = Object.entries(node.fields ?? {}).filter(([, field]) => !!field);
  const childEntries = Object.entries(node.children ?? {}).filter(([, childNode]) => !!childNode);
  const hasContent = fieldEntries.length > 0 || childEntries.length > 0;
  const title = node.label ?? nodeKey;

  if (!hasContent) {
    return (
      <div key={`node-${nodePath.join(".") || nodeKey}`} className="px-2 py-1 text-sm font-medium">
        {title}
      </div>
    );
  }

  return (
    <Collapsible key={`node-${nodePath.join(".") || nodeKey}`} defaultOpen>
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="group h-8 w-full justify-start px-2 text-sm font-medium hover:bg-transparent hover:text-inherit dark:hover:bg-transparent active:bg-transparent aria-expanded:bg-transparent aria-expanded:text-inherit"
          >
            <ChevronRightIcon className="size-4 transition-transform group-data-panel-open:rotate-90" />
            {title}
          </Button>
        }
      />

      <CollapsibleContent className="mt-1 pl-3">
        <div className="space-y-2">
          {fieldEntries.length > 0 && (
            <SettingsSection>
              {fieldEntries.map(([fieldKey, field]) => {
                const definedField = field as SettingsTreeField;
                const path = [...nodePath, fieldKey];
                return (
                  <SettingsItem
                    key={`field-${path.join(".")}`}
                    label={definedField.label}
                    description={definedField.help}
                  >
                    {renderFieldEditor(definedField, path, actionHandler)}
                  </SettingsItem>
                );
              })}
            </SettingsSection>
          )}

          {childEntries.length > 0 && (
            <div className="space-y-1">
              {childEntries.map(([childKey, childNode]) => (
                <div key={`child-${[...nodePath, childKey].join(".")}`}>
                  {renderSettingsNode(
                    childKey,
                    childNode as unknown as SettingsTreeNode | undefined,
                    [...nodePath, childKey],
                    actionHandler,
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SettingsMenu({ context }: { context: PanelExtensionContext }): ReactElement {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [settingsEditor, setSettingsEditor] = useState<MockSettingsEditor | undefined>(undefined);

  useEffect(() => {
    if (!isMockPanelContext(context)) {
      return;
    }
    return context.subscribeSettingsEditor(setSettingsEditor);
  }, [context]);

  const settingsTree = useMemo(() => {
    if (!settingsEditor?.nodes) {
      return [];
    }

    return Object.entries(settingsEditor.nodes).flatMap(([nodeKey, node]) =>
      [
        renderSettingsNode(
          nodeKey,
          node as unknown as SettingsTreeNode | undefined,
          [nodeKey],
          settingsEditor.actionHandler,
        ),
      ].filter(Boolean) as ReactElement[],
    );
  }, [settingsEditor]);

  const hasSettings = settingsTree.length > 0;

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="absolute top-3 right-3 z-20">
        <SheetTrigger render={<Button variant="outline" className="whitespace-nowrap" />}>
          <LuSettings />
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        className="inset-y-0 right-0 h-full bg-background backdrop-blur data-[side=right]:w-md data-[side=right]:max-w-none sm:data-[side=right]:max-w-none"
      >
        <SheetHeader className="pb-2">
          <SheetTitle>Panel Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {hasSettings ? (
            settingsTree
          ) : (
            <p className="px-2 text-sm text-muted-foreground">No settings available yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
