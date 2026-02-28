import { PanelExtensionContext } from "@foxglove/extension";
import { useState } from "react";

import { PanelConfig, createDefaultConfig } from "@/config";
import { Joy } from "@/types";

export interface UseControlPanelStateResult {
  joy: Joy | undefined;
  setJoy: React.Dispatch<React.SetStateAction<Joy | undefined>>;
  renderDone: (() => void) | undefined;
  setRenderDone: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  config: PanelConfig;
  setConfig: React.Dispatch<React.SetStateAction<PanelConfig>>;
  availableControllers: Gamepad[];
  setAvailableControllers: React.Dispatch<React.SetStateAction<Gamepad[]>>;
}

export function useControlPanelState(context?: PanelExtensionContext): UseControlPanelStateResult {
  const [joy, setJoy] = useState<Joy | undefined>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [config, setConfig] = useState<PanelConfig>(() =>
    createDefaultConfig(context?.initialState as Partial<PanelConfig> | undefined),
  );
  const [availableControllers, setAvailableControllers] = useState<Gamepad[]>([]);

  return {
    joy,
    setJoy,
    renderDone,
    setRenderDone,
    config,
    setConfig,
    availableControllers,
    setAvailableControllers,
  };
}
