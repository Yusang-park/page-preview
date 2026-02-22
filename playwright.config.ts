import { defineConfig, devices } from "playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["html"], ["list"]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm dev",
      url: "http://127.0.0.1:4100",
      timeout: 120000,
      reuseExistingServer: false,
    },
  ],
});
