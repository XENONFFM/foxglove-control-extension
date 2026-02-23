import { PanelExtensionContext } from "@foxglove/extension";
import { renderHook } from "@testing-library/react";

import { useControlPanelEffects, ControlPanelEffectsProps } from "./useControlPanelEffects";

describe("useControlPanelEffects", () => {
  const mockContext = {
    updatePanelSettingsEditor: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
    advertise: jest.fn(),
    unadvertise: jest.fn(),
    publish: jest.fn(),
    saveState: jest.fn(),
  } as unknown as PanelExtensionContext;

  const mockProps: ControlPanelEffectsProps = {
    context: mockContext,
    config: {
      dataSource: "gamepad",
      gamepadId: 0,
      publishJoy: false,
      pubJoyTopic: "/joy",
      publishTwistMode: false,
      pubTwistTopic: "/cmd_vel",
      showButtons: true,
      showAxes: true,
      axisVisualization: "bars",
      showGamepad: true,
      showKeyboard: true,
      showJoystick: true,
      keyboardLayout: "wasd",
      gamepadJoyTransform: "xbox",
      twistMapping: {
        linearX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      },
      options: { availableControllers: [] },
    },
    setConfig: jest.fn(),
    joy: undefined,
    setJoy: jest.fn(),
    pubTopic: undefined,
    setPubTopic: jest.fn(),
    pubTwistTopic: undefined,
    setPubTwistTopic: jest.fn(),
    trackedKeys: new Map(),
    callbacks: {
      handleKeyDown: (): void => {
        return;
      },
      handleKeyUp: jest.fn(),
      interactiveCb: jest.fn(),
      handleKbSwitch: jest.fn(),
      handleGamepadSwitch: jest.fn(),
      handleJoystickSwitch: jest.fn(),
      handleGamepadConnect: jest.fn(),
      handleGamepadDisconnect: jest.fn(),
      handleGamepadUpdate: jest.fn(),
    },
  };

  it("registers panel settings editor", () => {
    renderHook(() => {
      useControlPanelEffects(mockProps);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockContext.updatePanelSettingsEditor).toHaveBeenCalled();
  });
});
