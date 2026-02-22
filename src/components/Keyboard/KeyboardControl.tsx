import { cn } from "@/lib/utils";
import { ControlCard } from "@/components/control-card";
import { SettingsSection, SettingsItem } from "@/components/settings-section";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  arrowUp: boolean;
  arrowLeft: boolean;
  arrowDown: boolean;
  arrowRight: boolean;
}

export interface KeyboardControlProps {
  keyState: KeyState;
  layout?: "wasd" | "arrows";
  showRightSide?: boolean;
  onShowRightSideChange?: (payload: { showRightSide: boolean }) => void;
  enabled?: boolean;
  onEnabledChange?: (payload: { enabled: boolean }) => void;
  onLayoutChange?: (layout: "wasd" | "arrows") => void;
}

export default function KeyboardControl({
  keyState,
  layout = "wasd",
  showRightSide = true,
  onShowRightSideChange,
  enabled = true,
  onEnabledChange,
  onLayoutChange,
}: KeyboardControlProps): JSX.Element {
  const forwardPressed = layout === "wasd" ? keyState.w : keyState.arrowUp;
  const backwardPressed = layout === "wasd" ? keyState.s : keyState.arrowDown;
  const leftPressed = layout === "wasd" ? keyState.a : keyState.arrowLeft;
  const rightPressed = layout === "wasd" ? keyState.d : keyState.arrowRight;

  const linearX = Number(forwardPressed) - Number(backwardPressed);
  const angularZ = Number(rightPressed) - Number(leftPressed);

  const settingsContent = (
    <SettingsSection>
      <SettingsItem label="Keyboard Layout">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={layout}
          onValueChange={(value) => {
            if (value === "wasd" || value === "arrows") {
              onLayoutChange?.(value);
            }
          }}
        >
          <ToggleGroupItem value="wasd">WASD</ToggleGroupItem>
          <ToggleGroupItem value="arrows">Arrow Keys</ToggleGroupItem>
        </ToggleGroup>
      </SettingsItem>
    </SettingsSection>
  );

  const rightPaneContent = (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">Output</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm bg-muted/30">
          <span className="text-muted-foreground">linear.x</span>
          <span className="font-mono text-foreground">{linearX}</span>
        </div>
        <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm bg-muted/30">
          <span className="text-muted-foreground">angular.z</span>
          <span className="font-mono text-foreground">{angularZ}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ControlCard
      enabled={enabled}
      onEnabledChange={
        onEnabledChange
          ? ({ enabled: newEnabled }) => {
              onEnabledChange({ enabled: newEnabled });
            }
          : undefined
      }
      showRightPane={showRightSide}
      onRightPaneChange={({ show }) => {
        onShowRightSideChange?.({ showRightSide: show });
      }}
      showPowerButton={!!onEnabledChange}
      showSettingsButton={true}
      settingsContent={settingsContent}
      rightPaneContent={rightPaneContent}
    >
      <KeyboardVisualization keyState={keyState} layout={layout} enabled={enabled} />
    </ControlCard>
  );
}

function KeyboardVisualization({
  keyState,
  layout,
  enabled = true,
}: {
  keyState: KeyState;
  layout: "wasd" | "arrows";
  enabled?: boolean;
}): JSX.Element {
  if (layout === "wasd") {
    return (
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(3, 40px)", width: "fit-content" }}
      >
        <div />
        <KeyButton label="W" pressed={keyState.w} enabled={enabled} />
        <div />
        <KeyButton label="A" pressed={keyState.a} enabled={enabled} />
        <KeyButton label="S" pressed={keyState.s} enabled={enabled} />
        <KeyButton label="D" pressed={keyState.d} enabled={enabled} />
      </div>
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(3, 40px)", width: "fit-content" }}
    >
      <div />
      <KeyButton label="↑" pressed={keyState.arrowUp} enabled={enabled} />
      <div />
      <KeyButton label="←" pressed={keyState.arrowLeft} enabled={enabled} />
      <KeyButton label="↓" pressed={keyState.arrowDown} enabled={enabled} />
      <KeyButton label="→" pressed={keyState.arrowRight} enabled={enabled} />
    </div>
  );
}

function KeyButton({
  label,
  pressed,
  enabled = true,
}: {
  label: string;
  pressed: boolean;
  enabled?: boolean;
}): JSX.Element {
  return (
    <button
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md border-2 font-semibold text-sm transition-all",
        !enabled && "opacity-30 cursor-not-allowed",
        enabled && pressed
          ? "border-primary bg-primary text-primary-foreground shadow-lg scale-95"
          : "border-border bg-card text-card-foreground",
      )}
      disabled
    >
      {label}
    </button>
  );
}
