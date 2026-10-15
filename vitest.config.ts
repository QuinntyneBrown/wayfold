import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "vitest/config";

loadEnvConfig(process.cwd());

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["tests/api/**/*.test.ts"],
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL! },
    fileParallelism: false,
  },
});
