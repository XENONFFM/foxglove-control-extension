import type * as React from "react";

import { ControllerRendererProps } from "../types";
import { GenericController } from "./GenericController";

export function XboxController({ ctx }: ControllerRendererProps): React.ReactElement {
  return <GenericController ctx={ctx} swapLeftControls />;
}