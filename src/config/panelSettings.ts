import {
  Topic,
  SettingsTreeAction,
  SettingsTreeFields,
  SettingsTreeNodes,
} from "@foxglove/extension";
import { produce } from "immer";
import * as _ from "lodash";

import { PanelConfig, PanelOptions } from "./types";
import { getGamepadJoyTransformOptions } from "../mappings/gamepadJoyTransforms";
import { getGamepadOptions } from "../mappings/gamepadLayoutMappings";

export function settingsActionReducer(
  prevConfig: PanelConfig,
  action: SettingsTreeAction,
): PanelConfig {
  return produce(prevConfig, (draft) => {
    if (action.action === "update") {
      const { path, value } = action.payload;
      _.set(draft, path.slice(1), value);
    }
  });
}

function buildInputMappingFields(
  sourceType: "sourceType" | "sourceIndex" | "scale" | "invert",
  fieldPath: string,
  fieldValue: string | number | boolean,
  currentGamepad?: Gamepad,
): SettingsTreeFields {
  const fields: SettingsTreeFields = {};

  if (sourceType === "sourceType") {
    fields[fieldPath] = {
      label: fieldPath.split(".").pop() ?? "Source Type",
      input: "select",
      value: fieldValue as string,
      options: [
        { label: "None", value: "none" },
        { label: "Axis", value: "axis" },
        { label: "Button", value: "button" },
      ],
    };
  } else if (sourceType === "sourceIndex") {
    const parentPath = fieldPath.substring(0, fieldPath.lastIndexOf("."));
    const configObj = _.get({} as PanelConfig, parentPath);
    const mappingSourceType = _.get(configObj, "sourceType");

    if (mappingSourceType === "axis" && currentGamepad) {
      fields[fieldPath] = {
        label: "Axis",
        input: "select",
        value: (fieldValue as number).toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (mappingSourceType === "button" && currentGamepad) {
      fields[fieldPath] = {
        label: "Button",
        input: "select",
        value: (fieldValue as number).toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    } else {
      fields[fieldPath] = {
        label: "Source Index",
        input: "number",
        value: fieldValue as number,
        disabled: true,
      };
    }
  } else if (sourceType === "scale") {
    fields[fieldPath] = {
      label: "Scale",
      input: "number",
      value: fieldValue as number,
    };
  } else if (sourceType === "invert") {
    fields[fieldPath] = {
      label: "Invert",
      input: "boolean",
      value: fieldValue as boolean,
    };
  }

  return fields;
}

export function settingsActionReducer(
  prevConfig: PanelConfig,
  action: SettingsTreeAction,
): PanelConfig {
  return produce(prevConfig, (draft) => {
    if (action.action === "update") {
      const { path, value } = action.payload;
      _.set(draft, path.slice(1), value);
    }
  });
}

export function buildSettingsTree(
  config: PanelConfig,
  topics?: readonly Topic[],
): SettingsTreeNodes {
  const options: PanelOptions = config.options;

  const dataSourceFields: SettingsTreeFields = {
    dataSource: {
      label: "Data Source",
      input: "select",
      value: config.dataSource,
      options: [
        {
          label: "Subscribed Joy Topic",
          value: "sub-joy-topic",
        },
        {
          label: "Gamepad",
          value: "gamepad",
        },
        {
          label: "Interactive",
          value: "interactive",
        },
        {
          label: "Keyboard",
          value: "keyboard",
        },
      ],
    },
    subJoyTopic: {
      label: "Subscribe. Joy Topic",
      input: "select",
      value: config.subJoyTopic,
      disabled: config.dataSource !== "sub-joy-topic",
      options: (topics ?? [])
        .filter((topic) => topic.schemaName === "sensor_msgs/msg/Joy")
        .map((topic) => ({
          label: topic.name,
          value: topic.name,
        })),
    },
    gamepadId: {
      label: "Gamepad ID",
      input: "select",
      value: config.gamepadId.toString(),
      disabled: config.dataSource !== "gamepad",
      options: options.availableControllers.map((gp: Gamepad) => ({
        label: gp.id,
        value: gp.index.toString(),
      })),
    },
    gamepadJoyTransform: {
      label: "GP->Joy Mapping",
      input: "select",
      value: config.gamepadJoyTransform,
      disabled: config.dataSource !== "gamepad",
      options: Object.entries(getGamepadJoyTransformOptions()).map(([key, { label }]) => ({
        label,
        value: key,
      })),
    },
  };
  const publishFields: SettingsTreeFields = {
    publishMode: {
      label: "Publish Mode",
      input: "boolean",
      value: config.publishMode,
      disabled: config.dataSource === "sub-joy-topic",
    },
    pubJoyTopic: {
      label: "Pub Joy Topic",
      input: "string",
      value: config.pubJoyTopic,
    },
    publishFrameId: {
      label: "Joy Frame ID",
      input: "string",
      value: config.publishFrameId,
    },
  };
  const displayFields: SettingsTreeFields = {
    displayMode: {
      label: "Display Mode",
      input: "select",
      value: config.displayMode,
      options: [
        {
          label: "Auto-Generated",
          value: "auto",
        },
        {
          label: "Custom Display",
          value: "custom",
        },
      ],
    },
    layoutName: {
      label: "Layout",
      input: "select",
      disabled: config.displayMode === "auto",
      value: config.layoutName,
      options: getGamepadOptions(),
    },
    debugGamepad: {
      label: "Debug Gamepad",
      input: "boolean",
      value: config.debugGamepad,
    },
  };

  const getCurrentGamepad = (): Gamepad | undefined => {
    return options.availableControllers.find((gp) => gp.index === config.gamepadId);
  };

  const buildTwistMappingFields = (): SettingsTreeNodes => {
    const twistFields: SettingsTreeNodes = {};
    const currentGamepad = getCurrentGamepad();

    const twistFields_linear: SettingsTreeFields = {
      "twistMapping.linearX.sourceType": {
        label: "Linear X Source",
        input: "select",
        value: config.twistMapping.linearX.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.linearX.sourceType === "axis" && currentGamepad) {
      twistFields_linear["twistMapping.linearX.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.linearX.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.linearX.sourceType === "button" && currentGamepad) {
      twistFields_linear["twistMapping.linearX.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.linearX.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_linear["twistMapping.linearX.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.linearX.scale,
    };
    twistFields_linear["twistMapping.linearX.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.linearX.invert,
    };

    twistFields["linearX"] = {
      label: "Linear X",
      fields: twistFields_linear,
    };

    const twistFields_linearY: SettingsTreeFields = {
      "twistMapping.linearY.sourceType": {
        label: "Linear Y Source",
        input: "select",
        value: config.twistMapping.linearY.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.linearY.sourceType === "axis" && currentGamepad) {
      twistFields_linearY["twistMapping.linearY.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.linearY.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.linearY.sourceType === "button" && currentGamepad) {
      twistFields_linearY["twistMapping.linearY.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.linearY.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_linearY["twistMapping.linearY.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.linearY.scale,
    };
    twistFields_linearY["twistMapping.linearY.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.linearY.invert,
    };

    twistFields["linearY"] = {
      label: "Linear Y",
      fields: twistFields_linearY,
    };

    const twistFields_linearZ: SettingsTreeFields = {
      "twistMapping.linearZ.sourceType": {
        label: "Linear Z Source",
        input: "select",
        value: config.twistMapping.linearZ.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.linearZ.sourceType === "axis" && currentGamepad) {
      twistFields_linearZ["twistMapping.linearZ.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.linearZ.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.linearZ.sourceType === "button" && currentGamepad) {
      twistFields_linearZ["twistMapping.linearZ.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.linearZ.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_linearZ["twistMapping.linearZ.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.linearZ.scale,
    };
    twistFields_linearZ["twistMapping.linearZ.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.linearZ.invert,
    };

    twistFields["linearZ"] = {
      label: "Linear Z",
      fields: twistFields_linearZ,
    };

    const twistFields_angularX: SettingsTreeFields = {
      "twistMapping.angularX.sourceType": {
        label: "Angular X Source",
        input: "select",
        value: config.twistMapping.angularX.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.angularX.sourceType === "axis" && currentGamepad) {
      twistFields_angularX["twistMapping.angularX.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.angularX.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.angularX.sourceType === "button" && currentGamepad) {
      twistFields_angularX["twistMapping.angularX.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.angularX.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_angularX["twistMapping.angularX.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.angularX.scale,
    };
    twistFields_angularX["twistMapping.angularX.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.angularX.invert,
    };

    twistFields["angularX"] = {
      label: "Angular X",
      fields: twistFields_angularX,
    };

    const twistFields_angularY: SettingsTreeFields = {
      "twistMapping.angularY.sourceType": {
        label: "Angular Y Source",
        input: "select",
        value: config.twistMapping.angularY.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.angularY.sourceType === "axis" && currentGamepad) {
      twistFields_angularY["twistMapping.angularY.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.angularY.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.angularY.sourceType === "button" && currentGamepad) {
      twistFields_angularY["twistMapping.angularY.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.angularY.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_angularY["twistMapping.angularY.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.angularY.scale,
    };
    twistFields_angularY["twistMapping.angularY.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.angularY.invert,
    };

    twistFields["angularY"] = {
      label: "Angular Y",
      fields: twistFields_angularY,
    };

    const twistFields_angularZ: SettingsTreeFields = {
      "twistMapping.angularZ.sourceType": {
        label: "Angular Z Source",
        input: "select",
        value: config.twistMapping.angularZ.sourceType,
        options: [
          { label: "None", value: "none" },
          { label: "Axis", value: "axis" },
          { label: "Button", value: "button" },
        ],
      },
    };

    if (config.twistMapping.angularZ.sourceType === "axis" && currentGamepad) {
      twistFields_angularZ["twistMapping.angularZ.sourceIndex"] = {
        label: "Axis",
        input: "select",
        value: config.twistMapping.angularZ.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_, i) => ({
          label: `Axis ${i}`,
          value: i.toString(),
        })),
      };
    } else if (config.twistMapping.angularZ.sourceType === "button" && currentGamepad) {
      twistFields_angularZ["twistMapping.angularZ.sourceIndex"] = {
        label: "Button",
        input: "select",
        value: config.twistMapping.angularZ.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_, i) => ({
          label: `Button ${i}`,
          value: i.toString(),
        })),
      };
    }

    twistFields_angularZ["twistMapping.angularZ.scale"] = {
      label: "Scale",
      input: "number",
      value: config.twistMapping.angularZ.scale,
    };
    twistFields_angularZ["twistMapping.angularZ.invert"] = {
      label: "Invert",
      input: "boolean",
      value: config.twistMapping.angularZ.invert,
    };

    twistFields["angularZ"] = {
      label: "Angular Z",
      fields: twistFields_angularZ,
    };

    return twistFields;
  };

  const settings: SettingsTreeNodes = {
    dataSource: {
      label: "Data Source",
      fields: dataSourceFields,
    },
    publish: {
      label: "Publish",
      fields: publishFields,
    },
    display: {
      label: "Display",
      fields: displayFields,
    },
    twistMapping: {
      label: "Twist Mapping",
      children: buildTwistMappingFields(),
    },
  };

  return settings;
}
