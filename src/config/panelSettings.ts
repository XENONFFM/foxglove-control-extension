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
      const pathString = path.slice(1).join(".");
      const lastKey = path[path.length - 1];
      const shouldParseNumber =
        typeof value === "string" &&
        (lastKey === "gamepadId" || lastKey === "sourceIndex" || lastKey === "scale");
      const normalizedValue = shouldParseNumber ? Number(value) : value;
      _.set(draft, pathString, normalizedValue);
    }
  });
}

const sourceTypeOptions = [
  { label: "None", value: "none" },
  { label: "Axis", value: "axis" },
  { label: "Button", value: "button" },
];

const twistFieldDefinitions = [
  { key: "linearX", label: "Linear X" },
  { key: "linearY", label: "Linear Y" },
  { key: "linearZ", label: "Linear Z" },
  { key: "angularX", label: "Angular X" },
  { key: "angularY", label: "Angular Y" },
  { key: "angularZ", label: "Angular Z" },
];

function buildTwistMappingFields(
  config: PanelConfig,
  currentGamepad?: Gamepad,
): SettingsTreeFields {
  const fields: SettingsTreeFields = {};

  twistFieldDefinitions.forEach(({ key, label }) => {
    const mapping = config.twistMapping[key as keyof typeof config.twistMapping];
    const basePath = `twistMapping.${key}`;
    const sourceIndexLabel = mapping.sourceType === "button" ? "Button" : "Axis";

    fields[`${basePath}.sourceType`] = {
      label: `${label} Source`,
      input: "select",
      value: mapping.sourceType,
      options: sourceTypeOptions,
    };

    if (mapping.sourceType === "none") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} ${sourceIndexLabel}`,
        input: "number",
        value: mapping.sourceIndex,
        disabled: true,
      };
    } else if (currentGamepad && mapping.sourceType === "axis") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} Axis`,
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_value, index) => ({
          label: `Axis ${index}`,
          value: index.toString(),
        })),
      };
    } else if (currentGamepad && mapping.sourceType === "button") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} Button`,
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_value, index) => ({
          label: `Button ${index}`,
          value: index.toString(),
        })),
      };
    } else {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} ${sourceIndexLabel}`,
        input: "number",
        value: mapping.sourceIndex,
      };
    }

    fields[`${basePath}.scale`] = {
      label: `${label} Scale`,
      input: "number",
      value: mapping.scale,
    };

    fields[`${basePath}.invert`] = {
      label: `${label} Invert`,
      input: "boolean",
      value: mapping.invert,
    };
  });

  return fields;
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
    publishTwistMode: {
      label: "Publish Twist",
      input: "boolean",
      value: config.publishTwistMode,
    },
    pubTwistTopic: {
      label: "Pub Twist Topic",
      input: "string",
      value: config.pubTwistTopic,
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

  const currentGamepad =
    config.dataSource === "gamepad"
      ? options.availableControllers.find((gp) => gp.index === config.gamepadId)
      : undefined;
  const twistMappingFields = buildTwistMappingFields(config, currentGamepad);

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
      fields: twistMappingFields,
    },
  };

  return settings;
}
