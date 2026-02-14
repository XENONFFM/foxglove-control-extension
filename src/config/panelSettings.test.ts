import { settingsActionReducer, buildSettingsTree } from "./panelSettings";
import { PanelConfig } from "./types";

describe("settingsActionReducer", () => {
  it("updates config with new values", () => {
    const initialConfig: PanelConfig = {
      dataSource: "gamepad",
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
      gamepadJoyTransform: "default",
      twistMapping: {
        linearX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
        angularZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      },
      options: { availableControllers: [] },
    };

    const tree = buildSettingsTree(config);

    expect(tree.dataSource).toBeDefined();
    expect(tree.publish).toBeDefined();
    expect(tree.display).toBeDefined();
    expect(tree.twistMapping).toBeDefined();

    expect(tree.dataSource?.fields?.dataSource?.value).toBe("sub-joy-topic");
    expect(tree.publish?.fields?.publishMode?.value).toBe(false);
    expect(tree.publish?.fields?.publishTwistMode?.value).toBe(false);
    expect(tree.display?.fields?.displayMode?.value).toBe("auto");
  });
});
