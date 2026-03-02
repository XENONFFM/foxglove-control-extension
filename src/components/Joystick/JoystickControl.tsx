"use client";

import * as React from "react";

import { Joystick, type JoystickPosition } from "./Joystick";
import { JoystickAxisMode, JoystickSize } from "@/config/types";
import { Joy } from "@/types";
import { ControlCard } from "@/components/control-card";
import { SettingsSection, SettingsItem } from "@/components/settings";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const JOYSTICK_SIZE_PX: Record<JoystickSize, number> = {
  xs: 96,
  sm: 112,
  md: 160,
  lg: 224,
  xl: 256,
};

const JOYSTICK_SIZE_ORDER: JoystickSize[] = ["xs", "sm", "md", "lg", "xl"];

function getFittedJoystickSize(
  preferredSize: JoystickSize,
  secondEnabled: boolean,
  availableWidth: number,
  availableHeight: number,
): JoystickSize {
  const preferredIndex = Math.max(0, JOYSTICK_SIZE_ORDER.indexOf(preferredSize));
  const maxGap = secondEnabled ? 24 : 0;
  const horizontalPadding = secondEnabled ? 16 : 0;
  const safeAvailableWidth = Math.max(0, availableWidth - horizontalPadding);
  const safeAvailableHeight = Math.max(0, availableHeight);

  const candidates = JOYSTICK_SIZE_ORDER.slice(0, preferredIndex + 1).reverse();
  for (const candidate of candidates) {
    const diameter = JOYSTICK_SIZE_PX[candidate];
    const requiredWidth = secondEnabled ? diameter * 2 + maxGap : diameter;
    const fitsWidth = requiredWidth <= safeAvailableWidth;
    const fitsHeight = diameter <= safeAvailableHeight;

    if (fitsWidth && fitsHeight) {
      return candidate;
    }
  }

  return "xs";
}

function LiveOutput({ position }: { position: JoystickPosition }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm font-mono">
      <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">x</span>
        <span className="font-semibold text-foreground tabular-nums">{position.x.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/30 *:px-3 py-2">
        <span className="text-muted-foreground">y</span>
        <span className="font-semibold text-foreground tabular-nums">{position.y.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground">dist</span>
        <span className="font-semibold text-foreground tabular-nums">
          {position.distance.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
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
  compact = false,
  axis,
  size,
  sticky,
  secondJoystick,
  onAxisChange,
  onSizeChange,
  onStickyChange,
  onSecondJoystickChange,
  showRightSide = true,
  onShowRightSideChange,
  enabled = true,
  showControlButtons = true,
  onEnabledChange,
}: {
  onInteractiveJoy?: (interactiveJoy: Joy) => void;
  compact?: boolean;
  axis?: JoystickAxisMode;
  size?: JoystickSize;
  sticky?: boolean;
  secondJoystick?: boolean;
  onAxisChange?: (axis: JoystickAxisMode) => void;
  onSizeChange?: (size: JoystickSize) => void;
  onStickyChange?: (payload: { sticky: boolean }) => void;
  onSecondJoystickChange?: (payload: { secondJoystick: boolean }) => void;
  showRightSide?: boolean;
  onShowRightSideChange?: (payload: { showRightSide: boolean }) => void;
  enabled?: boolean;
  showControlButtons?: boolean;
  onEnabledChange?: (payload: { enabled: boolean }) => void;
}): React.ReactElement {
  const [mainPos, setMainPos] = React.useState<JoystickPosition>({
    x: 0,
    y: 0,
    distance: 0,
    angle: 0,
  });
  const [secondPos, setSecondPos] = React.useState<JoystickPosition>({
    x: 0,
    y: 0,
    distance: 0,
    angle: 0,
  });
  const [sizeState, setSizeState] = React.useState<JoystickSize>(size ?? "md");
  const [axisState, setAxisState] = React.useState<JoystickAxisMode>(axis ?? "both");
  const [stickyState, setStickyState] = React.useState(sticky ?? false);
  const [secondJoystickState, setSecondJoystickState] = React.useState(secondJoystick ?? false);
  const [availableSize, setAvailableSize] = React.useState({ width: 0, height: 0 });

  const mainPosRef = React.useRef(mainPos);
  const secondPosRef = React.useRef(secondPos);
  const joysticksRowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSizeState(size ?? "md");
  }, [size]);

  React.useEffect(() => {
    setAxisState(axis ?? "both");
  }, [axis]);

  React.useEffect(() => {
    setStickyState(sticky ?? false);
  }, [sticky]);

  React.useEffect(() => {
    setSecondJoystickState(secondJoystick ?? false);
  }, [secondJoystick]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !joysticksRowRef.current) {
      return;
    }

    const updateAvailableSize = () => {
      const rect = joysticksRowRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setAvailableSize({
        width: rect.width,
        height: Math.max(0, window.innerHeight - rect.top - 24),
      });
    };

    updateAvailableSize();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateAvailableSize();
          })
        : undefined;
    if (joysticksRowRef.current) {
      observer?.observe(joysticksRowRef.current);
    }

    window.addEventListener("resize", updateAvailableSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateAvailableSize);
    };
  }, [secondJoystickState, compact]);

  const effectiveSize = React.useMemo(
    () =>
      getFittedJoystickSize(
        sizeState,
        secondJoystickState,
        availableSize.width,
        availableSize.height,
      ),
    [sizeState, secondJoystickState, availableSize.width, availableSize.height],
  );

  const emitInteractiveJoy = React.useCallback(
    (leftPosition: JoystickPosition, rightPosition: JoystickPosition, secondEnabled: boolean) => {
      const axes = secondEnabled
        ? [leftPosition.x, leftPosition.y, rightPosition.x, rightPosition.y]
        : [leftPosition.x, leftPosition.y];
      onInteractiveJoy?.({
        header: { stamp: { sec: 0, nsec: 0 }, frame_id: "" },
        axes,
        buttons: [],
      });
    },
    [onInteractiveJoy],
  );

  const settingsContent = (
    <SettingsSection>
      <SettingsItem label="Size">
        <ToggleGroup variant="outline" size="sm" value={[sizeState]}>
          {["xs", "sm", "md", "lg", "xl"].map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              onClick={() => {
                const nextSize = s as JoystickSize;
                setSizeState(nextSize);
                onSizeChange?.(nextSize);
              }}
            >
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingsItem>

      <SettingsItem label="Enabled Axis">
        <ToggleGroup variant="outline" size="sm" value={[axisState]}>
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

      <SettingsItem label="Second Joystick">
        <Switch
          checked={secondJoystickState}
          onCheckedChange={(nextSecondJoystick) => {
            setSecondJoystickState(nextSecondJoystick);
            onSecondJoystickChange?.({ secondJoystick: nextSecondJoystick });
          }}
          size="default"
        />
      </SettingsItem>
    </SettingsSection>
  );

  const rightPaneContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Output (Left)</h3>
        <LiveOutput position={mainPos} />
      </div>
      {secondJoystickState && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Output (Right)</h3>
          <LiveOutput position={secondPos} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <ControlCard
        title="Joystick"
        compact={compact}
        enabled={enabled}
        onEnabledChange={onEnabledChange}
        leftPaneReservedWidth={secondJoystickState ? 620 : 360}
        rightPaneMinWidth={320}
        showPowerButton={showControlButtons}
        showSettingsButton={showControlButtons}
        showRightPaneToggleButton={showControlButtons}
        showRightPane={showRightSide}
        onRightPaneChange={({ show }) => {
          onShowRightSideChange?.({ showRightSide: show });
        }}
        settingsContent={settingsContent}
        rightPaneContent={rightPaneContent}
      >
        <div
          ref={joysticksRowRef}
          className={
            secondJoystickState
              ? "mx-auto flex w-full max-w-3xl items-center justify-between gap-6"
              : "flex justify-center"
          }
        >
          {secondJoystickState ? (
            <>
              <div className="flex justify-center">
                <Joystick
                  size={effectiveSize}
                  axis={axisState}
                  snapToCenter={!stickyState}
                  disabled={!enabled}
                  onMove={(position) => {
                    mainPosRef.current = position;
                    setMainPos(position);
                    emitInteractiveJoy(position, secondPosRef.current, true);
                  }}
                  onEnd={(position) => {
                    mainPosRef.current = position;
                    setMainPos(position);
                    emitInteractiveJoy(position, secondPosRef.current, true);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Joystick
                  size={effectiveSize}
                  axis={axisState}
                  snapToCenter={!stickyState}
                  disabled={!enabled}
                  onMove={(position) => {
                    secondPosRef.current = position;
                    setSecondPos(position);
                    emitInteractiveJoy(mainPosRef.current, position, true);
                  }}
                  onEnd={(position) => {
                    secondPosRef.current = position;
                    setSecondPos(position);
                    emitInteractiveJoy(mainPosRef.current, position, true);
                  }}
                />
              </div>
            </>
          ) : (
            <Joystick
              size={effectiveSize}
              axis={axisState}
              snapToCenter={!stickyState}
              disabled={!enabled}
              onMove={(position) => {
                mainPosRef.current = position;
                setMainPos(position);
                emitInteractiveJoy(position, secondPosRef.current, false);
              }}
              onEnd={(position) => {
                mainPosRef.current = position;
                setMainPos(position);
                emitInteractiveJoy(position, secondPosRef.current, false);
              }}
            />
          )}
        </div>
      </ControlCard>
    </div>
  );
}
