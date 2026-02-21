import { useEffect, useState } from "react";

import { type KeyState } from "./KeyboardControl";

export default function useKeyboard(): KeyState {
  const [keyState, setKeyState] = useState<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowLeft: false,
    arrowDown: false,
    arrowRight: false,
  });

  useEffect(() => {
    const getArrowKey = (key: string): keyof KeyState | null => {
      switch (key) {
        case "ArrowUp":
          return "arrowUp";
        case "ArrowLeft":
          return "arrowLeft";
        case "ArrowDown":
          return "arrowDown";
        case "ArrowRight":
          return "arrowRight";
        default:
          return null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const arrowKey = getArrowKey(e.key);

      if (["w", "a", "s", "d"].includes(key)) {
        setKeyState((prev) => ({ ...prev, [key]: true }));
      } else if (arrowKey) {
        setKeyState((prev) => ({ ...prev, [arrowKey]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const arrowKey = getArrowKey(e.key);

      if (["w", "a", "s", "d"].includes(key)) {
        setKeyState((prev) => ({ ...prev, [key]: false }));
      } else if (arrowKey) {
        setKeyState((prev) => ({ ...prev, [arrowKey]: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keyState;
}
