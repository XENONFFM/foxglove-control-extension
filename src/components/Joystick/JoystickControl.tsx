"use client";

import * as React from "react";

import { Joystick, type JoystickPosition } from "./Joystick";
import { JoystickAxisMode } from "../../config/types";
import { Joy } from "../../types";
import { ControlCard } from "../ui/control-card";
import { SettingsSection, SettingsItem } from "../ui/settings-section";
import { Switch } from "../ui/switch";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

function LiveOutput({ position }: { position: JoystickPosition }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm font-mono">
      <div className="flex items-center justify-between rounded-md bg-background dark:bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">x</span>
        <span className="font-semibold text-foreground tabular-nums">{position.x.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-background dark:bg-muted/30 *:px-3 py-2">
        <span className="text-muted-foreground">y</span>
        <span className="font-semibold text-foreground tabular-nums">{position.y.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-background dark:bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">dist</span>
        <span className="font-semibold text-foreground tabular-nums">
          {position.distance.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-background dark:bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">angle</span>
        <span className="font-semibold text-foreground tabular-nums">
          {((position.angle * 180) / Math.PI).toFixed(0)}
          {"°"}
        </span>
      </div>
    </div>
  );
}

export default function JoystickControl({
  onInteractiveJoy,
  axis,
  sticky,
  onAxisChange,
  onStickyChange,
  showRightSide = true,
  onShowRightSideChange,
  enabled = true,
  onEnabledChange,
}: {
  onInteractiveJoy?: (interactiveJoy: Joy) => void;
  axis?: JoystickAxisMode;
  sticky?: boolean;
  onAxisChange?: (axis: JoystickAxisMode) => void;
  onStickyChange?: (payload: { sticky: boolean }) => void;
  showRightSide?: boolean;
  onShowRightSideChange?: (payload: { showRightSide: boolean }) => void;
  enabled?: boolean;
  onEnabledChange?: (payload: { enabled: boolean }) => void;
}): JSX.Element {
  const [mainPos, setMainPos] = React.useState<JoystickPosition>({
    x: 0,
    y: 0,
    distance: 0,
    angle: 0,
  });

  const [_isDragging, setIsDragging] = React.useState(false);
  const [size, setSize] = React.useState<"xs" | "sm" | "md" | "lg" | "xl">("md");
  const [axisState, setAxisState] = React.useState<JoystickAxisMode>(axis ?? "both");
  const [stickyState, setStickyState] = React.useState(sticky ?? false);

  React.useEffect(() => {
    setAxisState(axis ?? "both");
  }, [axis]);

  React.useEffect(() => {
    setStickyState(sticky ?? false);
  }, [sticky]);

  const emitInteractiveJoy = React.useCallback(
    (position: JoystickPosition) => {
      onInteractiveJoy?.({
        header: { stamp: { sec: 0, nsec: 0 }, frame_id: "" },
        axes: [position.x, position.y],
        buttons: [],
      });
    },
    [onInteractiveJoy],
  );

  const settingsContent = (
    <SettingsSection>
      <SettingsItem label="Size">
        <ToggleGroup type="single" variant="outline" size="sm" value={size}>
          {["xs", "sm", "md", "lg", "xl"].map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              onClick={() => {
                setSize(s as "xs" | "sm" | "md" | "lg" | "xl");
              }}
            >
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingsItem>

      <SettingsItem label="Enabled Axis">
        <ToggleGroup type="single" variant="outline" size="sm" value={axisState}>
          {["both", "x", "y"].map((a) => (
            <ToggleGroupItem
              key={a}
              value={a}
              onClick={() => {
                const nextAxis = a as JoystickAxisMode;
                setAxisState(nextAxis);
                onAxisChange?.(nextAxis);
              }}
            >
              {a}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingsItem>

      <SettingsItem label="Sticky Mode">
        <Switch
          checked={stickyState}
          onCheckedChange={(nextSticky) => {
            setStickyState(nextSticky);
            onStickyChange?.({ sticky: nextSticky });
          }}
          size="default"
        />
      </SettingsItem>
    </SettingsSection>
  );

  const rightPaneContent = (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Output</h3>
      <LiveOutput position={mainPos} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <ControlCard
        enabled={enabled}
        onEnabledChange={onEnabledChange}
        showRightPane={showRightSide}
        onRightPaneChange={({ show }) => {
          onShowRightSideChange?.({ showRightSide: show });
        }}
        settingsContent={settingsContent}
        rightPaneContent={rightPaneContent}
      >
        <Joystick
          size={size}
          axis={axisState}
          snapToCenter={!stickyState}
          disabled={!enabled}
          onMove={(position) => {
            setMainPos(position);
            emitInteractiveJoy(position);
          }}
          onStart={() => {
            setIsDragging(true);
          }}
          onEnd={(pos) => {
            setMainPos(pos);
            setIsDragging(false);
            emitInteractiveJoy(pos);
          }}
        />
      </ControlCard>
    </div>
  );
}
