import { GamepadState, GamepadVisualType, RenderContext } from "./types";

const BUTTON_TO_INDEX_MAP: Record<string, number> = {
  "b-down-path": 0,
  "b-right-path": 1,
  "b-left-path": 2,
  "b-up-path": 3,
  "l1-rect": 4,
  "r1-rect": 5,
  "l2-path": 6,
  "r2-path": 7,
  "l-meta-circle": 8,
  "r-meta-circle": 9,
  "d-up-path": 12,
  "d-down-path": 13,
  "d-left-path": 14,
  "d-right-path": 15,
};

export function detectGamepadVisualType(
  gamepadId: string | undefined,
  preferredType?: "xbox" | "dualsense",
): GamepadVisualType {
  const id = (gamepadId ?? "").toLowerCase();

  if (id.includes("dualshock") || id.includes("playstation(r)4") || id.includes("ps4")) {
    return "dualsense";
  }

  if (id.includes("dualsense") || id.includes("playstation(r)5") || id.includes("ps5")) {
    return "dualsense";
  }

  if (id.includes("xbox") || id.includes("xinput") || id.includes("microsoft")) {
    return "xbox";
  }

  if (id.includes("wireless controller") && preferredType != undefined) {
    return preferredType;
  }

  return "generic";
}

export function setGroupFill(svg: SVGSVGElement, id: string, fill: string): void {
  const roots = svg.querySelectorAll<SVGElement>(`#${id}`);
  roots.forEach((root) => {
    root.setAttribute("fill", fill);
    root.querySelectorAll<SVGElement>("path,circle,rect,polygon,ellipse").forEach((node) => {
      node.setAttribute("fill", fill);
    });
  });
}

export function setGroupStroke(svg: SVGSVGElement, id: string, stroke: string): void {
  const roots = svg.querySelectorAll<SVGElement>(`#${id}`);
  roots.forEach((root) => {
    root.setAttribute("stroke", stroke);
    root.querySelectorAll<SVGElement>("path,circle,rect,polygon,ellipse").forEach((node) => {
      node.setAttribute("stroke", stroke);
    });
  });
}

export function setLayerVisual(
  svg: SVGSVGElement,
  infillId: string,
  outlineId: string,
  fill: string,
  outlineHighlight: string,
): void {
  setGroupFill(svg, infillId, fill);
  setGroupFill(svg, outlineId, outlineHighlight);
  setGroupStroke(svg, infillId, "none");
  setGroupStroke(svg, outlineId, "none");
}

export function applyButtonLayers(
  svg: SVGSVGElement,
  ctx: RenderContext,
  buttonId: string,
  ids: string[],
  extraOutlineIds: string[] = ["L1", "R1"],
): void {
  const fill = ctx.getButtonFill(buttonId);
  const outlineHighlight = ctx.getButtonColor(buttonId);
  const infillId = ids.find((id) => id.toLowerCase().includes("infill"));
  const outlineId = ids.find(
    (id) => id.toLowerCase().includes("outline") || extraOutlineIds.includes(id),
  );

  if (infillId != undefined && outlineId != undefined) {
    setLayerVisual(svg, infillId, outlineId, fill, outlineHighlight);
  }
}

export function getButtonValue(buttons: number[], index: number): number {
  const value = buttons[index];
  return typeof value === "number" ? value : 0;
}

export function getStickMotionStroke(magnitude: number): string {
  const clamped = Math.min(1, Math.max(0, magnitude));
  return `rgba(74, 222, 128, ${0.3 + clamped * 0.7})`;
}

export function getStickPressFill(pressed: number, multiplier = 0.8): string {
  const clamped = Math.min(1, Math.max(0, pressed));
  return `rgba(74, 222, 128, ${clamped * multiplier})`;
}

export function getStickPressStroke(pressed: number): string {
  const clamped = Math.min(1, Math.max(0, pressed));
  return `rgba(74, 222, 128, ${clamped})`;
}

export function ensurePressDot(
  group: SVGGElement,
  id: string,
  cx: string,
  cy: string,
  radius: string,
): SVGCircleElement {
  let dot = group.querySelector<SVGCircleElement>(`#${id}`);
  if (dot == undefined) {
    dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("id", id);
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", radius);
    group.appendChild(dot);
  }
  return dot;
}

export function buildRenderContext(gamepad: GamepadState | null): RenderContext {
  const buttons = gamepad?.buttons ?? [];
  const axes = gamepad?.axes ?? [];

  const getButtonColor = (elementId: string): string => {
    const buttonIndex = BUTTON_TO_INDEX_MAP[elementId];
    if (buttonIndex != undefined && buttons[buttonIndex] != undefined) {
      const value = buttons[buttonIndex] as number | undefined;
      if (value != undefined) {
        const opacity = 0.3 + value * 0.7;
        return `rgba(74, 222, 128, ${opacity})`;
      }
    }
    return "rgba(74, 222, 128, 0.3)";
  };

  const getButtonFill = (elementId: string): string => {
    const buttonIndex = BUTTON_TO_INDEX_MAP[elementId];
    if (buttonIndex != undefined && buttons[buttonIndex] != undefined) {
      const value = buttons[buttonIndex] as number | undefined;
      if (value != undefined) {
        return `rgba(74, 222, 128, ${value * 0.3})`;
      }
    }
    return "rgba(0, 0, 0, 0)";
  };

  const lstickAxisX = axes[0] ?? 0;
  const lstickAxisY = axes[1] ?? 0;
  const lstickMagnitude = Math.sqrt(lstickAxisX * lstickAxisX + lstickAxisY * lstickAxisY);

  const rstickAxisX = axes[2] ?? 0;
  const rstickAxisY = axes[3] ?? 0;
  const rstickMagnitude = Math.sqrt(rstickAxisX * rstickAxisX + rstickAxisY * rstickAxisY);

  const lPressed = buttons[10]?.valueOf() ?? 0;
  const rPressed = buttons[11]?.valueOf() ?? 0;

  const triggerL2 = buttons[6] ?? 0;
  const triggerR2 = buttons[7] ?? 0;

  return {
    buttons,
    axes,
    getButtonColor,
    getButtonFill,
    lstickAxisX,
    lstickAxisY,
    lstickMagnitude,
    rstickAxisX,
    rstickAxisY,
    rstickMagnitude,
    lPressed,
    rPressed,
    triggerL2,
    triggerR2,
  };
}