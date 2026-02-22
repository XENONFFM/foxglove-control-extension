import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function webpack(config) {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    "@": path.resolve(__dirname, "./src"),
  };

  config.module = config.module || { rules: [] };
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.(png|jpg|jpeg|gif|svg)$/i,
    type: "asset/inline",
  });

  return config;
}

export default {
  webpack,
};
