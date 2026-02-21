import { PanelExtensionContext } from "@foxglove/extension";
import { useEffect, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";

import { ControlPanelView } from "./ControlPanelView";
import { useControlPanelCallbacks } from "./controlPanelCallbacks";
import { useControlPanelEffects } from "./useControlPanelEffects";
import { useControlPanelState } from "./useControlPanelState";
import { AxisVisualizationMode, JoystickAxisMode } from "../../config/types";
import { useGamepad } from "../../hooks/useGamepad";
import { GamepadJoyTransformKey } from "../../mappings/gamepadJoyTransforms";

export function ControlPanel({
  context,
}: {
  readonly context: PanelExtensionContext;
}): JSX.Element {
  const {
    config,
    setConfig,
    joy,
    setJoy,
    pubTopic,
    setPubTopic,
    pubTwistTopic,
    setPubTwistTopic,
    kbEnabled,
    setKbEnabled,
    trackedKeys,
    setTrackedKeys,
    renderDone,
    setRenderDone,
  } = useControlPanelState(context);

  const callbacks: ReturnType<typeof useControlPanelCallbacks> = useControlPanelCallbacks(
    config,
    setConfig,
    setJoy,
    setTrackedKeys,
    setKbEnabled,
  );

  const handleAxisVisualizationChange = (mode: AxisVisualizationMode) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      axisVisualization: mode,
    }));
  };

  const handleGamepadIdChange = (gamepadId: number) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      gamepadId,
    }));
  };

  const handleGamepadJoyTransformChange = (gamepadJoyTransform: GamepadJoyTransformKey) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      gamepadJoyTransform,
    }));
  };

  const handleShowButtonsChange = ({ showButtons }: { showButtons: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showButtons,
    }));
  };

  const handleShowAxesChange = ({ showAxes }: { showAxes: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showAxes,
    }));
  };

  const handleShowGamepadRightSideChange = ({ showRightSide }: { showRightSide: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showGamepadRightSide: showRightSide,
    }));
  };

  const handleShowKeyboardRightSideChange = ({ showRightSide }: { showRightSide: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showKeyboardRightSide: showRightSide,
    }));
  };

  const handleKeyboardLayoutChange = (keyboardLayout: "wasd" | "arrows") => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      keyboardLayout,
    }));
  };

  const handleJoystickAxisChange = (joystickAxis: JoystickAxisMode) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      joystickAxis,
    }));
  };

  const handleJoystickStickyChange = ({ sticky }: { sticky: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      joystickSticky: sticky,
    }));
  };

  const handleShowJoystickRightSideChange = ({ showRightSide }: { showRightSide: boolean }) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showJoystickRightSide: showRightSide,
    }));
  };

  const handleDataSourceChange = ({
    dataSource,
    enabled,
  }: {
    dataSource: string;
    enabled: boolean;
  }) => {
    if (!enabled) {
      return;
    }

    setConfig((prevConfig) => ({
      ...prevConfig,
      dataSource,
    }));
  };

  // Setup render handling
  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => {
      setRenderDone(() => done);
    };
  }, [context, setRenderDone]);

  // Use gamepad hook
  useGamepad({
    didConnect: callbacks.handleGamepadConnect,
    didDisconnect: callbacks.handleGamepadDisconnect,
    didUpdate: callbacks.handleGamepadUpdate,
  });

  // Apply all other effects
  useControlPanelEffects({
    context,
    config,
    setConfig,
    joy,
    setJoy,
    pubTopic,
    setPubTopic,
    pubTwistTopic,
    setPubTwistTopic,
    kbEnabled,
    trackedKeys,
    callbacks,
  });

  // Invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <ControlPanelView
      config={config}
      kbEnabled={kbEnabled}
      handleKbSwitch={callbacks.handleKbSwitch}
      handleInteractiveJoy={callbacks.interactiveCb}
      handleGamepadIdChange={handleGamepadIdChange}
      handleGamepadJoyTransformChange={handleGamepadJoyTransformChange}
      handleShowButtonsChange={handleShowButtonsChange}
      handleShowAxesChange={handleShowAxesChange}
      handleAxisVisualizationChange={handleAxisVisualizationChange}
      handleShowGamepadRightSideChange={handleShowGamepadRightSideChange}
      handleShowKeyboardRightSideChange={handleShowKeyboardRightSideChange}
      handleKeyboardLayoutChange={handleKeyboardLayoutChange}
      handleJoystickAxisChange={handleJoystickAxisChange}
      handleJoystickStickyChange={handleJoystickStickyChange}
      handleShowJoystickRightSideChange={handleShowJoystickRightSideChange}
      handleDataSourceChange={handleDataSourceChange}
    />
  );
}

export function initControlPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);

  root.render(
    <div className="h-full w-full bg-background">
      <ControlPanel context={context} />
    </div>,
  );

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
