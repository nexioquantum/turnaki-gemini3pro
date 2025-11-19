import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOSTNAME = process.env.HOSTNAME ?? "127.0.0.1";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://${HOSTNAME}:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    headless: true,
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --hostname ${HOSTNAME} --port ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          HOSTNAME,
          PORT: String(PORT),
        },
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

