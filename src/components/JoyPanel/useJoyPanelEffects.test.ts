import { PanelExtensionContext } from "@foxglove/extension";
import { renderHook } from "@testing-library/react";

import { useJoyPanelEffects, JoyPanelEffectsProps } from "./useJoyPanelEffects";

describe("useJoyPanelEffects", () => {
  const mockContext = {
    updatePanelSettingsEditor: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
    advertise: jest.fn(),
    unadvertise: jest.fn(),
    publish: jest.fn(),
    saveState: jest.fn(),
  } as unknown as PanelExtensionContext;

  const mockProps: JoyPanelEffectsProps = {
    context: mockContext,
    config: {
      dataSource: "sub-joy-topic",
      subJoyTopic: "/joy",
      gamepadId: 0,
      publishMode: false,
      pubJoyTopic: "/joy",
      publishTwistMode: false,
      pubTwistTopic: "/cmd_vel",
      publishFrameId: "",
      displayMode: "auto",
      debugGamepad: false,
      layoutName: "steamdeck",
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
    kbEnabled: true,
    trackedKeys: new Map(),
    messages: [],
    callbacks: {
      handleKeyDown: (): void => {
        return;
      },
      handleKeyUp: jest.fn(),
      interactiveCb: jest.fn(),
      handleKbSwitch: jest.fn(),
      handleGamepadConnect: jest.fn(),
      handleGamepadDisconnect: jest.fn(),
      handleGamepadUpdate: jest.fn(),
    },
  };

  it("subscribes to joy topic when data source is sub-joy-topic", () => {
    renderHook(() => {
      useJoyPanelEffects(mockProps);
    });
  });

  it("unsubscribes when data source changes", () => {
    const { rerender } = renderHook(
      (props: JoyPanelEffectsProps) => {
        useJoyPanelEffects(props);
      },
      {
        initialProps: mockProps,
      },
    );

    rerender({
      ...mockProps,
      config: { ...mockProps.config, dataSource: "gamepad" },
    });
  });
});
