import * as React from "react";

import { Joystick, type JoystickPosition } from "@/components/Joystick/Joystick";
import { JoystickAxisMode, JoystickSize } from "@/config/types";
import { cn } from "@/lib/utils";
import { Joy } from "@/types";
import { LightCardFrame } from "./LightCardFrame";

const ORIGIN_POSITION: JoystickPosition = { x: 0, y: 0, distance: 0, angle: 0 };
const LITE_SIZE_PX: Record<Exclude<JoystickSize, "auto">, number> = {
  xs: 96,
  sm: 112,
  md: 160,
  lg: 224,
  xl: 256,
};

function fitJoystickDiameterPx(
  availableWidth: number,
  availableHeight: number,
  secondJoystick: boolean,
): number {
  const widthPerJoystick = secondJoystick
    ? Math.max(0, (availableWidth - 8) / 2)
    : Math.max(0, availableWidth);
  return Math.max(64, Math.floor(Math.min(widthPerJoystick, Math.max(0, availableHeight))));
}

function resolveJoystickDiameterPx(
  requestedSize: JoystickSize,
  fittedDiameterPx: number,
): number {
  if (requestedSize === "auto") {
    return fittedDiameterPx;
  }

  const requestedPx = LITE_SIZE_PX[requestedSize] ?? fittedDiameterPx;
  return Math.max(64, Math.min(requestedPx, fittedDiameterPx));
}

function diameterToVariant(diameterPx: number): "xxs" | "xs" | "sm" | "md" | "lg" | "xl" {
  if (diameterPx < 80) {
    return "xxs";
  }
  if (diameterPx < 104) {
    return "xs";
  }
  if (diameterPx < 136) {
    return "sm";
  }
  if (diameterPx < 192) {
    return "md";
  }
  if (diameterPx < 240) {
    return "lg";
  }
  return "xl";
}

export function LightJoystickCard({
  size,
  axisLeft,
  axisRight,
  sticky,
  secondJoystick,
  enabled,
  onInteractiveJoy,
}: {
  size: JoystickSize;
  axisLeft: JoystickAxisMode;
  axisRight: JoystickAxisMode;
  sticky: boolean;
  secondJoystick: boolean;
  enabled: boolean;
  onInteractiveJoy: (joy: Joy) => void;
}): React.ReactElement {
  const [leftPos, setLeftPos] = React.useState<JoystickPosition>(ORIGIN_POSITION);
  const [rightPos, setRightPos] = React.useState<JoystickPosition>(ORIGIN_POSITION);
  const joysticksRef = React.useRef<HTMLDivElement | null>(null);
  const [fittedDiameterPx, setFittedDiameterPx] = React.useState<number>(96);

  React.useEffect(() => {
    const container = joysticksRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const recomputeSize = () => {
      const rect = container.getBoundingClientRect();
      setFittedDiameterPx(fitJoystickDiameterPx(rect.width, rect.height, secondJoystick));
    };

    recomputeSize();
    const observer = new ResizeObserver(() => {
      recomputeSize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [secondJoystick]);

  const resolvedDiameterPx = React.useMemo(
    () => resolveJoystickDiameterPx(size, fittedDiameterPx),
    [size, fittedDiameterPx],
  );
  const resolvedJoystickVariant = React.useMemo(
    () => diameterToVariant(resolvedDiameterPx),
    [resolvedDiameterPx],
  );

  const emitInteractiveJoy = React.useCallback(
    (nextLeft: JoystickPosition, nextRight: JoystickPosition) => {
      onInteractiveJoy({
        header: { stamp: { sec: 0, nsec: 0 }, frame_id: "" },
        axes: secondJoystick
          ? [nextLeft.x, nextLeft.y, nextRight.x, nextRight.y]
          : [nextLeft.x, nextLeft.y],
        buttons: [],
      });
    },
    [onInteractiveJoy, secondJoystick],
  );

  return (
    <LightCardFrame title="Joystick" subtitle={secondJoystick ? "dual" : "single"} showHeader={false}>
      <div ref={joysticksRef} className="flex min-h-0 flex-1 items-center justify-center gap-2 overflow-hidden">
        <Joystick
          size={resolvedJoystickVariant}
          className={cn("max-h-full max-w-full")}
          style={{ width: `${resolvedDiameterPx}px`, height: `${resolvedDiameterPx}px` }}
          axis={axisLeft}
          snapToCenter={!sticky}
          disabled={!enabled}
          onMove={(position) => {
            setLeftPos(position);
            emitInteractiveJoy(position, rightPos);
          }}
          onEnd={(position) => {
            setLeftPos(position);
            emitInteractiveJoy(position, rightPos);
          }}
        />

        {secondJoystick && (
          <Joystick
            size={resolvedJoystickVariant}
            className={cn("max-h-full max-w-full")}
            style={{ width: `${resolvedDiameterPx}px`, height: `${resolvedDiameterPx}px` }}
            axis={axisRight}
            snapToCenter={!sticky}
            disabled={!enabled}
            onMove={(position) => {
              setRightPos(position);
              emitInteractiveJoy(leftPos, position);
            }}
            onEnd={(position) => {
              setRightPos(position);
              emitInteractiveJoy(leftPos, position);
            }}
          />
        )}
      </div>
    </LightCardFrame>
  );
}
