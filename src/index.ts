import { ExtensionContext } from "@foxglove/extension";

import { initGamepadTesterPanel } from "./components/GamepadTester/initGamepadTesterPanel";
import { initJoyPanel } from "./components/JoyPanel";
import "./styles/globals.css";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "ASLZ Joystick", initPanel: initJoyPanel });
  extensionContext.registerPanel({
    name: "ASLZ Gamepad",
    initPanel: initGamepadTesterPanel,
  });
}
