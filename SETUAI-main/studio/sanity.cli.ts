import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "c243kj7a",
    dataset: "production",
  },
  vite: {
    envDir: ".",
  },
  typegen: {
    path: "../web/src/**/*.{ts,tsx}",
    schema: "schemaTypes",
    generates: "../web/sanity.types.ts",
  },
});
