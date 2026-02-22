// @ts-check

import foxglove from "@foxglove/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config({
  files: ["src/**/*.ts", "src/**/*.tsx"],
  extends: [foxglove.configs.base, foxglove.configs.react, foxglove.configs.typescript],
  languageOptions: {
    globals: {
      ...globals.es2020,
      ...globals.browser,
    },
    parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: __dirname,
    },
  },
  rules: {
    "react-hooks/exhaustive-deps": "error",
  },
});
