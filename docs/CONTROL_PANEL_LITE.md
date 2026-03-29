# ASLZ Control Lite Panel

The **ASLZ Control Lite** panel is a streamlined, space-efficient teleoperation interface optimized for **compact displays** and **touch-friendly interaction**. It uses a **tabbed layout** to present one control source at a time, making it ideal for embedded displays, mobile devices, or minimal UI deployments.

![Control Lite Panel](Control-lite_panel.webp)

The Control Lite panel displays exactly one active control card at a time via a **tab bar**, and minimizes visual clutter while retaining all core functionality. It's perfect for scenarios where screen real estate is limited or you want a clean, focused interface.

## Panel Layout

### Tab Bar

The tab bar shows one tab for each control source:

- **Gamepad Tab** (game controller icon): USB/Bluetooth gamepad interface
- **Joystick Tab** (circle dot icon): On-screen virtual joystick
- **Keyboard Tab** (keyboard icon): WASD or arrow-key input

**Visibility**: When the source is inactive or hidden in settings, its tab button is disabled (dimmed).

Optionally hide the tab bar entirely via the **"Show Top Tab Bar"** setting for an even more minimal UI.

### Active Card

Only one card is displayed at a time. The currently active source is reflected in the selected tab and the active card on screen.

### Card Layout

Each card occupies the full remaining panel space, enabling large, touch-friendly controls:

- **Gamepad Card**: Large gamepad visualization with LED status indicator
- **Joystick Card**: Large draggable joystick(s) centered on screen
- **Keyboard Card**: Large key tiles arranged in a grid

## Features

### Compact Design

- **Single Card at a Time**: Eliminates visual clutter and maximizes space for the active control
- **Minimal Settings**: Streamlined settings UI focused on essentials
- **Touch-Friendly**: Larger control targets suitable for touch screens
- **Responsive**: Automatically scales controls to fit the panel size

### Output Configuration

- **Joy Topic**: Configurable ROS topic name for `sensor_msgs/Joy` output
- **Twist Topic**: Optional `geometry_msgs/Twist` output
- **Automatic Switching**: Changing tabs automatically switches the active data source and publishes from the new source

### Gamepad Controls

- **Controller Selection**: Pick from connected gamepads via settings
- **Mapping Profiles**: Xbox, PS5, Steam Deck, or generic mappings
- **LED Status Indicator**: Real-time visual feedback (red = disconnected, yellow = idle, green = active input)
- **Deadzone**: Configurable stick deadzone with on/off toggle
- **Visualization**: Live bar chart or plot view of axes and buttons

### Keyboard Controls

- **Layout Selection**: WASD or arrow-key layouts
- **Large Key Tiles**: Easy-to-tap key indicators
- **Live Feedback**: Real-time highlighting of pressed keys

### Joystick Controls

- **Responsive Sizing**: Automatically scales to fit available panel space
- **Size Presets**: Manual override with xs, sm, md, lg, or xl options
- **Axis Modes**: X-only, Y-only, or both axes
- **Sticky Mode**: Hold last position or snap to center on release
- **Dual Joystick**: Optional second joystick for dual-stick control
- **Touch-Optimized**: Works smoothly with mouse, trackpad, or touch input

### Settings

- **Active Card**: Select the currently visible/active card (also changeable via tab bar)
- **Show Top Tab Bar**: Toggle the tab bar visibility
- **Per-Source Settings**: Gamepad selection, joystick size, keyboard layout, etc.

## Settings Reference

Access all panel settings from the Foxglove settings sidebar under **ASLZ Control Lite**:

### Display

- **Show Top Tab Bar**: Show or hide the tab bar (default: `true`)
- **Active Card**: Select which card is displayed (updated when you click a tab)

### Gamepad

- **Gamepad ID**: Select which connected gamepad to use
- **GP→Joy Mapping**: Choose a controller mapping (Xbox, PS5, Steam Deck, Generic)
- **Stick Deadzone**: Enable/disable stick axis deadzone filtering
- **Deadzone Value**: Threshold for deadzone (default 0.08)

### Joystick

- **Size**: Size preset (xs to xl or auto)
- **Left Axis Mode**: Axis locking for left stick (X, Y, or both unlocked)
- **Right Axis Mode**: Axis locking for right stick (X, Y, or both unlocked)
- **Sticky Mode**: Hold position after release or snap to center
- **Dual Joystick**: Enable or disable second joystick

### Keyboard

- **Key Layout**: WASD or arrow-key layout

### Output

- **Joy Topic**: ROS topic for Joy output
- **Show Gamepad** / **Show Joystick** / **Show Keyboard**: Control which tabs are visible

No Twist mapping or advanced settings are exposed in the Lite panel to maintain a focused, minimal interface. For advanced control configurations, use the full **ASLZ Control** panel instead.

## Usage

1. **Launch** the ASLZ Control Lite panel in Foxglove Studio
2. **Click a Tab** to switch between Gamepad, Joystick, and Keyboard controls
3. **Interact** with the large, focused control card on screen
4. **Adjust Settings** via the Foxglove settings sidebar (e.g., gamepad mapping, joystick size)
5. **Publish**: The active card sources automatically publish to your configured topic

## Tips

- **Hide Unused Tabs**: In settings, uncheck sources you don't need to simplify the tab bar
- **Hide Tab Bar**: If using only one source, disable the tab bar for a minimalist UI

## Development

For local UI development and fast iteration, use the development harness:

- [Development Harness](DEV_HARNESS.md)
- Run with `pnpm run dev` and test Lite mode directly from the harness mode toggle.
