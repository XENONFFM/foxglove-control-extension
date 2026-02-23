import { renderHook, act } from "@testing-library/react";

import { useControlPanelCallbacks } from "./controlPanelCallbacks";
import { PanelConfig, createDefaultConfig } from "@/config";

describe("useControlPanelCallbacks", () => {
  const mockSetConfig = jest.fn();
  const mockSetJoy = jest.fn();
  const mockSetTrackedKeys = jest.fn();

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
      ),
    );

    const mockGamepad = { id: "test_gamepad", index: 0 } as Gamepad;

    act(() => {
      result.current.handleGamepadConnect(mockGamepad);
    });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it("ignores gamepad updates when data source is not gamepad", () => {
    const nonGamepadConfig: PanelConfig = {
      ...mockConfig,
      dataSource: "keyboard",
    };

    const { result } = renderHook(() =>
      useControlPanelCallbacks(
        nonGamepadConfig,
        mockSetConfig,
        mockSetJoy,
        mockSetTrackedKeys,
      ),
    );

    const mockGamepad = { index: 0, axes: [0.5], buttons: [{ value: 1 }] } as unknown as Gamepad;

    act(() => {
      result.current.handleGamepadUpdate(mockGamepad);
    });

    expect(mockSetJoy).not.toHaveBeenCalled();
  });

  it("ignores joystick interactive updates when data source is not joystick", () => {
    const joystickConfig: PanelConfig = {
      ...mockConfig,
      dataSource: "keyboard",
    };

    const { result } = renderHook(() =>
      useControlPanelCallbacks(
        joystickConfig,
        mockSetConfig,
        mockSetJoy,
        mockSetTrackedKeys,
      ),
    );

    act(() => {
      result.current.interactiveCb({
        header: { stamp: { sec: 0, nsec: 0 }, frame_id: "" },
        axes: [0.25, -0.25],
        buttons: [],
      });
    });

    expect(mockSetJoy).not.toHaveBeenCalled();
  });
});
