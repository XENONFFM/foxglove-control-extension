import { settingsActionReducer, buildSettingsTree } from "./panelSettings";
import { PanelConfig } from "./types";
import { createDefaultConfig } from "./defaultConfig";

describe("settingsActionReducer", () => {
  it("updates config with new values", () => {
    const initialConfig: PanelConfig = {
      ...createDefaultConfig(),
      dataSource: "gamepad",
      gamepadJoyTransform: "xbox",
      twistMapping: {
        linearX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      },
    };

    const newConfig = settingsActionReducer(initialConfig, {
      action: "update",
      payload: { path: ["dataSource"], value: "gamepad", input: "autocomplete" },
    });

    expect(newConfig.dataSource).toBe("gamepad");
  });
});

describe("buildSettingsTree", () => {
  it("builds settings tree with correct structure", () => {
    const config: PanelConfig = {
      ...createDefaultConfig(),
      dataSource: "gamepad",
      twistMapping: {
        linearX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      },
    };

    const tree = buildSettingsTree(config);

    expect(tree.visiblePanels).toBeDefined();
    expect(tree.input).toBeDefined();
    expect(tree.output).toBeDefined();
    expect(tree.visiblePanels?.children?.gamepad).toBeDefined();
    expect(tree.visiblePanels?.children?.keyboard).toBeDefined();
    expect(tree.visiblePanels?.children?.joystick).toBeDefined();
    expect(tree.input?.children?.gamepad).toBeDefined();
    expect(tree.input?.children?.keyboard).toBeDefined();
    expect(tree.input?.children?.joystick).toBeDefined();
    expect(tree.output?.children?.twistMapping).toBeDefined();

    expect(tree.visiblePanels?.children?.gamepad?.fields?.showButtons?.value).toBe(true);
    expect(tree.visiblePanels?.children?.gamepad?.fields?.showAxes?.value).toBe(true);
    expect(tree.visiblePanels?.children?.gamepad?.fields?.axisVisualization?.value).toBe("bars");
    expect(tree.visiblePanels?.children?.gamepad?.fields?.showGamepadRightSide?.value).toBe(true);
    expect(tree.visiblePanels?.children?.keyboard?.fields?.showKeyboardRightSide?.value).toBe(true);
    expect(tree.visiblePanels?.children?.joystick?.fields?.showJoystickRightSide?.value).toBe(true);

    expect(tree.input?.fields?.dataSource?.value).toBe("gamepad");
    expect(tree.output?.fields?.publishJoy?.value).toBe(false);
    expect(tree.output?.fields?.publishTwistMode?.value).toBe(false);
  });
});
