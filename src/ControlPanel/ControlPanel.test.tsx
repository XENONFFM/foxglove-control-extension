import { LayoutActions, PanelExtensionContext } from "@foxglove/extension";
import { render } from "@testing-library/react";

import { ControlPanel } from "./ControlPanel";

const mockDiv: HTMLDivElement = document.createElement("div");

// Mock the PanelExtensionContext
const mockContext: PanelExtensionContext = {
  subscribe: jest.fn(),
  watch: jest.fn(),
  unsubscribeAll: jest.fn(),
  saveState: jest.fn(),
  initialState: {
    pubJoyTopic: "/joy",
    publishJoy: false,
    publishTwistMode: false,
    pubTwistTopic: "/cmd_vel",
    dataSource: "gamepad",
    mapping_name: "Default",
    gamepadId: 0,
    panelElement: "MockPanelElement",
    layout: "MockLayout",
    sharedPanelState: "MockSharedPanelState",
  },
  panelElement: mockDiv,
  layout: {} as LayoutActions, // Provide a valid value for the layout property
  setParameter: jest.fn(),
  setSharedPanelState: jest.fn(),

  setVariable: jest.fn(),
  setPreviewTime: jest.fn(),
  subscribeAppSettings: jest.fn(),
  updatePanelSettingsEditor: jest.fn(),
  setDefaultPanelTitle: jest.fn(),
};

describe("ControlPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<ControlPanel context={mockContext} />);
  });
});
