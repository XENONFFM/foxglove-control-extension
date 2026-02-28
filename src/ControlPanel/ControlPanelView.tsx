import GamepadControl from "@/components/Gamepad/GamepadControl";
import JoystickControl from "@/components/Joystick/JoystickControl";
import KeyboardControl from "@/components/Keyboard";
import { PanelConfig } from "@/config";
import { Joy } from "@/types";

export type ControlPanelViewProps = {
  readonly config: PanelConfig;
  /** Partial config patch — only changes the supplied keys. */
  readonly onConfigChange: (patch: Partial<PanelConfig>) => void;
  /** Interactive/joystick Joy updates (not a config change). */
  readonly onInteractiveJoy: (joy: Joy) => void;
};

export function ControlPanelView({
  config,
  onConfigChange,
  onInteractiveJoy,
}: ControlPanelViewProps): JSX.Element {
  const isGamepadEnabled = config.dataSource === "gamepad";
  const isJoystickEnabled = config.dataSource === "joystick";
  const isKeyboardEnabled = config.dataSource === "keyboard";

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4">
          {config.showGamepad && (
            <GamepadControl
              enabled={isGamepadEnabled}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showGamepadRightSide}
              onEnabledChange={({ enabled }) => {
                if (enabled) onConfigChange({ dataSource: "gamepad" });
              }}
              selectedControllerIndex={config.gamepadId}
              onSelectedControllerIndexChange={(gamepadId) => onConfigChange({ gamepadId })}
              onSelectedControllerIndexConfigChange={(gamepadId) => onConfigChange({ gamepadId })}
              showButtons={config.showButtons}
              showAxes={config.showAxes}
              gamepadJoyTransform={config.gamepadJoyTransform}
              onGamepadJoyTransformChange={(gamepadJoyTransform) =>
                onConfigChange({ gamepadJoyTransform })
              }
              onShowButtonsChange={({ showButtons }) => onConfigChange({ showButtons })}
              onShowAxesChange={({ showAxes }) => onConfigChange({ showAxes })}
              axisVisualization={config.axisVisualization}
              onAxisVisualizationChange={(axisVisualization) =>
                onConfigChange({ axisVisualization })
              }
              onShowRightSideChange={({ showRightSide }) =>
                onConfigChange({ showGamepadRightSide: showRightSide })
              }
            />
          )}
          {config.showJoystick && (
            <JoystickControl
              onInteractiveJoy={onInteractiveJoy}
              axis={config.joystickAxis}
              size={config.joystickSize}
              sticky={config.joystickSticky}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showJoystickRightSide}
              onAxisChange={(joystickAxis) => onConfigChange({ joystickAxis })}
              onSizeChange={(joystickSize) => onConfigChange({ joystickSize })}
              onStickyChange={({ sticky }) => onConfigChange({ joystickSticky: sticky })}
              onShowRightSideChange={({ showRightSide }) =>
                onConfigChange({ showJoystickRightSide: showRightSide })
              }
              enabled={isJoystickEnabled}
              onEnabledChange={({ enabled }) => {
                if (enabled) onConfigChange({ dataSource: "joystick" });
              }}
            />
          )}
          {config.showKeyboard && (
            <KeyboardControl
              layout={config.keyboardLayout}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showKeyboardRightSide}
              onShowRightSideChange={({ showRightSide }) =>
                onConfigChange({ showKeyboardRightSide: showRightSide })
              }
              enabled={isKeyboardEnabled}
              onEnabledChange={({ enabled }) => {
                if (enabled) onConfigChange({ dataSource: "keyboard" });
              }}
              onLayoutChange={(keyboardLayout) => onConfigChange({ keyboardLayout })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
