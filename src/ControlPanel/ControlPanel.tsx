import { PanelExtensionContext } from "@foxglove/extension";
import { useCallback, useEffect, useLayoutEffect } from "react";
import type * as React from "react";

import { ControlPanelView } from "./ControlPanelView";
import { useControlPanelEffects } from "./useControlPanelEffects";
import { useControlPanelState } from "./useControlPanelState";
import { useGamepadCallbacks } from "./useGamepadCallbacks";

import { PanelConfig } from "@/config";
import { useGamepad } from "@/hooks/useGamepad";

export function ControlPanel({
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

  useControlPanelEffects({ context, config, setConfig, joy, setJoy, availableControllers });

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <ControlPanelView
      config={config}
      onConfigChange={patchConfig}
      onInteractiveJoy={interactiveCb}
    />
  );
}
