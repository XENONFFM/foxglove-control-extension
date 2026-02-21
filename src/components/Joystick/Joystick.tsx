"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface JoystickPosition {
  /** Normalised x value in the range [-1, 1] */
  x: number;
  /** Normalised y value in the range [-1, 1] */
  y: number;
  /** Distance from centre in the range [0, 1] */
  distance: number;
  /** Angle in radians (0 = right, π/2 = up) */
  angle: number;
}

export interface JoystickProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof joystickVariants> {
  /** Called continuously while dragging */
  onMove?: (position: JoystickPosition) => void;
  /** Called once when the user releases the joystick */
  onEnd?: (position: JoystickPosition) => void;
  /** Called once when the user starts dragging */
  onStart?: (position: JoystickPosition) => void;
  /** Whether to snap the thumb back to centre on release (default true) */
  snapToCenter?: boolean;
  /** Limit to one axis: "x", "y", or "both" (default "both") */
  axis?: "x" | "y" | "both";
  /** Controlled position (optional) */
  position?: { x: number; y: number };
  /** Dead-zone radius [0-1] – movements within this radius report 0 */
  deadZone?: number;
  /** Whether the joystick is disabled */
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */

const joystickVariants = cva(
  "relative touch-none select-none rounded-full border transition-colors",
  {
    variants: {
      size: {
        xs: "size-24",
        sm: "size-28",
        md: "size-40",
        lg: "size-56",
        xl: "size-64",
      },
      variant: {
        default: "border-border bg-muted/50",
        outline: "border-border bg-background",
        subtle: "border-transparent bg-muted/30",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

const thumbVariants = cva(
  "absolute rounded-full shadow-md transition-shadow focus-visible:outline-hidden",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-8",
        md: "size-12",
        lg: "size-16",
        xl: "size-20",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ORIGIN: JoystickPosition = { x: 0, y: 0, distance: 0, angle: 0 };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function toPosition(
  px: number,
  py: number,
  radius: number,
  axis: "x" | "y" | "both",
  deadZone: number,
): JoystickPosition {
  let nx = px / radius;
  let ny = py / radius;

  if (axis === "x") {
    ny = 0;
  }
  if (axis === "y") {
    nx = 0;
  }

  let dist = Math.sqrt(nx * nx + ny * ny);
  if (dist > 1) {
    nx /= dist;
    ny /= dist;
    dist = 1;
  }

  if (dist < deadZone) {
    return ORIGIN;
  }

  const angle = Math.atan2(-ny, nx); // -ny so that "up" is positive
  return {
    x: +nx.toFixed(4),
    y: +(-ny).toFixed(4),
    distance: +dist.toFixed(4),
    angle: +angle.toFixed(4),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Joystick = React.forwardRef<HTMLDivElement, JoystickProps>(
  (
    {
      className,
      size,
      variant,
      onMove,
      onEnd,
      onStart,
      snapToCenter = true,
      axis = "both",
      position: controlledPos,
      deadZone = 0,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = React.useState(false);
    const [thumbOffset, setThumbOffset] = React.useState({ x: 0, y: 0 });
    const lastPos = React.useRef<JoystickPosition>(ORIGIN);

    // Derive radius from the container when we start dragging
    const getRadius = React.useCallback(() => {
      if (!containerRef.current) {
        return 60;
      }
      const rect = containerRef.current.getBoundingClientRect();
      return rect.width / 2;
    }, []);

    // Thumb size offset (half the thumb width) – we derive from the size variant
    const thumbRadius =
      size === "xs" ? 12 : size === "sm" ? 16 : size === "lg" ? 32 : size === "xl" ? 40 : 24;

    /* ---- Controlled position ---- */
    React.useEffect(() => {
      if (controlledPos && !dragging) {
        const r = getRadius();
        const px = clamp(controlledPos.x, -1, 1) * (r - thumbRadius);
        const py = clamp(-controlledPos.y, -1, 1) * (r - thumbRadius);
        setThumbOffset({ x: px, y: py });
      }
    }, [controlledPos, dragging, getRadius, thumbRadius]);

    /* ---- Pointer event handlers ---- */
    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);

        const rect = containerRef.current!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = rect.width / 2;

        let px = e.clientX - cx;
        let py = e.clientY - cy;

        // Apply axis lock before clamping
        if (axis === "x") {
          py = 0;
        }
        if (axis === "y") {
          px = 0;
        }

        const pos = toPosition(px, py, radius, axis, deadZone);
        lastPos.current = pos;

        // Clamp thumb to radius minus thumb radius for visual fit
        const maxR = radius - thumbRadius;
        const dist = Math.sqrt(px * px + py * py);
        const scale = dist > maxR ? maxR / dist : 1;
        setThumbOffset({ x: px * scale, y: py * scale });

        onStart?.(pos);
        onMove?.(pos);
      },
      [disabled, axis, deadZone, onStart, onMove, thumbRadius],
    );

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging || disabled) {
          return;
        }
        e.preventDefault();

        const rect = containerRef.current!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = rect.width / 2;

        let px = e.clientX - cx;
        let py = e.clientY - cy;

        // Apply axis lock before clamping
        if (axis === "x") {
          py = 0;
        }
        if (axis === "y") {
          px = 0;
        }

        const pos = toPosition(px, py, radius, axis, deadZone);
        lastPos.current = pos;

        const maxR = radius - thumbRadius;
        const dist = Math.sqrt(px * px + py * py);
        const scale = dist > maxR ? maxR / dist : 1;
        setThumbOffset({ x: px * scale, y: py * scale });

        onMove?.(pos);
      },
      [dragging, disabled, axis, deadZone, onMove, thumbRadius],
    );

    const handlePointerUp = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging) {
          return;
        }
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setDragging(false);

        if (snapToCenter) {
          setThumbOffset({ x: 0, y: 0 });
          onEnd?.(ORIGIN);
        } else {
          onEnd?.(lastPos.current);
        }
      },
      [dragging, snapToCenter, onEnd],
    );

    /* ---- Keyboard support ---- */
    const step = 0.1;
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        let { x, y } = lastPos.current;
        let handled = true;

        switch (e.key) {
          case "ArrowRight":
            x = clamp(x + step, -1, 1);
            break;
          case "ArrowLeft":
            x = clamp(x - step, -1, 1);
            break;
          case "ArrowUp":
            y = clamp(y + step, -1, 1);
            break;
          case "ArrowDown":
            y = clamp(y - step, -1, 1);
            break;
          case "Home":
          case "Escape":
            x = 0;
            y = 0;
            break;
          default:
            handled = false;
        }

        if (!handled) {
          return;
        }
        e.preventDefault();

        if (axis === "x") {
          y = 0;
        }
        if (axis === "y") {
          x = 0;
        }

        const dist = Math.min(Math.sqrt(x * x + y * y), 1);
        const angle = Math.atan2(y, x);
        const pos: JoystickPosition = {
          x: +x.toFixed(4),
          y: +y.toFixed(4),
          distance: +dist.toFixed(4),
          angle: +angle.toFixed(4),
        };
        lastPos.current = pos;

        const r = getRadius();
        const maxR = r - thumbRadius;
        setThumbOffset({ x: x * maxR, y: -y * maxR });
        onMove?.(pos);
      },
      [disabled, axis, getRadius, thumbRadius, onMove],
    );

    /* ---- Render ---- */
    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Joystick control"
        aria-valuetext={`x: ${lastPos.current.x}, y: ${lastPos.current.y}`}
        aria-disabled={disabled}
        data-slot="joystick"
        data-dragging={dragging || undefined}
        className={cn(
          joystickVariants({ size, variant }),
          disabled && "pointer-events-none opacity-50",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
          className,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Crosshair guides */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {/* Horizontal line */}
          <span className="absolute h-px w-full bg-border/60" />
          {/* Vertical line */}
          <span className="absolute h-full w-px bg-border/60" />
          {/* Centre dot */}
          <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        </span>

        {/* Thumb */}
        <span
          data-slot="joystick-thumb"
          aria-hidden
          className={cn(
            thumbVariants({ size }),
            dragging ? "border-green-500" : "border-primary",
            "bg-background border-2",
            dragging ? "ring-ring/40 ring-4" : "ring-ring/20 hover:ring-2",
          )}
          style={{
            left: `calc(50% + ${thumbOffset.x}px)`,
            top: `calc(50% + ${thumbOffset.y}px)`,
            transform: "translate(-50%, -50%)",
            transition: dragging
              ? "box-shadow 150ms"
              : "all 200ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
    );
  },
);

Joystick.displayName = "Joystick";

export { Joystick, joystickVariants, thumbVariants };
