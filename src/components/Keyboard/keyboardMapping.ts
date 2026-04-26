import { kbmapping1 } from "@/mappings";
import { KbMap } from "@/types";

/**
 * Builds the initial keyboard state map from the raw JSON mapping.
 * Each entry tracks the current value (0 = released) for a key.
 */
export function createKeyboardMapping(): Map<string, KbMap> {
  const keyMap = new Map<string, KbMap>();

  for (const [key, value] of Object.entries(kbmapping1)) {
    const k: KbMap = {
      button: value.button,
      axis: value.axis,
      direction: value.direction === "+" ? 1 : 0,
      value: 0,
    };
    keyMap.set(key, k);
  }
  return keyMap;
}
