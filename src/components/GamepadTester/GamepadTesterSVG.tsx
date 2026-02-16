import React from "react";

interface GamepadState {
  id: string;
  index: number;
  connected: boolean;
  mapping: string;
  timestamp: number;
  vibrationSupported: boolean;
  buttons: number[];
  axes: number[];
}

export function GamepadTesterSVG({ gamepad }: { gamepad: GamepadState | null }): JSX.Element {
  const buttons = gamepad?.buttons ?? [];
  const axes = gamepad?.axes ?? [];

  // Button mapping
  const buttonToIndexMap: { [key: string]: number } = {
    "b-down-path": 0, // A / Bottom
    "b-right-path": 1, // B / Right
    "b-left-path": 2, // X / Left
    "b-up-path": 3, // Y / Top
    "l1-rect": 4, // LB / L1
    "r1-rect": 5, // RB / R1
    "l2-path": 6, // LT / L2
    "r2-path": 7, // RT / R2
    "l-meta-circle": 8, // Back / Select
    "r-meta-circle": 9, // Start
    "d-up-path": 12, // D-Pad Up
    "d-down-path": 13, // D-Pad Down
    "d-left-path": 14, // D-Pad Left
    "d-right-path": 15, // D-Pad Right
  };

  const getButtonColor = (elementId: string): string => {
    const buttonIndex = buttonToIndexMap[elementId];
    if (buttonIndex != null && buttons[buttonIndex] != null) {
      const value = buttons[buttonIndex] as number | undefined;
      if (value != null) {
        const opacity = 0.3 + value * 0.7;
        return `rgba(74, 222, 128, ${opacity})`;
      }
    }
    return "rgba(74, 222, 128, 0.3)";
  };

  const getButtonFill = (elementId: string): string => {
    const buttonIndex = buttonToIndexMap[elementId];
    if (buttonIndex != null && buttons[buttonIndex] != null) {
      const value = buttons[buttonIndex] as number | undefined;
      if (value != null) {
        return `rgba(74, 222, 128, ${value * 0.3})`;
      }
    }
    return "rgba(0, 0, 0, 0)";
  };

  // Stick calculations
  const lstickAxisX = axes[0] ?? 0;
  const lstickAxisY = axes[1] ?? 0;
  const lstickMagnitude = Math.sqrt(lstickAxisX * lstickAxisX + lstickAxisY * lstickAxisY);

  const rstickAxisX = axes[2] ?? 0;
  const rstickAxisY = axes[3] ?? 0;
  const rstickMagnitude = Math.sqrt(rstickAxisX * rstickAxisX + rstickAxisY * rstickAxisY);

  const lPressed = buttons[10]?.valueOf() ?? 0;
  const rPressed = buttons[11]?.valueOf() ?? 0;

  return (
    <svg id="gamepad-svg" viewBox="0 0 441 383" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="XBox">
        <path
          id="LOutline"
          d="M220.5 294.5C220.5 294.5 195 294.5 150 294.5C105 294.5 81.5 378.5 49.5 378.5C17.5 378.5 4 363.9 4 317.5C4 271.1 43.5 165.5 55 137.5C66.5 109.5 95.5 92.0001 128 92.0001C154 92.0001 200.5 92.0001 220.5 92.0001"
          stroke="hsl(210,50%,85%)"
          strokeWidth="3"
          strokeOpacity="0.3"
        />
        <path
          id="ROutline"
          d="M220 294.5C220 294.5 245.5 294.5 290.5 294.5C335.5 294.5 359 378.5 391 378.5C423 378.5 436.5 363.9 436.5 317.5C436.5 271.1 397 165.5 385.5 137.5C374 109.5 345 92.0001 312.5 92.0001C286.5 92.0001 240 92.0001 220 92.0001"
          stroke="hsl(210,50%,85%)"
          strokeWidth="3"
          strokeOpacity="0.3"
        />
        <circle
          id="LStickOutline"
          cx="113"
          cy="160"
          r="37.5"
          stroke="hsl(210,50%,85%)"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <circle
          id="RStickOutline"
          cx="278"
          cy="238"
          r="37.5"
          stroke="hsl(210,50%,85%)"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <circle
          id="DOutline"
          cx="166"
          cy="238"
          r="37.5"
          stroke="hsl(210,50%,85%)"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <circle
          id="LeftStick"
          cx={166 + lstickAxisX * 12}
          cy={238 + lstickAxisY * 12}
          r="28"
          fill="rgba(0,0,0,0)"
          stroke={`rgba(74, 222, 128, ${0.3 + lstickMagnitude * 0.7})`}
          strokeWidth="3"
        />
        <circle
          id="LStickDot"
          cx={166 + lstickAxisX * 12}
          cy={238 + lstickAxisY * 12}
          r="20"
          fill={`rgba(74, 222, 128, ${lPressed * 0.8})`}
          stroke={`rgba(74, 222, 128, ${lPressed})`}
          strokeWidth="3"
        />
        <circle
          id="BOutline"
          cx="329"
          cy="160"
          r="37.5"
          stroke="hsl(210,50%,85%)"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <circle
          id="RightStick"
          cx={278 + rstickAxisX * 12}
          cy={238 + rstickAxisY * 12}
          r="28"
          fill="rgba(0,0,0,0)"
          stroke={`rgba(74, 222, 128, ${0.3 + rstickMagnitude * 0.7})`}
          strokeWidth="3"
        />
        <circle
          id="RStickDot"
          cx={278 + rstickAxisX * 12}
          cy={238 + rstickAxisY * 12}
          r="20"
          fill={`rgba(74, 222, 128, ${rPressed * 0.8})`}
          stroke={`rgba(74, 222, 128, ${rPressed})`}
          strokeWidth="3"
        />

        {/* D-Pad */}
        <g transform="translate(-53, -78)">
          <g id="DUp">
            <path
              id="d-up-path"
              d="M177.669 222.335C180.793 219.21 180.816 213.997 176.868 212.014C176.327 211.743 175.776 211.491 175.215 211.258C172.182 210.002 168.931 209.355 165.648 209.355C162.365 209.355 159.114 210.002 156.081 211.258C155.521 211.491 154.969 211.743 154.429 212.014C150.48 213.997 150.503 219.21 153.627 222.335L159.991 228.698C163.116 231.823 168.181 231.823 171.305 228.698L177.669 222.335Z"
              fill={getButtonFill("d-up-path")}
              stroke={getButtonColor("d-up-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DRight">
            <path
              id="d-right-path"
              d="M181.447 249.669C184.571 252.793 189.785 252.816 191.768 248.868C192.039 248.327 192.291 247.776 192.523 247.215C193.78 244.182 194.426 240.931 194.426 237.648C194.426 234.365 193.78 231.114 192.523 228.081C192.291 227.521 192.039 226.969 191.768 226.429C189.785 222.48 184.571 222.503 181.447 225.627L175.083 231.991C171.959 235.116 171.959 240.181 175.083 243.305L181.447 249.669Z"
              fill={getButtonFill("d-right-path")}
              stroke={getButtonColor("d-right-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DDown">
            <path
              id="d-down-path"
              d="M154.113 253.447C150.989 256.571 150.966 261.785 154.914 263.767C155.455 264.039 156.006 264.291 156.566 264.523C159.6 265.78 162.85 266.426 166.134 266.426C169.417 266.426 172.667 265.78 175.701 264.523C176.261 264.291 176.812 264.039 177.353 263.767C181.301 261.785 181.279 256.571 178.154 253.447L171.79 247.083C168.666 243.959 163.601 243.959 160.477 247.083L154.113 253.447Z"
              fill={getButtonFill("d-down-path")}
              stroke={getButtonColor("d-down-path")}
              strokeWidth="3"
            />
          </g>
          <g id="DLeft">
            <path
              id="d-left-path"
              d="M150.335 226.113C147.21 222.989 141.997 222.966 140.014 226.914C139.743 227.455 139.491 228.006 139.258 228.566C138.002 231.6 137.355 234.85 137.355 238.134C137.355 241.417 138.002 244.667 139.258 247.701C139.491 248.261 139.743 248.812 140.014 249.353C141.997 253.301 147.21 253.279 150.335 250.154L156.698 243.79C159.823 240.666 159.823 235.601 156.698 232.477L150.335 226.113Z"
              fill={getButtonFill("d-left-path")}
              stroke={getButtonColor("d-left-path")}
              strokeWidth="3"
            />
          </g>
        </g>

        {/* Right Buttons */}
        <g id="BTop">
          <circle
            id="b-up-path"
            cx="329"
            cy="140"
            r="10"
            fill={getButtonFill("b-up-path")}
            stroke={getButtonColor("b-up-path")}
            strokeWidth="3"
          />
        </g>
        <g id="BRight">
          <circle
            id="b-right-path"
            cx="349"
            cy="160"
            r="10"
            fill={getButtonFill("b-right-path")}
            stroke={getButtonColor("b-right-path")}
            strokeWidth="3"
          />
        </g>
        <g id="BBottom">
          <circle
            id="b-down-path"
            cx="329"
            cy="180"
            r="10"
            fill={getButtonFill("b-down-path")}
            stroke={getButtonColor("b-down-path")}
            strokeWidth="3"
          />
        </g>
        <g id="BLeft">
          <circle
            id="b-left-path"
            cx="309"
            cy="160"
            r="10"
            fill={getButtonFill("b-left-path")}
            stroke={getButtonColor("b-left-path")}
            strokeWidth="3"
          />
        </g>

        {/* Meta Buttons */}
        <g id="LMeta">
          <circle
            id="l-meta-circle"
            cx="185"
            cy="162"
            r="10"
            fill={getButtonFill("l-meta-circle")}
            stroke={getButtonColor("l-meta-circle")}
            strokeWidth="3"
          />
        </g>
        <g id="RMeta">
          <circle
            id="r-meta-circle"
            cx="259"
            cy="162"
            r="10"
            fill={getButtonFill("r-meta-circle")}
            stroke={getButtonColor("r-meta-circle")}
            strokeWidth="3"
          />
        </g>

        {/* Shoulder Buttons */}
        <rect
          id="l1-rect"
          x="111.5"
          y="61.5"
          width="41"
          height="13"
          rx="6.5"
          fill={getButtonFill("l1-rect")}
          stroke={getButtonColor("l1-rect")}
          strokeWidth="3"
        />
        <rect
          id="r1-rect"
          x="289.5"
          y="61.5"
          width="41"
          height="13"
          rx="6.5"
          fill={getButtonFill("r1-rect")}
          stroke={getButtonColor("r1-rect")}
          strokeWidth="3"
        />

        {/* Trigger Buttons */}
        <path
          id="l2-path"
          d="M152.5 37C152.5 41.1421 149.142 44.5 145 44.5H132C127.858 44.5 124.5 41.1421 124.5 37V16.5C124.5 8.76801 130.768 2.5 138.5 2.5C146.232 2.5 152.5 8.76801 152.5 16.5V37Z"
          fill={getButtonFill("l2-path")}
          stroke={getButtonColor("l2-path")}
          strokeWidth="3"
        />
        <path
          id="r2-path"
          d="M317.5 37C317.5 41.1421 314.142 44.5 310 44.5H297C292.858 44.5 289.5 41.1421 289.5 37V16.5C289.5 8.76801 295.768 2.5 303.5 2.5C311.232 2.5 317.5 8.76801 317.5 16.5V37Z"
          fill={getButtonFill("r2-path")}
          stroke={getButtonColor("r2-path")}
          strokeWidth="3"
        />

        {/* Bracket lines */}
        <line
          x1="30"
          y1="210"
          x2="130"
          y2="300"
          strokeWidth="3"
          stroke="hsl(210,50%,85%)"
          opacity="0.3"
        />
        <line
          x1="411"
          y1="210"
          x2="311"
          y2="300"
          strokeWidth="3"
          stroke="hsl(210,50%,85%)"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}
