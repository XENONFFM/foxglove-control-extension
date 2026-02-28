import { PanelConfig } from "./types";
import { createDefaultConfig } from "./defaultConfig";
import { createKeyboardMapping } from "../components/Keyboard";

describe("createDefaultConfig", () => {
  it("creates default config with initial state", () => {
    const savedState: Partial<PanelConfig> = {
      publishJoy: true,
    };

    const config = createDefaultConfig(savedState);

    expect(config.publishJoy).toBe(true);
    expect(config.pubJoyTopic).toBe("/joy");
    expect(config.dataSource).toBe("gamepad");
    expect(config.showGamepadRightSide).toBe(true);
    expect(config.showKeyboardRightSide).toBe(true);
    expect(config.showJoystickRightSide).toBe(true);
  });

  it("creates default config without initial state", () => {
    const config = createDefaultConfig();

    expect(config.publishJoy).toBe(false);
    expect(config.pubJoyTopic).toBe("/joy");
    expect(config.dataSource).toBe("gamepad");
    expect(config.showGamepadRightSide).toBe(true);
    expect(config.showKeyboardRightSide).toBe(true);
    expect(config.showJoystickRightSide).toBe(true);
  });
});

describe("createKeyboardMapping", () => {
  it("creates keyboard mapping with correct structure", () => {
    const mapping = createKeyboardMapping();

    expect(mapping.get("w")).toEqual({
      axis: 1,
      direction: 1,
      button: -1,
      value: 0,
    });

    expect(mapping.get("a")).toEqual({
      axis: 0,
      direction: 1,
      button: -1,
      value: 0,
    });

    expect(mapping.get(" ")).toEqual({
      button: 6,
      axis: -1,
      direction: 0,
      value: 0,
    });
  });
});
