import * as React from "react";

import GamepadControl from "@/components/Gamepad/GamepadControl";
import JoystickControl from "@/components/Joystick/JoystickControl";
import KeyboardControl from "@/components/Keyboard";
import { PanelConfig } from "@/config";
import { Joy } from "@/types";

type PanelKey = "gamepad" | "joystick" | "keyboard";

export type ControlPanelViewProps = {
  readonly config: PanelConfig;
  /** Partial config patch — only changes the supplied keys. */
  readonly onConfigChange: (patch: Partial<PanelConfig>) => void;
  /** Interactive/joystick Joy updates (not a config change). */
  readonly onInteractiveJoy: (joy: Joy) => void;
};

export function ControlPanelView({
  config,
  onConfigChange,
  onInteractiveJoy,
}: ControlPanelViewProps): React.ReactElement {
  const CARD_GAP_PX = 16;

  const isGamepadEnabled = config.dataSource === "gamepad";
  const isJoystickEnabled = config.dataSource === "joystick";
  const isKeyboardEnabled = config.dataSource === "keyboard";

  const visiblePanels = React.useMemo(() => {
    const panels: PanelKey[] = [];
    if (config.showGamepad) {
      panels.push("gamepad");
    }
    if (config.showJoystick) {
      panels.push("joystick");
    }
    if (config.showKeyboard) {
      panels.push("keyboard");
    }
    return panels;
  }, [config.showGamepad, config.showJoystick, config.showKeyboard]);

  const panelRefs = React.useRef<Record<PanelKey, HTMLDivElement | null>>({
    gamepad: null,
    joystick: null,
    keyboard: null,
  });
  const expandedHeightsRef = React.useRef({
    gamepad: 0,
    joystick: 0,
    keyboard: 0,
  });
  const [collapseInactiveCards, setCollapseInactiveCards] = React.useState(false);
  const cardsStackRef = React.useRef<HTMLDivElement | null>(null);

  const setPanelRef = React.useCallback(
    (panel: PanelKey) => (node: HTMLDivElement | null) => {
      panelRefs.current[panel] = node;
    },
    [],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const recomputeCollapseState = () => {
      const stackRect = cardsStackRef.current?.getBoundingClientRect();
      const availableHeight =
        stackRect != null ? Math.max(0, window.innerHeight - stackRect.top) : window.innerHeight;

      let totalExpandedHeight = 0;

      visiblePanels.forEach((panel) => {
        const element = panelRefs.current[panel];
        if (!element) {
          return;
        }

        const currentHeight = element.getBoundingClientRect().height;
        const isPanelInactive = config.dataSource !== panel;
        const isCollapsedNow = collapseInactiveCards && isPanelInactive;

        if (!isCollapsedNow && currentHeight > 0) {
          expandedHeightsRef.current[panel] = currentHeight;
        }

        const expandedHeight = expandedHeightsRef.current[panel] || currentHeight;
        totalExpandedHeight += expandedHeight;
      });

      const totalGapHeight = Math.max(visiblePanels.length - 1, 0) * CARD_GAP_PX;
      const expandedTotalHeight = totalExpandedHeight + totalGapHeight;
      const hasInactivePanels = visiblePanels.some((panel) => panel !== config.dataSource);

      setCollapseInactiveCards(hasInactivePanels && expandedTotalHeight > availableHeight);
    };

    recomputeCollapseState();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            recomputeCollapseState();
          })
        : undefined;

    visiblePanels.forEach((panel) => {
      const element = panelRefs.current[panel];
      if (element) {
        resizeObserver?.observe(element);
      }
    });
    if (cardsStackRef.current) {
      resizeObserver?.observe(cardsStackRef.current);
    }

    window.addEventListener("resize", recomputeCollapseState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", recomputeCollapseState);
    };
  }, [visiblePanels, config.dataSource, collapseInactiveCards]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div ref={cardsStackRef} className="flex flex-col gap-4">
          {config.showGamepad && (
            <div ref={setPanelRef("gamepad")}>
              <GamepadControl
                enabled={isGamepadEnabled}
                compact={collapseInactiveCards && !isGamepadEnabled}
                showControlButtons={config.showControlButtons}
                showRightSide={config.showGamepadRightSide}
                onEnabledChange={({ enabled }) => {
                  if (enabled) {
                    onConfigChange({ dataSource: "gamepad" });
                  }
                }}
                selectedControllerIndex={config.gamepadId}
                onSelectedControllerIndexChange={(gamepadId) => {
                  onConfigChange({ gamepadId });
                }}
                onSelectedControllerIndexConfigChange={(gamepadId) => {
                  onConfigChange({ gamepadId });
                }}
                showButtons={config.showButtons}
                showAxes={config.showAxes}
                gamepadJoyTransform={config.gamepadJoyTransform}
                gamepadVisualization={config.gamepadVisualization}
                gamepadDeadzoneEnabled={config.gamepadDeadzoneEnabled}
                gamepadDeadzone={config.gamepadDeadzone}
                onGamepadJoyTransformChange={(gamepadJoyTransform) => {
                  onConfigChange({ gamepadJoyTransform });
                }}
                onGamepadVisualizationChange={(gamepadVisualization) => {
                  onConfigChange({ gamepadVisualization });
                }}
                onGamepadDeadzoneEnabledChange={({ gamepadDeadzoneEnabled }) => {
                  onConfigChange({ gamepadDeadzoneEnabled });
                }}
                onGamepadDeadzoneChange={(gamepadDeadzone) => {
                  onConfigChange({ gamepadDeadzone });
                }}
                onShowButtonsChange={({ showButtons }) => {
                  onConfigChange({ showButtons });
                }}
                onShowAxesChange={({ showAxes }) => {
                  onConfigChange({ showAxes });
                }}
                axisVisualization={config.axisVisualization}
                onAxisVisualizationChange={(axisVisualization) => {
                  onConfigChange({ axisVisualization });
                }}
                onShowRightSideChange={({ showRightSide }) => {
                  onConfigChange({ showGamepadRightSide: showRightSide });
                }}
              />
            </div>
          )}
          {config.showJoystick && (
            <div ref={setPanelRef("joystick")}>
              <JoystickControl
                onInteractiveJoy={onInteractiveJoy}
                compact={collapseInactiveCards && !isJoystickEnabled}
                axisLeft={config.joystickAxisLeft}
                axisRight={config.joystickAxisRight}
                size={config.joystickSize}
                sticky={config.joystickSticky}
                secondJoystick={config.joystickSecond}
                showControlButtons={config.showControlButtons}
                showRightSide={config.showJoystickRightSide}
                onAxisLeftChange={(joystickAxisLeft) => {
                  onConfigChange({ joystickAxisLeft });
                }}
                onAxisRightChange={(joystickAxisRight) => {
                  onConfigChange({ joystickAxisRight });
                }}
                onSizeChange={(joystickSize) => {
                  onConfigChange({ joystickSize });
                }}
                onStickyChange={({ sticky }) => {
                  onConfigChange({ joystickSticky: sticky });
                }}
                onSecondJoystickChange={({ secondJoystick }) => {
                  onConfigChange({ joystickSecond: secondJoystick });
                }}
                onShowRightSideChange={({ showRightSide }) => {
                  onConfigChange({ showJoystickRightSide: showRightSide });
                }}
                enabled={isJoystickEnabled}
                onEnabledChange={({ enabled }) => {
                  if (enabled) {
                    onConfigChange({ dataSource: "joystick" });
                  }
                }}
              />
            </div>
          )}
          {config.showKeyboard && (
            <div ref={setPanelRef("keyboard")}>
              <KeyboardControl
                layout={config.keyboardLayout}
                compact={collapseInactiveCards && !isKeyboardEnabled}
                showControlButtons={config.showControlButtons}
                showRightSide={config.showKeyboardRightSide}
                onShowRightSideChange={({ showRightSide }) => {
                  onConfigChange({ showKeyboardRightSide: showRightSide });
                }}
                enabled={isKeyboardEnabled}
                onEnabledChange={({ enabled }) => {
                  if (enabled) {
                    onConfigChange({ dataSource: "keyboard" });
                  }
                }}
                onLayoutChange={(keyboardLayout) => {
                  onConfigChange({ keyboardLayout });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
