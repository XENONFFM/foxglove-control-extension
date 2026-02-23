import { SettingsTreeAction, PanelExtensionContext } from "@foxglove/extension";
import { useState, useCallback } from "react";

import { PanelConfig, createDefaultConfig, createKeyboardMapping } from "@/config";
import { settingsActionReducer } from "@/config/panelSettings";
import { Joy, KbMap } from "@/types";

export interface UseControlPanelStateResult {
  joy: Joy | undefined;
  setJoy: React.Dispatch<React.SetStateAction<Joy | undefined>>;
  pubTopic: string | undefined;
  setPubTopic: React.Dispatch<React.SetStateAction<string | undefined>>;
  pubTwistTopic: string | undefined;
  setPubTwistTopic: React.Dispatch<React.SetStateAction<string | undefined>>;
  trackedKeys: Map<string, KbMap> | undefined;
  setTrackedKeys: React.Dispatch<React.SetStateAction<Map<string, KbMap> | undefined>>;
  renderDone: (() => void) | undefined;
  setRenderDone: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  config: PanelConfig;
  setConfig: React.Dispatch<React.SetStateAction<PanelConfig>>;
  settingsActionHandler: (action: SettingsTreeAction) => void;
}

export function useControlPanelState(context?: PanelExtensionContext): UseControlPanelStateResult {
  const [joy, setJoy] = useState<Joy | undefined>();
  const [pubTopic, setPubTopic] = useState<string | undefined>();
  const [pubTwistTopic, setPubTwistTopic] = useState<string | undefined>();
  const [trackedKeys, setTrackedKeys] = useState<Map<string, KbMap> | undefined>(() =>
    createKeyboardMapping(),
  );
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [config, setConfig] = useState<PanelConfig>(() => createDefaultConfig(context));

  const settingsActionHandler = useCallback(
    (action: SettingsTreeAction) => {
      setConfig((prevConfig) => settingsActionReducer(prevConfig, action));
    },
    [setConfig],
  );

  return {
    joy,
    setJoy,
    pubTopic,
    setPubTopic,
    pubTwistTopic,
    setPubTwistTopic,
    trackedKeys,
    setTrackedKeys,
    renderDone,
    setRenderDone,
    config,
    setConfig,
    settingsActionHandler,
  };
}
