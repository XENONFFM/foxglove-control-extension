import type * as React from "react";

import { DualSenseController, GenericController, XboxController } from "./controllers";
import { buildRenderContext, detectGamepadVisualType } from "./renderContext";
import { ControllerDeadzoneSettings, GamepadState, GamepadVisualizationMode } from "./types";

export function GamepadSVG({
  gamepad,
  visualMode = "auto",
  preferredVisualType,
  deadzone,
}: {
  gamepad: GamepadState | null;
  visualMode?: GamepadVisualizationMode;
  preferredVisualType?: "xbox" | "dualsense";
  deadzone?: ControllerDeadzoneSettings;
}): React.ReactElement {
  const visualType =
    visualMode === "auto" ? detectGamepadVisualType(gamepad?.id, preferredVisualType) : visualMode;
  const ctx = buildRenderContext(gamepad, deadzone);

  if (visualType === "dualsense") {
    return <DualSenseController ctx={ctx} />;
  }

  if (visualType === "xbox") {
    return <XboxController ctx={ctx} />;
  }

  return <GenericController ctx={ctx} />;
}
