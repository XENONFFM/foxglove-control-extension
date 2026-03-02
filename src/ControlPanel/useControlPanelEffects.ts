import { PanelExtensionContext, SettingsTreeAction } from "@foxglove/extension";
import { useCallback, useEffect, useRef, useState } from "react";

import { useControlPanelState } from "./useControlPanelState";
import { buildSettingsTree, settingsActionReducer } from "@/config/panelSettings";
import { createKeyboardMapping } from "@/components/Keyboard";
import { Joy, KbMap } from "@/types";
import { joyToTwist } from "@/utils/twistMapping";

export type ControlPanelEffectsProps = {
  context: PanelExtensionContext;
  config: ReturnType<typeof useControlPanelState>["config"];
  setConfig: ReturnType<typeof useControlPanelState>["setConfig"];
  joy: Joy | undefined;
  setJoy: (joy: Joy | undefined) => void;
  availableControllers: Gamepad[];
};

export function useControlPanelEffects({
  context,
  config,
  setConfig,
  joy,
  setJoy,
  availableControllers,
}: ControlPanelEffectsProps): void {
  // Keyboard state — private to this hook, not needed by any other consumer
  const [trackedKeys, setTrackedKeys] = useState<Map<string, KbMap> | undefined>(() =>
    createKeyboardMapping(),
  );

  // Advertised topic refs — bookkeeping only, mutations don't need re-renders
  const pubTopicRef = useRef<string | undefined>(undefined);
  const pubTwistTopicRef = useRef<string | undefined>(undefined);

  // Keyboard callbacks — private, consumed only by the event listeners below
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setTrackedKeys((prev) => {
      if (!prev?.has(event.key)) return prev;
      const next = new Map(prev);
      const k = next.get(event.key);
      if (k != undefined) k.value = 1;
      return next;
    });
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setTrackedKeys((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      const k = next.get(event.key);
      if (k) k.value = 0;
      return next;
    });
  }, []);

  // Reset Joy when input source changes
  useEffect(() => {
    setJoy(undefined);
  }, [config.dataSource, setJoy]);

  // Register the settings tree
  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler: (action: SettingsTreeAction) => {
        setConfig((prevConfig) => settingsActionReducer(prevConfig, action));
      },
      nodes: buildSettingsTree(config, availableControllers),
    });
  }, [context, config, setConfig, availableControllers]);

  // Keyboard event listeners
  useEffect(() => {
    if (config.dataSource === "keyboard") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }
    return undefined;
  }, [config.dataSource, handleKeyDown, handleKeyUp]);

  // Generate Joy from keyboard keystrokes
  useEffect(() => {
    if (config.dataSource !== "keyboard") return;

    const axes: number[] = [];
    const buttons: number[] = [];

    trackedKeys?.forEach((value) => {
      if (value.button >= 0) {
        while (buttons.length <= value.button) buttons.push(0);
        buttons[value.button] = value.value;
      } else if (value.axis >= 0) {
        while (axes.length <= value.axis) axes.push(0);
        if (axes[value.axis] != undefined) {
          axes[value.axis]! += (value.direction > 0 ? 1 : -1) * value.value; // NOSONAR
        }
      }
    });

    setJoy({ header: { frame_id: "", stamp: { sec: 0, nsec: 0 } }, axes, buttons });
  }, [config.dataSource, trackedKeys, setJoy]);

  // Advertise / unadvertise Joy topic
  useEffect(() => {
    if (config.publishJoy) {
      pubTopicRef.current = config.pubJoyTopic;
      context.advertise?.(config.pubJoyTopic, "sensor_msgs/msg/Joy");
    } else if (pubTopicRef.current) {
      context.unadvertise?.(pubTopicRef.current);
      pubTopicRef.current = undefined;
    }
  }, [config.pubJoyTopic, config.publishJoy, context]);

  // Advertise / unadvertise Twist topic
  useEffect(() => {
    if (config.publishTwistMode) {
      pubTwistTopicRef.current = config.pubTwistTopic;
      context.advertise?.(config.pubTwistTopic, "geometry_msgs/msg/Twist");
    } else if (pubTwistTopicRef.current) {
      context.unadvertise?.(pubTwistTopicRef.current);
      pubTwistTopicRef.current = undefined;
    }
  }, [config.pubTwistTopic, config.publishTwistMode, context]);

  // Publish Joy
  useEffect(() => {
    if (config.publishJoy && pubTopicRef.current && joy) {
      context.publish?.(pubTopicRef.current, joy);
    }
  }, [context, config.pubJoyTopic, config.publishJoy, joy]);

  // Publish Twist
  useEffect(() => {
    if (config.publishTwistMode && pubTwistTopicRef.current && joy) {
      const activeTwistMapping =
        config.dataSource === "gamepad"
          ? config.twistMappingGamepad
          : config.dataSource === "keyboard"
            ? config.twistMappingKeyboard
            : config.twistMappingJoystick;
      context.publish?.(pubTwistTopicRef.current, joyToTwist(joy, activeTwistMapping));
    }
  }, [
    context,
    config.dataSource,
    config.pubTwistTopic,
    config.publishTwistMode,
    config.twistMappingGamepad,
    config.twistMappingKeyboard,
    config.twistMappingJoystick,
    joy,
  ]);

  // Persist config
  useEffect(() => {
    context.saveState(config);
  }, [context, config]);
}
