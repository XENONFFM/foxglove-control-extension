import { useEffect, useState } from "react";

export interface GamepadState {
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
