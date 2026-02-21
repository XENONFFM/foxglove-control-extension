import { PanelExtensionContext } from "@foxglove/extension";

export function createMockPanelContext(
  overrides: Partial<PanelExtensionContext> = {},
): PanelExtensionContext {
  let onRender: PanelExtensionContext["onRender"] | undefined;

  const context: Partial<PanelExtensionContext> = {
    initialState: {
      dataSource: "gamepad",
      publishJoy: false,
      pubJoyTopic: "/joy",
      subJoyTopic: "/joy",
      showHeader: true,
      showInfo: true,
      showButtons: true,
      showAxes: true,
      showGamepad: true,
      showKeyboard: true,
      showJoystick: true,
      keyboardLayout: "wasd",

    },
    updatePanelSettingsEditor: () => {
      return;
    },
    watch: () => {
      return;
    },
    subscribe: () => {
      return;
    },
    unsubscribeAll: () => {
      return;
    },
    advertise: () => {
      return;
    },
    unadvertise: () => {
      return;
    },
    publish: () => {
      return;
    },
    saveState: () => {
      return;
    },
  };

  Object.defineProperty(context, "onRender", {
    get: () => onRender,
    set: (value: PanelExtensionContext["onRender"]) => {
      onRender = value;
    },
    enumerable: true,
  });

  return { ...context, ...overrides } as PanelExtensionContext;
}
