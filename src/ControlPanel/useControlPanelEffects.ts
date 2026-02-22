import { PanelExtensionContext, SettingsTreeAction } from "@foxglove/extension";
import { useEffect } from "react";

import { useControlPanelCallbacks } from "./controlPanelCallbacks";
import { useControlPanelState } from "./useControlPanelState";
import { buildSettingsTree, settingsActionReducer } from "@/config/panelSettings";
import { Joy, KbMap } from "@/types";
import { joyToTwist } from "@/utils/twistMapping";

export type ControlPanelEffectsProps = {
  context: PanelExtensionContext;
  config: ReturnType<typeof useControlPanelState>["config"];
  setConfig: ReturnType<typeof useControlPanelState>["setConfig"];
  joy: Joy | undefined;
  setJoy: (joy: Joy | undefined) => void;
  pubTopic: string | undefined;
  setPubTopic: (topic: string | undefined) => void;
  pubTwistTopic: string | undefined;
  setPubTwistTopic: (topic: string | undefined) => void;
  kbEnabled: boolean;
  trackedKeys: Map<string, KbMap> | undefined;
  callbacks: ReturnType<typeof useControlPanelCallbacks>;
};

export function useControlPanelEffects({
  context,
  config,
  setConfig,
  joy,
  setJoy,
  pubTopic,
  setPubTopic,
  pubTwistTopic,
  setPubTwistTopic,
  kbEnabled,
  trackedKeys,
  callbacks,
}: ControlPanelEffectsProps): void {
  // Register the settings tree
  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler: (action: SettingsTreeAction) => {
        setConfig((prevConfig) => settingsActionReducer(prevConfig, action));
      },
      nodes: buildSettingsTree(config),
    });
  }, [context, config, setConfig]);

  // Keyboard event listeners
  useEffect(() => {
    if (config.dataSource === "keyboard" && kbEnabled) {
      document.addEventListener("keydown", callbacks.handleKeyDown);
      document.addEventListener("keyup", callbacks.handleKeyUp);
      return () => {
        document.removeEventListener("keydown", callbacks.handleKeyDown);
        document.removeEventListener("keyup", callbacks.handleKeyUp);
      };
    }
    return undefined;
  }, [config.dataSource, kbEnabled, callbacks.handleKeyDown, callbacks.handleKeyUp]);

  // Generate Joy from Keyboard keystrokes Keys
  useEffect(() => {
    if (config.dataSource !== "keyboard" || !kbEnabled) {
      return;
    }

    const axes: number[] = [];
    const buttons: number[] = [];

    trackedKeys?.forEach((value) => {
      if (value.button >= 0) {
        while (buttons.length <= value.button) {
          buttons.push(0);
        }
        buttons[value.button] = value.value;
      } else if (value.axis >= 0) {
        while (axes.length <= value.axis) {
          axes.push(0);
        }
        if (axes[value.axis] != undefined) {
          axes[value.axis]! += (value.direction > 0 ? 1 : -1) * value.value; // NOSONAR
        }
      }
    });

    setJoy({
      header: {
        frame_id: "",
        stamp: { sec: 0, nsec: 0 }, // You might want to use a proper timestamp here
      },
      axes,
      buttons,
    });
  }, [config.dataSource, kbEnabled, trackedKeys, setJoy]);

  // Advertise the topic to publish
  useEffect(() => {
    if (config.publishJoy) {
      setPubTopic(config.pubJoyTopic);
      context.advertise?.(config.pubJoyTopic, "sensor_msgs/msg/Joy");
    } else if (pubTopic) {
      context.unadvertise?.(pubTopic);
      setPubTopic(undefined);
    }
  }, [config.pubJoyTopic, config.publishJoy, context, pubTopic, setPubTopic]);

  // Advertise the twist topic to publish
  useEffect(() => {
    if (config.publishTwistMode) {
      setPubTwistTopic(config.pubTwistTopic);
      context.advertise?.(config.pubTwistTopic, "geometry_msgs/msg/Twist");
    } else if (pubTwistTopic) {
      context.unadvertise?.(pubTwistTopic);
      setPubTwistTopic(undefined);
    }
  }, [config.pubTwistTopic, config.publishTwistMode, context, pubTwistTopic, setPubTwistTopic]);

  // Publish the joy message
  useEffect(() => {
    if (config.publishJoy && pubTopic && pubTopic === config.pubJoyTopic && joy) {
      context.publish?.(pubTopic, joy);
    }
  }, [context, config.pubJoyTopic, config.publishJoy, joy, pubTopic]);

  // Publish the twist message
  useEffect(() => {
    if (config.publishTwistMode && pubTwistTopic && pubTwistTopic === config.pubTwistTopic && joy) {
      const twist = joyToTwist(joy, config.twistMapping);
      context.publish?.(pubTwistTopic, twist);
    }
  }, [
    context,
    config.pubTwistTopic,
    config.publishTwistMode,
    joy,
    pubTwistTopic,
    config.twistMapping,
  ]);

  // Save state
  useEffect(() => {
    context.saveState(config);
  }, [context, config]);
}
