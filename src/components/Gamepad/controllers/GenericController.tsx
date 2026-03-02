import type * as React from "react";

import { ControllerRendererProps } from "../types";
import {
  getStickMotionStroke,
  getStickPressFill,
  getStickPressStroke,
} from "../renderContext";

type GenericControllerProps = ControllerRendererProps & {
  swapLeftControls?: boolean;
};

export function GenericController({ ctx, swapLeftControls = false }: GenericControllerProps): React.ReactElement {
  const leftStickBaseX = swapLeftControls ? 113 : 166;
  const leftStickBaseY = swapLeftControls ? 160 : 238;
  const dpadTransform = swapLeftControls ? "translate(0, 0)" : "translate(-53, -78)";

  return (
    <svg
      id="gamepad-svg"
      className="gamepad-skin"
      viewBox="0 0 441 383"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="XBox">
        <path
          id="LOutline"
          d="M220.5 294.5C220.5 294.5 195 294.5 150 294.5C105 294.5 81.5 378.5 49.5 378.5C17.5 378.5 4 363.9 4 317.5C4 271.1 43.5 165.5 55 137.5C66.5 109.5 95.5 92.0001 128 92.0001C154 92.0001 200.5 92.0001 220.5 92.0001"
          stroke="hsl(210,50%,85%)"
          strokeWidth="3"
          strokeOpacity="0.5"
        />
        <path
          id="ROutline"
          d="M220 294.5C220 294.5 245.5 294.5 290.5 294.5C335.5 294.5 359 378.5 391 378.5C423 378.5 436.5 363.9 436.5 317.5C436.5 271.1 397 165.5 385.5 137.5C374 109.5 345 92.0001 312.5 92.0001C286.5 92.0001 240 92.0001 220 92.0001"
          stroke="hsl(210,50%,85%)"
          strokeWidth="3"
          strokeOpacity="0.5"
        />
        <circle id="LStickOutline" cx="113" cy="160" r="37.5" stroke="hsl(210,50%,85%)" strokeOpacity="0.5" strokeWidth="3" />
        <circle id="RStickOutline" cx="278" cy="238" r="37.5" stroke="hsl(210,50%,85%)" strokeOpacity="0.5" strokeWidth="3" />
        <circle id="DOutline" cx="166" cy="238" r="37.5" stroke="hsl(210,50%,85%)" strokeOpacity="0.5" strokeWidth="3" />
        <circle
          id="LeftStick"
          cx={leftStickBaseX + ctx.lstickAxisX * 12}
          cy={leftStickBaseY + ctx.lstickAxisY * 12}
          r="28"
          fill="rgba(0,0,0,0)"
          stroke={getStickMotionStroke(ctx.lstickMagnitude)}
          strokeWidth="3"
        />
        <circle
          id="LStickDot"
          cx={leftStickBaseX + ctx.lstickAxisX * 12}
          cy={leftStickBaseY + ctx.lstickAxisY * 12}
          r="20"
          fill={getStickPressFill(ctx.lPressed)}
          stroke={getStickPressStroke(ctx.lPressed)}
          strokeWidth="3"
        />
        <circle id="BOutline" cx="329" cy="160" r="37.5" stroke="hsl(210,50%,85%)" strokeOpacity="0.5" strokeWidth="3" />
        <circle
          id="RightStick"
          cx={278 + ctx.rstickAxisX * 12}
          cy={238 + ctx.rstickAxisY * 12}
          r="28"
          fill="rgba(0,0,0,0)"
          stroke={getStickMotionStroke(ctx.rstickMagnitude)}
          strokeWidth="3"
        />
        <circle
          id="RStickDot"
          cx={278 + ctx.rstickAxisX * 12}
          cy={238 + ctx.rstickAxisY * 12}
          r="20"
          fill={getStickPressFill(ctx.rPressed)}
          stroke={getStickPressStroke(ctx.rPressed)}
          strokeWidth="3"
        />

        <g transform={dpadTransform}>
          <g id="DUp">
            <path
              id="d-up-path"
              d="M177.669 222.335C180.793 219.21 180.816 213.997 176.868 212.014C176.327 211.743 175.776 211.491 175.215 211.258C172.182 210.002 168.931 209.355 165.648 209.355C162.365 209.355 159.114 210.002 156.081 211.258C155.521 211.491 154.969 211.743 154.429 212.014C150.48 213.997 150.503 219.21 153.627 222.335L159.991 228.698C163.116 231.823 168.181 231.823 171.305 228.698L177.669 222.335Z"
              fill={ctx.getButtonFill("d-up-path")}
              stroke={ctx.getButtonColor("d-up-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DRight">
            <path
              id="d-right-path"
              d="M181.447 249.669C184.571 252.793 189.785 252.816 191.768 248.868C192.039 248.327 192.291 247.776 192.523 247.215C193.78 244.182 194.426 240.931 194.426 237.648C194.426 234.365 193.78 231.114 192.523 228.081C192.291 227.521 192.039 226.969 191.768 226.429C189.785 222.48 184.571 222.503 181.447 225.627L175.083 231.991C171.959 235.116 171.959 240.181 175.083 243.305L181.447 249.669Z"
              fill={ctx.getButtonFill("d-right-path")}
              stroke={ctx.getButtonColor("d-right-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DDown">
            <path
              id="d-down-path"
              d="M154.113 253.447C150.989 256.571 150.966 261.785 154.914 263.767C155.455 264.039 156.006 264.291 156.566 264.523C159.6 265.78 162.85 266.426 166.134 266.426C169.417 266.426 172.667 265.78 175.701 264.523C176.261 264.291 176.812 264.039 177.353 263.767C181.301 261.785 181.279 256.571 178.154 253.447L171.79 247.083C168.666 243.959 163.601 243.959 160.477 247.083L154.113 253.447Z"
              fill={ctx.getButtonFill("d-down-path")}
              stroke={ctx.getButtonColor("d-down-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DLeft">
            <path
              id="d-left-path"
              d="M150.335 226.113C147.21 222.989 141.997 222.966 140.014 226.914C139.743 227.455 139.491 228.006 139.258 228.566C138.002 231.6 137.355 234.85 137.355 238.134C137.355 241.417 138.002 244.667 139.258 247.701C139.491 248.261 139.743 248.812 140.014 249.353C141.997 253.301 147.21 253.279 150.335 250.154L156.698 243.79C159.823 240.666 159.823 235.601 156.698 232.477L150.335 226.113Z"
              fill={ctx.getButtonFill("d-left-path")}
              stroke={ctx.getButtonColor("d-left-path")}
              strokeWidth="3"
            />
          </g>
        </g>

        <circle id="b-up-path" cx="329" cy="140" r="10" fill={ctx.getButtonFill("b-up-path")} stroke={ctx.getButtonColor("b-up-path")} strokeWidth="3" />
        <circle id="b-right-path" cx="349" cy="160" r="10" fill={ctx.getButtonFill("b-right-path")} stroke={ctx.getButtonColor("b-right-path")} strokeWidth="3" />
        <circle id="b-down-path" cx="329" cy="180" r="10" fill={ctx.getButtonFill("b-down-path")} stroke={ctx.getButtonColor("b-down-path")} strokeWidth="3" />
        <circle id="b-left-path" cx="309" cy="160" r="10" fill={ctx.getButtonFill("b-left-path")} stroke={ctx.getButtonColor("b-left-path")} strokeWidth="3" />

        <circle id="l-meta-circle" cx="185" cy="162" r="10" fill={ctx.getButtonFill("l-meta-circle")} stroke={ctx.getButtonColor("l-meta-circle")} strokeWidth="3" />
        <circle id="r-meta-circle" cx="259" cy="162" r="10" fill={ctx.getButtonFill("r-meta-circle")} stroke={ctx.getButtonColor("r-meta-circle")} strokeWidth="3" />

        <rect id="l1-rect" x="111.5" y="61.5" width="41" height="13" rx="6.5" fill={ctx.getButtonFill("l1-rect")} stroke={ctx.getButtonColor("l1-rect")} strokeWidth="3" />
        <rect id="r1-rect" x="289.5" y="61.5" width="41" height="13" rx="6.5" fill={ctx.getButtonFill("r1-rect")} stroke={ctx.getButtonColor("r1-rect")} strokeWidth="3" />

        <path
          id="l2-path"
          d="M152.5 37C152.5 41.1421 149.142 44.5 145 44.5H132C127.858 44.5 124.5 41.1421 124.5 37V16.5C124.5 8.76801 130.768 2.5 138.5 2.5C146.232 2.5 152.5 8.76801 152.5 16.5V37Z"
          fill={ctx.getButtonFill("l2-path")}
          stroke={ctx.getButtonColor("l2-path")}
          strokeWidth="3"
        />
        <path
          id="r2-path"
          d="M317.5 37C317.5 41.1421 314.142 44.5 310 44.5H297C292.858 44.5 289.5 41.1421 289.5 37V16.5C289.5 8.76801 295.768 2.5 303.5 2.5C311.232 2.5 317.5 8.76801 317.5 16.5V37Z"
          fill={ctx.getButtonFill("r2-path")}
          stroke={ctx.getButtonColor("r2-path")}
          strokeWidth="3"
        />

        <line x1="30" y1="210" x2="130" y2="300" strokeWidth="3" stroke="hsl(210,50%,85%)" opacity="0.3" />
        <line x1="411" y1="210" x2="311" y2="300" strokeWidth="3" stroke="hsl(210,50%,85%)" opacity="0.3" />
      </g>
    </svg>
  );
}