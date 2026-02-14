import React, { CSSProperties, useEffect, useRef, useState } from "react";

import { GamepadTesterSVG } from "./GamepadTesterSVG";
import { GAMEPAD_TESTER_STYLES } from "./styles";

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

export function GamepadTester(): JSX.Element {
  const [gamepad, setGamepad] = useState<GamepadState | null>(null);
  const [vibrationActive, setVibrationActive] = useState(false);
  const [vibrationStatus, setVibrationStatus] = useState("");
  const infiniteVibrating = useRef(false);
  const vibrationTimeout = useRef<number | null>(null);

  useEffect(() => {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads();
      let foundGamepad: GamepadState | null = null;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp != null) {
          foundGamepad = {
            id: gp.id,
            index: i,
            connected: gp.connected,
            mapping: gp.mapping || "standard",
            timestamp: gp.timestamp,
            vibrationSupported: !!gp.vibrationActuator,
            buttons: Array.from(gp.buttons).map((btn) =>
              typeof btn === "object" ? btn.value : btn,
            ),
            axes: Array.from(gp.axes),
          };
          break;
        }
      }

      setGamepad(foundGamepad);
      requestAnimationFrame(pollGamepads);
    };

    const frameId = requestAnimationFrame(pollGamepads);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleVibration1Sec = (): void => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp?.vibrationActuator != null) {
      try {
        void gp.vibrationActuator
          .playEffect("dual-rumble", {
            startDelay: 0,
            duration: 1000,
            strongMagnitude: 1.0,
            weakMagnitude: 0.5,
          })
          .then(() => {
            setVibrationActive(true);
            setVibrationStatus("Vibrating... (1s)");

            if (vibrationTimeout.current != null) {
              clearTimeout(vibrationTimeout.current);
            }
            vibrationTimeout.current = window.setTimeout(() => {
              setVibrationActive(false);
              setVibrationStatus("");
            }, 1000);
          })
          .catch((error: unknown) => {
            setVibrationStatus("Vibration not supported");
            console.error("Vibration error:", error);
          });
      } catch (e) {
        setVibrationStatus("Vibration not supported");
      }
    } else {
      setVibrationStatus("No gamepad with vibration support connected");
    }
  };

  const handleVibrationInfinite = (): void => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp?.vibrationActuator != null) {
      try {
        if (!infiniteVibrating.current) {
          infiniteVibrating.current = true;
          setVibrationActive(true);
          setVibrationStatus("Vibrating... (infinite)");

          const vibrateLoop = (): void => {
            if (infiniteVibrating.current) {
              const currentGamepads = navigator.getGamepads();
              const currentGp = currentGamepads[0];
              if (currentGp?.vibrationActuator != null) {
                void currentGp.vibrationActuator
                  .playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 500,
                    strongMagnitude: 1.0,
                    weakMagnitude: 0.5,
                  })
                  .then(() => {
                    window.setTimeout(vibrateLoop, 500);
                  })
                  .catch((error: unknown) => {
                    console.error("Vibration error:", error);
                    infiniteVibrating.current = false;
                  });
              }
            }
          };
          vibrateLoop();
        } else {
          infiniteVibrating.current = false;
          setVibrationActive(false);
          setVibrationStatus("");
        }
      } catch (e) {
        setVibrationStatus("Vibration not supported");
      }
    } else {
      setVibrationStatus("No gamepad with vibration support connected");
    }
  };

  return (
    <div style={GAMEPAD_TESTER_STYLES.container}>
      <div style={GAMEPAD_TESTER_STYLES.header}>
        <h1 style={GAMEPAD_TESTER_STYLES.h1}>Gamepad Tester</h1>
        <div style={GAMEPAD_TESTER_STYLES.gamepadId}>
          {gamepad ? `${gamepad.index}: ${gamepad.id}` : "No gamepad connected"}
        </div>
      </div>

      <div style={GAMEPAD_TESTER_STYLES.infoGrid}>
        <div style={GAMEPAD_TESTER_STYLES.infoItem}>
          <div style={GAMEPAD_TESTER_STYLES.infoLabel}>Index</div>
          <div style={GAMEPAD_TESTER_STYLES.infoValue}>{gamepad?.index ?? 0}</div>
        </div>
        <div style={GAMEPAD_TESTER_STYLES.infoItem}>
          <div style={GAMEPAD_TESTER_STYLES.infoLabel}>Connected</div>
          <div
            style={{
              ...GAMEPAD_TESTER_STYLES.infoValue,
              ...(gamepad?.connected === true
                ? GAMEPAD_TESTER_STYLES.infoValueConnected
                : GAMEPAD_TESTER_STYLES.infoValueDisconnected),
            }}
          >
            {gamepad?.connected === true ? "Yes" : "No"}
          </div>
        </div>
        <div style={GAMEPAD_TESTER_STYLES.infoItem}>
          <div style={GAMEPAD_TESTER_STYLES.infoLabel}>Mapping</div>
          <div style={GAMEPAD_TESTER_STYLES.infoValue}>{gamepad?.mapping ?? "standard"}</div>
        </div>
        <div style={GAMEPAD_TESTER_STYLES.infoItem}>
          <div style={GAMEPAD_TESTER_STYLES.infoLabel}>Timestamp</div>
          <div style={GAMEPAD_TESTER_STYLES.infoValue}>
            {gamepad != null ? gamepad.timestamp.toFixed(5) : "0.00000"}
          </div>
        </div>
        <div
          style={{
            ...GAMEPAD_TESTER_STYLES.infoItem,
            ...GAMEPAD_TESTER_STYLES.infoItemLast,
          }}
        >
          <div style={GAMEPAD_TESTER_STYLES.infoLabel}>Vibration</div>
          <div style={GAMEPAD_TESTER_STYLES.infoValue}>
            {gamepad?.vibrationSupported === true ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div style={GAMEPAD_TESTER_STYLES.mainContent}>
        <div style={GAMEPAD_TESTER_STYLES.leftPanel}>
          {/* Buttons Section */}
          <div style={GAMEPAD_TESTER_STYLES.buttonsSection}>
            <div style={GAMEPAD_TESTER_STYLES.buttonsGrid}>
              {gamepad?.buttons.map((value, index) => (
                <div
                  key={index}
                  style={{
                    ...GAMEPAD_TESTER_STYLES.buttonCell,
                    ...(value > 0.1 ? GAMEPAD_TESTER_STYLES.buttonCellPressed : {}),
                  }}
                >
                  <div style={GAMEPAD_TESTER_STYLES.buttonLabel}>B{index}</div>
                  <div
                    style={{
                      ...GAMEPAD_TESTER_STYLES.buttonValue,
                      ...(value > 0.1 ? GAMEPAD_TESTER_STYLES.buttonValuePressed : {}),
                    }}
                  >
                    {value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticks Section */}
          <div style={GAMEPAD_TESTER_STYLES.axesSection}>
            <div style={GAMEPAD_TESTER_STYLES.sectionTitle}>Analog Sticks</div>
            <div style={GAMEPAD_TESTER_STYLES.sticksSection}>
              <GamepadStick
                label="L STICK"
                axisX={gamepad?.axes[0] ?? 0}
                axisY={gamepad?.axes[1] ?? 0}
              />
              <GamepadStick
                label="R STICK"
                axisX={gamepad?.axes[2] ?? 0}
                axisY={gamepad?.axes[3] ?? 0}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div style={GAMEPAD_TESTER_STYLES.controlsSection}>
            <button style={GAMEPAD_TESTER_STYLES.controlButton}>Test Circularity</button>
            <button
              style={{
                ...GAMEPAD_TESTER_STYLES.controlButton,
                ...(vibrationActive ? GAMEPAD_TESTER_STYLES.controlButtonActive : {}),
              }}
              onClick={() => {
                handleVibration1Sec();
              }}
            >
              Vibration, 1 sec
            </button>
            <button
              style={{
                ...GAMEPAD_TESTER_STYLES.controlButton,
                ...(vibrationActive ? GAMEPAD_TESTER_STYLES.controlButtonActive : {}),
              }}
              onClick={() => {
                handleVibrationInfinite();
              }}
            >
              Vibration, infinite
            </button>
          </div>
          <div style={GAMEPAD_TESTER_STYLES.vibrationStatus}>{vibrationStatus}</div>
        </div>

        {/* Right Panel - Gamepad Visual */}
        <div style={GAMEPAD_TESTER_STYLES.gamepadVisual}>
          <div style={GAMEPAD_TESTER_STYLES.gamepadSvgContainer}>
            <GamepadTesterSVG gamepad={gamepad} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GamepadStick({
  label,
  axisX,
  axisY,
}: {
  label: string;
  axisX: number;
  axisY: number;
}): JSX.Element {
  const maxRadius = 75;

  const crosshairStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  const crosshairLineStyle: CSSProperties = {
    position: "absolute",
    background: "#3a3a3a",
  };

  const verticalLine: CSSProperties = {
    ...crosshairLineStyle,
    left: "50%",
    top: "10%",
    bottom: "10%",
    width: "1px",
    transform: "translateX(-50%)",
  };

  const horizontalLine: CSSProperties = {
    ...crosshairLineStyle,
    top: "50%",
    left: "10%",
    right: "10%",
    height: "1px",
    transform: "translateY(-50%)",
  };

  return (
    <div style={GAMEPAD_TESTER_STYLES.stickContainer}>
      <div style={GAMEPAD_TESTER_STYLES.stickLabel}>{label}</div>
      <div style={GAMEPAD_TESTER_STYLES.stickVisualization}>
        <div style={crosshairStyle}>
          <div style={verticalLine} />
          <div style={horizontalLine} />
        </div>
        <div
          style={{
            ...GAMEPAD_TESTER_STYLES.stickDot,
            left: `calc(50% + ${axisX * maxRadius}px)`,
            top: `calc(50% + ${axisY * maxRadius}px)`,
          }}
        />
      </div>
      <div style={GAMEPAD_TESTER_STYLES.stickValues}>
        <div style={GAMEPAD_TESTER_STYLES.valueItem}>
          <div style={GAMEPAD_TESTER_STYLES.valueLabel}>
            {label.includes("L") ? "AXIS 0" : "AXIS 2"}
          </div>
          <div style={GAMEPAD_TESTER_STYLES.valueNumber}>{axisX.toFixed(5)}</div>
        </div>
        <div style={GAMEPAD_TESTER_STYLES.valueItem}>
          <div style={GAMEPAD_TESTER_STYLES.valueLabel}>
            {label.includes("L") ? "AXIS 1" : "AXIS 3"}
          </div>
          <div style={GAMEPAD_TESTER_STYLES.valueNumber}>{axisY.toFixed(5)}</div>
        </div>
      </div>
    </div>
  );
}
