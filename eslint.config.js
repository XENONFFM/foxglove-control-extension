// @ts-check

import foxglove from "@foxglove/eslint-plugin";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
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
      "prettier/prettier": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  globalIgnores(["src/components/ui/**"]),
);
