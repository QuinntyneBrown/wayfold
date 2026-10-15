import path from "node:path";
import { defineConfig } from "vitest/config";

// Next skips .env.local under NODE_ENV=test, so read it directly (CI sets the variables instead).
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["tests/api/**/*.test.ts"],
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL! },
    globalSetup: ["tests/api/global-setup.ts"],
    setupFiles: ["tests/api/setup.ts"],
    fileParallelism: false,
  },
});
