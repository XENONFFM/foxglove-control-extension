import { SettingsTreeAction, SettingsTreeNodes } from "@foxglove/extension";
import { produce } from "immer";
import * as _ from "lodash";

/**
 * Recursively collects all node keys from a SettingsTreeNodes structure.
 * The resulting set is used by makeSettingsReducer to strip tree-path prefix
 * segments from action paths, recovering the flat config key.
 */
export function collectNodeKeys(nodes: SettingsTreeNodes): Set<string> {
  const keys = new Set<string>();

  function visit(nodeMap: SettingsTreeNodes) {
    for (const [key, node] of Object.entries(nodeMap)) {
      keys.add(key);
      if (node?.children) {
        visit(node.children as SettingsTreeNodes);
      }
    }
  }

  visit(nodes);
  return keys;
}

/**
 * Generic settings-action reducer factory.
 *
 * @param nodeKeys - Set of tree node keys to strip from action paths.
 *   Generate this with collectNodeKeys(buildSettingsTree(createDefaultConfig())).
 * @param numberFieldSuffixes - Field-name suffixes whose string values should
 *   be coerced to Number before being written into the config.
 *
 * @returns A reducer `(prev: T, action: SettingsTreeAction) => T` suitable for
 *   use with context.updatePanelSettingsEditor.
 *
 * @example
 * // In your panelSettings.ts:
 * const nodeKeys = collectNodeKeys(buildSettingsTree(createDefaultConfig()));
 * export const settingsActionReducer = makeSettingsReducer<MyConfig>(
 *   nodeKeys,
 *   new Set(["someId", "someIndex"]),
 * );
 */
export function makeSettingsReducer<T extends object>(
  nodeKeys: ReadonlySet<string>,
  numberFieldSuffixes: ReadonlySet<string> = new Set(),
): (prev: T, action: SettingsTreeAction) => T {
  return (prev: T, action: SettingsTreeAction): T =>
    produce(prev, (draft) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        const rawPath = path.slice(1).join(".");
        const segments = rawPath.split(".").filter(Boolean);

        while (segments.length > 0 && nodeKeys.has(segments[0]!)) {
          segments.shift();
        }

        const pathString = segments.join(".") || rawPath;
        const fieldSuffix = pathString.split(".").pop() ?? "";
        const normalized =
          typeof value === "string" && numberFieldSuffixes.has(fieldSuffix)
            ? Number(value)
            : value;

        _.set(draft as object, pathString, normalized);
      }
    }) as T;
}
