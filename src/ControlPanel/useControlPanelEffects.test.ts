import { PanelExtensionContext } from "@foxglove/extension";
import { renderHook } from "@testing-library/react";

import { useControlPanelEffects, ControlPanelEffectsProps } from "./useControlPanelEffects";

import { createDefaultConfig } from "@/config";

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
      ...createDefaultConfig(),
      dataSource: "gamepad",
    },
    setConfig: jest.fn(),
    joy: undefined,
    setJoy: jest.fn(),
    availableControllers: [],
  };

  it("registers panel settings editor", () => {
    renderHook(() => {
      useControlPanelEffects(mockProps);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockContext.updatePanelSettingsEditor).toHaveBeenCalled();
  });
});
