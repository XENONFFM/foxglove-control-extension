import { PanelExtensionContext } from "@foxglove/extension";
import { useCallback, useEffect, useLayoutEffect } from "react";
import type * as React from "react";

import { ControlPanelLiteView } from "./ControlPanelLiteView";
import { useControlPanelEffects } from "@/ControlPanel/useControlPanelEffects";
import { useControlPanelState } from "@/ControlPanel/useControlPanelState";
import { useGamepadCallbacks } from "@/ControlPanel/useGamepadCallbacks";
import { PanelConfig } from "@/config";
import { buildSettingsTreeLite } from "@/config/panelSettings";
import { useGamepad } from "@/hooks/useGamepad";

export function ControlPanelLite({
  context,
}: {
  readonly context: PanelExtensionContext;
}): React.ReactElement {
  const {
    config,
    setConfig,
    joy,
    setJoy,
    renderDone,
    setRenderDone,
    availableControllers,
    setAvailableControllers,
  } = useControlPanelState(context);

  const patchConfig = useCallback(
    (patch: Partial<PanelConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
    },
    [setConfig],
  );

  const { interactiveCb, handleGamepadConnect, handleGamepadDisconnect, handleGamepadUpdate } =
    useGamepadCallbacks(config, setJoy, setAvailableControllers);

  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => {
      setRenderDone(() => done);
    };
  }, [context, setRenderDone]);

  useGamepad({
    didConnect: handleGamepadConnect,
    didDisconnect: handleGamepadDisconnect,
    didUpdate: handleGamepadUpdate,
  });

  useControlPanelEffects({
    context,
    config,
    setConfig,
    joy,
    setJoy,
    availableControllers,
    buildSettingsTreeFn: buildSettingsTreeLite,
  });

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return <ControlPanelLiteView config={config} onConfigChange={patchConfig} onInteractiveJoy={interactiveCb} />;
}
