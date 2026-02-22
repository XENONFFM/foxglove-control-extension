import { PanelExtensionContext } from "@foxglove/extension";

export type MockSettingsEditor = NonNullable<
  Parameters<PanelExtensionContext["updatePanelSettingsEditor"]>[0]
>;

export type MockPanelContext = PanelExtensionContext & {
  getSettingsEditor: () => MockSettingsEditor | undefined;
  subscribeSettingsEditor: (cb: (editor: MockSettingsEditor | undefined) => void) => () => void;
};

export function createMockPanelContext(
  overrides: Partial<PanelExtensionContext> = {},
): MockPanelContext {
  let onRender: PanelExtensionContext["onRender"] | undefined;
  let settingsEditor: MockSettingsEditor | undefined;
  const settingsEditorSubscribers = new Set<(editor: MockSettingsEditor | undefined) => void>();

  const notifySettingsEditorSubscribers = (): void => {
    settingsEditorSubscribers.forEach((subscriber) => {
      subscriber(settingsEditor);
    });
  };

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
    updatePanelSettingsEditor: (editor) => {
      settingsEditor = editor;
      notifySettingsEditorSubscribers();
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

  const mergedContext = {
    ...context,
    ...overrides,
  } as PanelExtensionContext;

  const mockContext: MockPanelContext = Object.assign(mergedContext, {
    getSettingsEditor: () => settingsEditor,
    subscribeSettingsEditor: (cb: (editor: MockSettingsEditor | undefined) => void) => {
      settingsEditorSubscribers.add(cb);
      cb(settingsEditor);
      return () => {
        settingsEditorSubscribers.delete(cb);
      };
    },
  });

  return mockContext;
}
