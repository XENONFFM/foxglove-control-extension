import { renderHook, act } from "@testing-library/react";

import { useControlPanelCallbacks } from "./controlPanelCallbacks";
import { PanelConfig, createDefaultConfig } from "@/config";

describe("useControlPanelCallbacks", () => {
  const mockSetConfig = jest.fn();
  const mockSetJoy = jest.fn();
  const mockSetTrackedKeys = jest.fn();
  const mockSetKbEnabled = jest.fn();

  const mockConfig: PanelConfig = {
    ...createDefaultConfig(),
    dataSource: "gamepad",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles key down", () => {
    const { result } = renderHook(() =>
      useControlPanelCallbacks(
        mockConfig,
        mockSetConfig,
        mockSetJoy,
        mockSetTrackedKeys,
        mockSetKbEnabled,
      ),
    );

    act(() => {
      result.current.handleKeyDown({ key: "a" } as KeyboardEvent);
    });

    expect(mockSetTrackedKeys).toHaveBeenCalled();
  });

  it("handles gamepad connect", () => {
    const { result } = renderHook(() =>
      useControlPanelCallbacks(
        mockConfig,
        mockSetConfig,
        mockSetJoy,
        mockSetTrackedKeys,
        mockSetKbEnabled,
      ),
    );

    const mockGamepad = { id: "test_gamepad", index: 0 } as Gamepad;

    act(() => {
      result.current.handleGamepadConnect(mockGamepad);
    });

    expect(mockSetConfig).toHaveBeenCalled();
  });
});
