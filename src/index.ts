import { ExtensionContext } from "@foxglove/extension";

import { initGamepadTesterPanel } from "./components/GamepadTester/initGamepadTesterPanel";
import { initJoyPanel } from "./components/JoyPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Joystick", initPanel: initJoyPanel });
  extensionContext.registerPanel({
    name: "Gamepad Tester",
    initPanel: initGamepadTesterPanel,
  });
}
