import GamepadControl, { useGamepadPolling } from "@/components/Gamepad/GamepadControl";
import JoystickControl from "@/components/Joystick/JoystickControl";
import KeyboardControl from "@/components/Keyboard";
import useKeyboard from "@/components/Keyboard/useKeyboard";
import { PanelConfig } from "@/config";
import { AxisVisualizationMode, JoystickAxisMode, JoystickSize } from "@/config/types";
import { GamepadJoyTransformKey } from "@/mappings/gamepadJoyTransforms";
import { Joy } from "@/types";

export function ControlPanelView({
  config,
  handleKbSwitch,
  handleGamepadSwitch,
  handleJoystickSwitch,
  handleInteractiveJoy,
  handleGamepadIdChange,
  handleGamepadJoyTransformChange,
  handleShowButtonsChange,
  handleShowAxesChange,
  handleAxisVisualizationChange,
  handleShowGamepadRightSideChange,
  handleShowKeyboardRightSideChange,
  handleKeyboardLayoutChange,
  handleJoystickAxisChange,
  handleJoystickSizeChange,
  handleJoystickStickyChange,
  handleShowJoystickRightSideChange,
  handleDataSourceChange,
}: {
  readonly config: PanelConfig;
  readonly handleKbSwitch: (payload: { enabled: boolean }) => void;
  readonly handleGamepadSwitch: (payload: { enabled: boolean }) => void;
  readonly handleJoystickSwitch: (payload: { enabled: boolean }) => void;
  readonly handleInteractiveJoy: (interactiveJoy: Joy) => void;
  readonly handleGamepadIdChange?: (gamepadId: number) => void;
  readonly handleGamepadJoyTransformChange?: (mapping: GamepadJoyTransformKey) => void;
  readonly handleShowButtonsChange?: (payload: { showButtons: boolean }) => void;
  readonly handleShowAxesChange?: (payload: { showAxes: boolean }) => void;
  readonly handleAxisVisualizationChange?: (mode: AxisVisualizationMode) => void;
  readonly handleShowGamepadRightSideChange?: (payload: { showRightSide: boolean }) => void;
  readonly handleShowKeyboardRightSideChange?: (payload: { showRightSide: boolean }) => void;
  readonly handleKeyboardLayoutChange?: (layout: "wasd" | "arrows") => void;
  readonly handleJoystickAxisChange?: (axis: JoystickAxisMode) => void;
  readonly handleJoystickSizeChange?: (size: JoystickSize) => void;
  readonly handleJoystickStickyChange?: (payload: { sticky: boolean }) => void;
  readonly handleShowJoystickRightSideChange?: (payload: { showRightSide: boolean }) => void;
  readonly handleDataSourceChange?: (payload: { dataSource: string; enabled: boolean }) => void;
}): JSX.Element {
  const selectedControllerIndex = config.gamepadId;
  const gamepad = useGamepadPolling(selectedControllerIndex);
  const keyState = useKeyboard();

  const isGamepadEnabled = config.dataSource === "gamepad";
  const isJoystickEnabled = config.dataSource === "joystick";
  const isKeyboardEnabled = config.dataSource === "keyboard";

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4">
          {config.showGamepad && (
            <GamepadControl
              gamepad={gamepad}
              enabled={isGamepadEnabled}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showGamepadRightSide}
              onEnabledChange={({ enabled }) => {
                handleDataSourceChange?.({ dataSource: "gamepad", enabled });
                handleGamepadSwitch({ enabled });
              }}
              selectedControllerIndex={selectedControllerIndex}
              onSelectedControllerIndexChange={handleGamepadIdChange}
              onSelectedControllerIndexConfigChange={handleGamepadIdChange}
              showButtons={config.showButtons}
              showAxes={config.showAxes}
              gamepadJoyTransform={config.gamepadJoyTransform}
              onGamepadJoyTransformChange={handleGamepadJoyTransformChange}
              onShowButtonsChange={handleShowButtonsChange}
              onShowAxesChange={handleShowAxesChange}
              axisVisualization={config.axisVisualization}
              onAxisVisualizationChange={handleAxisVisualizationChange}
              onShowRightSideChange={handleShowGamepadRightSideChange}
            />
          )}
          {config.showJoystick && (
            <JoystickControl
              onInteractiveJoy={handleInteractiveJoy}
              axis={config.joystickAxis}
              size={config.joystickSize}
              sticky={config.joystickSticky}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showJoystickRightSide}
              onAxisChange={handleJoystickAxisChange}
              onSizeChange={handleJoystickSizeChange}
              onStickyChange={handleJoystickStickyChange}
              onShowRightSideChange={handleShowJoystickRightSideChange}
              enabled={isJoystickEnabled}
              onEnabledChange={({ enabled }) => {
                handleDataSourceChange?.({ dataSource: "joystick", enabled });
                handleJoystickSwitch({ enabled });
              }}
            />
          )}
          {config.showKeyboard && (
            <KeyboardControl
              keyState={keyState}
              layout={config.keyboardLayout}
              showControlButtons={config.showControlButtons}
              showRightSide={config.showKeyboardRightSide}
              onShowRightSideChange={handleShowKeyboardRightSideChange}
              enabled={isKeyboardEnabled}
              onEnabledChange={({ enabled }) => {
                handleDataSourceChange?.({ dataSource: "keyboard", enabled });
                handleKbSwitch({ enabled });
              }}
              onLayoutChange={handleKeyboardLayoutChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
