import type * as React from "react";

import { GamepadSVG } from "@/components/Gamepad";
import { GamepadVisualizationMode } from "@/config/types";

import { useGamepadPolling } from "@/components/Gamepad/useGamepadPolling";
import { cn } from "@/lib/utils";
import { LightCardFrame } from "./LightCardFrame";

const GAMEPAD_ASPECT_RATIO = "441 / 383";

export function LightGamepadCard({
  enabled,
  selectedControllerIndex,
  gamepadVisualization,
  preferredVisualType,
  gamepadDeadzoneEnabled,
  gamepadDeadzone,
}: {
  enabled: boolean;
  selectedControllerIndex: number | null;
  gamepadVisualization: GamepadVisualizationMode;
  preferredVisualType: "xbox" | "dualsense";
  gamepadDeadzoneEnabled: boolean;
  gamepadDeadzone: number;
}): React.ReactElement {
  const gamepad = useGamepadPolling(selectedControllerIndex);
  const hasController = Boolean(gamepad?.connected);
  const hasButtonInput = (gamepad?.buttonsPressed ?? []).some(Boolean);
  const hasAxisInput = (gamepad?.axes ?? []).some((axis) => Math.abs(axis) > 0.12);
  const hasInput = hasButtonInput || hasAxisInput;
  const ledColor = !hasController
    ? "var(--chart-5)"
    : hasInput
      ? "var(--chart-2)"
      : "var(--chart-1)";
  const ledGlow = !hasController
    ? "color-mix(in oklab, var(--chart-5) 48%, transparent)"
    : hasInput
      ? "color-mix(in oklab, var(--chart-2) 48%, transparent)"
      : "color-mix(in oklab, var(--chart-1) 48%, transparent)";
  const ledShadow = !hasController
    ? "0 0 6px 1px color-mix(in oklab, var(--chart-5) 55%, transparent)"
    : hasInput
      ? "0 0 6px 1px color-mix(in oklab, var(--chart-2) 55%, transparent)"
      : "0 0 6px 1px color-mix(in oklab, var(--chart-1) 55%, transparent)";

  return (
    <LightCardFrame
      title="Gamepad"
      showHeader={false}
      className={!enabled ? "opacity-70" : undefined}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className={cn("transition-opacity", !enabled && "opacity-60")}
          style={{
            height: "100%",
            maxWidth: "100%",
            aspectRatio: GAMEPAD_ASPECT_RATIO,
          }}
        >
          <div className="light-gamepad-visual flex h-full w-full items-center justify-center">
            <GamepadSVG
              gamepad={gamepad}
              visualMode={gamepadVisualization}
              preferredVisualType={preferredVisualType}
              deadzone={{ enabled: gamepadDeadzoneEnabled, value: gamepadDeadzone }}
            />
          </div>
        </div>

        <span aria-hidden className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5">
          <span
            className="absolute left-1/2 top-1/2 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${ledGlow} 0%, rgba(0,0,0,0) 70%)`,
            }}
          />
          <span
            className="absolute inset-0 rounded-full border"
            style={{
              backgroundColor: ledColor,
              borderColor: ledColor,
              boxShadow: ledShadow,
            }}
          />
        </span>
      </div>
    </LightCardFrame>
  );
}
