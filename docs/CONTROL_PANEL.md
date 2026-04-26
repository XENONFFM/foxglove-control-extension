# ASLZ Control Panel

The **ASLZ Control** panel is the full-featured teleoperation interface for robots. It provides a comprehensive set of controls with multiple input sources (Gamepad, Keyboard, Joystick, and subscription monitoring) displayed simultaneously.

![Control Panel](images/1.webp)

The Control Panel presents all available input controls in a **stacked card layout**, allowing you to see and interact with multiple control sources at the same time. Exactly one source is active and publishes output at any given moment.

## Panel Layout

### Card Stack

The panel displays up to three collapsible/expandable cards:

- **Gamepad Card**: Connected USB/Bluetooth gamepad with real-time button/axis visualization
- **Keyboard Card**: WASD or arrow-key keyboard input with live key-press indicators
- **Joystick Card**: On-screen draggable virtual joystick with dual-stick support

### Controls

Each card has:

- **Power Button** (top-left): Toggles this card as the active input source
- **Settings Button** (top-right): Slides out a per-card settings panel
- **Close Button** (top-right): Hides the card from the main panel view

### Settings Panel

Accessed via the gear icon on each card, the settings panel slides in from the right side and contains card-specific configuration options (axis mappings, visualization modes, etc.).

## Features

### Output Configuration

- **Joy Topic**: Configurable ROS topic name for publishing `sensor_msgs/Joy` messages
- **Twist Topic**: Optional `geometry_msgs/Twist` output with full axis-to-field mapping
- **Twist Mapping**: Per-source (gamepad, keyboard, joystick) configuration of which input axes map to which Twist fields with scale and inversion

### Gamepad Controls

- **Controller Selection**: Auto-detects and allows manual selection of connected gamepads
- **Mapping Profiles**: Switch between Xbox, PS5, Steam Deck, or generic controller mappings
- **Visualization Modes**: Bar chart or plot display for axes and button states
- **Deadzone**: Configurable stick axis deadzone threshold with on/off toggle
- **Gamepad Layout Overlay**: Visual reference showing button/axis positions for the selected controller

### Keyboard Controls

- **Layout Selection**: Choose between WASD or arrow-key layouts
- **Live Visualization**: Real-time highlighting of currently pressed keys
- **Automatic Reset**: Outputs return to zero when keys are released

### Joystick Controls

- **Size Presets**: Five size options (xs, sm, md, lg, xl) for different screen sizes
- **Axis Modes**: Control X-only, Y-only, or both axes
- **Sticky Mode**: Optional toggle to keep the joystick at the last position after release (or snap to center)
- **Dual Joystick**: Enable a second joystick for independent left/right control

### Display & UI

- **Independent Toggle**: Show/hide each card independently from the Settings menu
- **Compact Settings**: Global Foxglove settings tree for all panel options
- **Theme Support**: Dark, light, and system theme modes
- **Responsive Layout**: Adapts to different panel sizes and orientations
- **Settings Persistence**: All settings are saved in the Foxglove settings tree and persist across sessions

## Settings Reference

Access all panel settings from the Foxglove settings sidebar under **ASLZ Control**:

### Global Settings

- **Data Source**: Select the active input (Gamepad, Keyboard, Joystick, or Subscribe)
- **Joy Topic**: ROS topic for Joy output (default: `/joy`)
- **Twist Topic**: Optional ROS topic for Twist output (default: `/cmd_vel`)

### Per-Card Visibility

- **Show Gamepad**: Toggle the Gamepad card visibility
- **Show Keyboard**: Toggle the Keyboard card visibility
- **Show Joystick**: Toggle the Joystick card visibility

### Gamepad Settings

- **Gamepad ID**: Select which connected gamepad to use
- **GP→Joy Mapping**: Choose a controller mapping profile
- **Stick Deadzone**: Enable/disable and set deadzone threshold
- **Visualization Mode**: Bar or plot display
- **Gamepad Layout**: Select layout overlay (Xbox or PS5)

### Keyboard Settings

- **Key Layout**: WASD or arrows
- **Twist Mapping**: Full axis-to-field configuration

### Joystick Settings

- **Size**: Predefined size or auto-fit
- **Axis Mode**: X, Y, or both
- **Sticky Mode**: Hold position or snap to center
- **Dual Joystick**: Enable second joystick
- **Twist Mapping**: Separate mapping configuration

### Twist Mapping (All Sources)

For each source (Gamepad, Keyboard, Joystick), configure mapping of input axes to Twist fields:

- **Linear X, Y, Z**: Position/translational axes
- **Angular X, Y, Z**: Rotation/angular axes

Per field, you can set:

- **Source**: Which input (axis or button) drives this field
- **Source Index**: Which axis (0–N) or button (0–M)
- **Scale**: Multiplier for the input value
- **Invert**: Flip the sign of the output

## Usage

1. **Launch** the ASLZ Control panel in Foxglove Studio
2. **Connect** a gamepad, or use keyboard/on-screen joystick
3. **Select Active Source** by pressing the power button on your preferred card
4. **Adjust Settings** via the gear icon on each card or the main settings sidebar
5. **Publish**: The active source continuously publishes to your configured topics

## Development

For local UI development without launching Foxglove Studio, use the development harness:

- [Development Harness](DEV_HARNESS.md)
- Run with `pnpm run dev` and switch between Full/Lite modes in the harness UI.
