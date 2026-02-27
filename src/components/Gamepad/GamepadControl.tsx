import { useEffect, useState } from "react";

import { GamepadSVG } from "./GamepadSVG";
import { AxisVisualizationMode } from "@/config/types";
import { cn } from "@/lib/utils";
import {
  GamepadJoyTransformKey,
  getGamepadJoyTransformOptions,
} from "@/mappings/gamepadJoyTransforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ControlCard } from "@/components/control-card";
import { Progress } from "@/components/ui/progress";
import { SettingsSection, SettingsItem, SettingsValue } from "@/components/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface GamepadState {
  id: string;
  index: number;
  selectedControllerIndex: number;
  connected: boolean;
  connectedControllersCount: number;
  connectedControllers: Array<{ index: number; id: string }>;
  mapping: string;
  timestamp: number;
  vibrationSupported: boolean;
  vibrationActuatorType: string;
  hapticActuatorsCount: number;
  hapticActuatorsTypes: string[];
  buttons: number[];
  buttonsPressed: boolean[];
  buttonsTouched: boolean[];
  axes: number[];
}

// Helper functions for formatting gamepad data
function formatAxisValues(axes: number[] | undefined): string {
  return axes?.map((axis) => axis.toFixed(3)).join(", ") ?? "N/A";
}

function formatButtonValues(buttons: number[] | undefined): string {
  return buttons?.map((button) => button.toFixed(2)).join(", ") ?? "N/A";
}

function formatPressedIndices(buttonsPressed: boolean[] | undefined): string {
  const pressedIndices =
    buttonsPressed
      ?.map((pressed, index) => (pressed ? index : null))
      .filter((index): index is number => index != null) ?? [];
  return pressedIndices.length > 0 ? pressedIndices.join(", ") : "none";
}

function formatTouchedIndices(buttonsTouched: boolean[] | undefined): string {
  const touchedIndices =
    buttonsTouched
      ?.map((touched, index) => (touched ? index : null))
      .filter((index): index is number => index != null) ?? [];
  return touchedIndices.length > 0 ? touchedIndices.join(", ") : "none";
}

function formatHapticTypes(types: string[] | undefined): string {
  return types && types.length > 0 ? types.join(", ") : "none";
}

// Custom hook for gamepad polling
export function useGamepadPolling(
  selectedControllerIndex: number | null = null,
): GamepadState | null {
  const [gamepad, setGamepad] = useState<GamepadState | null>(null);

  useEffect(() => {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads();
      const connectedControllers = Array.from(gamepads)
        .map((controller, index) => ({ controller, index }))
        .filter(
          (
            entry,
          ): entry is {
            controller: Gamepad;
            index: number;
          } => entry.controller != null && entry.controller.connected,
        );
      const connectedControllersCount = connectedControllers.length;
      let foundGamepad: GamepadState | null = null;

      const selectedEntry =
        selectedControllerIndex != null
          ? connectedControllers.find((entry) => entry.index === selectedControllerIndex)
          : undefined;
      const activeEntry = selectedEntry ?? connectedControllers[0];

      if (activeEntry != null) {
        const gp = activeEntry.controller;
        const activeIndex = activeEntry.index;
        const maybeHapticActuators = (
          gp as Gamepad & {
            hapticActuators?: GamepadHapticActuator[];
          }
        ).hapticActuators;
        const hapticActuators = Array.isArray(maybeHapticActuators) ? maybeHapticActuators : [];
        const vibrationActuatorType = String(
          (gp.vibrationActuator as { type?: unknown } | null)?.type ?? "none",
        );

        foundGamepad = {
          id: gp.id,
          index: activeIndex,
          selectedControllerIndex: activeIndex,
          connected: gp.connected,
          connectedControllersCount,
          connectedControllers: connectedControllers.map((entry) => ({
            index: entry.index,
            id: entry.controller.id,
          })),
          mapping: gp.mapping || "standard",
          timestamp: gp.timestamp,
          vibrationSupported: Boolean(gp.vibrationActuator),
          vibrationActuatorType,
          hapticActuatorsCount: hapticActuators.length,
          hapticActuatorsTypes: hapticActuators.map((actuator) =>
            String((actuator as { type?: unknown }).type ?? "unknown"),
          ),
          buttons: Array.from(gp.buttons).map((btn) => (typeof btn === "object" ? btn.value : btn)),
          buttonsPressed: Array.from(gp.buttons).map((btn) => btn.pressed),
          buttonsTouched: Array.from(gp.buttons).map((btn) => btn.touched),
          axes: Array.from(gp.axes),
        };
      }

      setGamepad(foundGamepad);
      requestAnimationFrame(pollGamepads);
    };

    const frameId = requestAnimationFrame(pollGamepads);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [selectedControllerIndex]);

  return gamepad;
}

// Controller Card Component
export default function GamepadControl({
  gamepad,
  enabled,
  onEnabledChange,
  showRightSide = true,
  onShowRightSideChange,
  selectedControllerIndex,
  onSelectedControllerIndexChange,
  showButtons = true,
  showAxes = true,
  gamepadJoyTransform = "default",
  axisVisualization = "bars",
  showControlButtons = true,
  onSelectedControllerIndexConfigChange,
  onGamepadJoyTransformChange,
  onShowButtonsChange,
  onShowAxesChange,
  onAxisVisualizationChange,
}: {
  gamepad: GamepadState | null;
  enabled: boolean;
  onEnabledChange: (options: { enabled: boolean }) => void;
  showRightSide?: boolean;
  onShowRightSideChange?: (payload: { showRightSide: boolean }) => void;
  selectedControllerIndex: number | null;
  onSelectedControllerIndexChange?: (index: number) => void;
  showButtons?: boolean;
  showAxes?: boolean;
  gamepadJoyTransform?: GamepadJoyTransformKey;
  axisVisualization?: AxisVisualizationMode;
  showControlButtons?: boolean;
  onSelectedControllerIndexConfigChange?: (index: number) => void;
  onGamepadJoyTransformChange?: (mapping: GamepadJoyTransformKey) => void;
  onShowButtonsChange?: (payload: { showButtons: boolean }) => void;
  onShowAxesChange?: (payload: { showAxes: boolean }) => void;
  onAxisVisualizationChange?: (mode: AxisVisualizationMode) => void;
}): JSX.Element {
  const gamepadTransformOptions = getGamepadJoyTransformOptions();

  const handleVibrationTest = () => {
    if (gamepad?.vibrationSupported === true) {
      // Test vibration for 200ms
      const gamepads = navigator.getGamepads();
      const gp = gamepads[gamepad.index];
      if (gp?.vibrationActuator) {
        void gp.vibrationActuator
          .playEffect("dual-rumble", {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 0.5,
            strongMagnitude: 0.5,
          })
          .catch(() => {
            // Silently handle vibration errors
          });
      }
    }
  };

  const settingsContent = (
    <>
      {/* Controller Selection Section */}
      <SettingsSection>
        <SettingsItem label="Active Controller ID">
          {gamepad != null && gamepad.connectedControllers.length > 0 ? (
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[String(selectedControllerIndex ?? gamepad.selectedControllerIndex)]}
              onValueChange={(values) => {
                const value = values[0] ?? "";
                if (value !== "") {
                  const parsedIndex = Number(value);
                  onSelectedControllerIndexChange?.(parsedIndex);
                  onSelectedControllerIndexConfigChange?.(parsedIndex);
                }
              }}
              disabled={gamepad.connectedControllersCount <= 1}
            >
              {gamepad.connectedControllers.map((controller) => (
                <ToggleGroupItem key={controller.index} value={String(controller.index)}>
                  {controller.index}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <ToggleGroup variant="outline" size="sm" value={["none"]} disabled>
              <ToggleGroupItem value="none">No controller</ToggleGroupItem>
            </ToggleGroup>
          )}
        </SettingsItem>
        {gamepad?.vibrationSupported === true && (
          <SettingsItem label="Test Vibration">
            <Button variant="outline" size="sm" onClick={handleVibrationTest}>
              Vibrate
            </Button>
          </SettingsItem>
        )}
        <SettingsItem label="Mapping">
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[gamepadJoyTransform]}
            onValueChange={(values) => {
              const value = values[0] ?? "";
              if (value in gamepadTransformOptions) {
                onGamepadJoyTransformChange?.(value as GamepadJoyTransformKey);
              }
            }}
          >
            {Object.entries(gamepadTransformOptions).map(([key, option]) => (
              <ToggleGroupItem key={key} value={key}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </SettingsItem>
        <SettingsItem label="Show Buttons">
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[showButtons ? "on" : "off"]}
            onValueChange={(values) => {
              const value = values[0] ?? "";
              if (value === "on" || value === "off") {
                onShowButtonsChange?.({ showButtons: value === "on" });
              }
            }}
          >
            <ToggleGroupItem value="on">On</ToggleGroupItem>
            <ToggleGroupItem value="off">Off</ToggleGroupItem>
          </ToggleGroup>
        </SettingsItem>
        <SettingsItem label="Show Axes">
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[showAxes ? "on" : "off"]}
            onValueChange={(values) => {
              const value = values[0] ?? "";
              if (value === "on" || value === "off") {
                onShowAxesChange?.({ showAxes: value === "on" });
              }
            }}
          >
            <ToggleGroupItem value="on">On</ToggleGroupItem>
            <ToggleGroupItem value="off">Off</ToggleGroupItem>
          </ToggleGroup>
        </SettingsItem>
        <SettingsItem label="Axis Visualization">
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[axisVisualization]}
            onValueChange={(values) => {
              const value = values[0] ?? "";
              if (value === "plots" || value === "bars") {
                onAxisVisualizationChange?.(value);
              }
            }}
            disabled={!showAxes}
          >
            <ToggleGroupItem value="plots">Plots</ToggleGroupItem>
            <ToggleGroupItem value="bars">Bars</ToggleGroupItem>
          </ToggleGroup>
        </SettingsItem>
      </SettingsSection>

      {/* Gamepad API Info Section */}
      <SettingsSection title="Gamepad API Info">
        <SettingsItem label="Connected Controllers">
          <SettingsValue mono>{gamepad?.connectedControllersCount ?? 0}</SettingsValue>
        </SettingsItem>
      </SettingsSection>

      {/* Active Gamepad Info Section */}
      <SettingsSection title="Active Gamepad Info">
        <SettingsItem label="Index">
          <SettingsValue mono>{gamepad?.index ?? "N/A"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Name">
          <SettingsValue>{gamepad?.id ?? "Unknown"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Mapping">
          <SettingsValue>{gamepad?.mapping ?? "standard"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Connected">
          <SettingsValue>{gamepad?.connected === true ? "true" : "false"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Timestamp">
          <SettingsValue mono>{gamepad ? gamepad.timestamp.toFixed(2) : "0.00"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Buttons">
          <SettingsValue mono>{gamepad?.buttons.length ?? 0}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Pressed Buttons">
          <SettingsValue mono>{gamepad?.buttonsPressed.filter(Boolean).length ?? 0}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Touched Buttons">
          <SettingsValue mono>{gamepad?.buttonsTouched.filter(Boolean).length ?? 0}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Axes">
          <SettingsValue mono>{gamepad?.axes.length ?? 0}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Vibration">
          <SettingsValue>
            {gamepad?.vibrationSupported === true ? "supported" : "unsupported"}
          </SettingsValue>
        </SettingsItem>
        <SettingsItem label="Vibration Type">
          <SettingsValue mono>{gamepad?.vibrationActuatorType ?? "none"}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Haptic Actuators">
          <SettingsValue mono>{gamepad?.hapticActuatorsCount ?? 0}</SettingsValue>
        </SettingsItem>
      </SettingsSection>

      {/* Detailed Data Section */}
      <SettingsSection title="Detailed Data">
        <SettingsItem label="Axes Values">
          <SettingsValue mono>{formatAxisValues(gamepad?.axes)}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Button Values">
          <SettingsValue mono>{formatButtonValues(gamepad?.buttons)}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Pressed Indices">
          <SettingsValue mono>{formatPressedIndices(gamepad?.buttonsPressed)}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Touched Indices">
          <SettingsValue mono>{formatTouchedIndices(gamepad?.buttonsTouched)}</SettingsValue>
        </SettingsItem>
        <SettingsItem label="Haptic Types">
          <SettingsValue mono>{formatHapticTypes(gamepad?.hapticActuatorsTypes)}</SettingsValue>
        </SettingsItem>
      </SettingsSection>
    </>
  );

  const isConnected = gamepad?.connected === true;
  const isProgressAxisVisualization = axisVisualization === "bars";
  const hasAxes = Boolean(gamepad?.axes && gamepad.axes.length > 0);

  const axesValuesContent = isProgressAxisVisualization ? (
    <GamepadAxisProgressBars axes={gamepad?.axes ?? []} />
  ) : (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: Math.ceil((gamepad?.axes.length ?? 0) / 2) }).map((_, pairIndex) => {
        const axisXIndex = pairIndex * 2;
        const axisYIndex = pairIndex * 2 + 1;
        return (
          <GamepadStick
            key={pairIndex}
            label={`Stick ${pairIndex + 1}`}
            axisX={gamepad?.axes[axisXIndex] ?? 0}
            axisY={gamepad?.axes[axisYIndex] ?? 0}
          />
        );
      })}
    </div>
  );

  const axesSkeletonContent = isProgressAxisVisualization ? (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-3 w-10 rounded animate-none" />
            <Skeleton className="h-3 w-14 rounded animate-none" />
          </div>
          <Skeleton className="h-2 w-full rounded-full animate-none" />
        </div>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl border gap-4 p-4">
          <Skeleton className="h-4 w-16 rounded animate-none" />
          <Skeleton className="aspect-square rounded-full animate-none" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 rounded-md animate-none" />
            <Skeleton className="h-12 rounded-md animate-none" />
          </div>
        </div>
      ))}
    </div>
  );

  const axesContent = hasAxes ? axesValuesContent : axesSkeletonContent;

  const rightPaneContent =
    showButtons || showAxes ? (
      <div className="space-y-4">
        {showButtons && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Buttons</h3>
            {gamepad?.buttons && gamepad.buttons.length > 0 ? (
              <GamepadButtons buttons={gamepad.buttons} />
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-md border px-2 py-2">
                    <Skeleton className="h-3 w-8 rounded animate-none" />
                    <Skeleton className="h-4 w-6 rounded animate-none" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showAxes && (
          <div className="pt-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Axes</h3>
            {axesContent}
          </div>
        )}
      </div>
    ) : undefined;

  return (
    <ControlCard
      enabled={enabled}
      onEnabledChange={onEnabledChange}
      showRightPane={showRightSide}
      onRightPaneChange={({ show }) => {
        onShowRightSideChange?.({ showRightSide: show });
      }}
      showPowerButton={showControlButtons}
      showSettingsButton={showControlButtons}
      showRightPaneToggleButton={showControlButtons}
      settingsContent={settingsContent}
      rightPaneContent={rightPaneContent}
    >
      <div
        className={cn(
          "relative w-full max-w-md transition-opacity duration-300",
          !enabled && "opacity-30",
        )}
      >
        <GamepadSVG gamepad={gamepad} />
        <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2">
          <Badge variant="secondary" className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected
                  ? "bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.75)]"
                  : "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.75)]",
              )}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>
    </ControlCard>
  );
}

function GamepadAxisProgressBars({ axes }: { axes: number[] }): JSX.Element {
  return (
    <div className="space-y-3">
      {axes.map((axisValue, index) => {
        const clampedValue = Math.max(-1, Math.min(1, axisValue));
        const progressValue = ((clampedValue + 1) / 2) * 100;

        return (
          <div key={index} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Axis {index}</span>
              <span className="font-semibold text-secondary-foreground">
                {clampedValue.toFixed(5)}
              </span>
            </div>
            <Progress value={progressValue} className="h-2 transition-none" />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>-1.0</span>
              <span>+1.0</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GamepadStick({
  label,
  axisX,
  axisY,
}: {
  label: string;
  axisX: number;
  axisY: number;
}): JSX.Element {
  const clampedX = Math.max(-1, Math.min(1, axisX));
  const clampedY = Math.max(-1, Math.min(1, axisY));

  return (
    <div className="flex flex-col rounded-xl border gap-4 p-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="relative aspect-square rounded-full border border-secondary bg-muted/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[10%] h-[80%] w-px -translate-x-1/2 bg-secondary" />
          <div className="absolute top-1/2 left-[10%] h-px w-[80%] -translate-y-1/2 bg-secondary" />
        </div>
        <div
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 shadow"
          style={{
            left: `${50 + clampedX * 40}%`,
            top: `${50 + clampedY * 40}%`,
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded-md bg-muted/30 px-2 py-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {label.includes("L") ? "Axis 0" : "Axis 2"}
          </div>
          <div className="font-semibold text-secondary-foreground">{axisX.toFixed(5)}</div>
        </div>
        <div className="rounded-md bg-muted/30 px-2 py-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {label.includes("L") ? "Axis 1" : "Axis 3"}
          </div>
          <div className="font-semibold text-secondary-foreground">{axisY.toFixed(5)}</div>
        </div>
      </div>
    </div>
  );
}

function GamepadButtons({ buttons }: { buttons?: number[] }): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
      {buttons?.map((value, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col gap-1 rounded-md bg-muted/30 px-2 py-2 text-xs text-muted-foreground",
            value > 0.1 && " bg-muted text-primary",
          )}
        >
          <div className="text-[10px] uppercase tracking-wide opacity-70">B{index}</div>
          <div className="text-sm font-semibold text-secondary-foreground">{value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
