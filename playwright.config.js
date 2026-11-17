import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  expect: { timeout: 7_500 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4176/NLGridAtlas/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"], channel: "chrome" } }
  ],
  webServer: {
    command: "node scripts/serve-test-build.mjs",
    url: "http://127.0.0.1:4176/NLGridAtlas/index.html",
    reuseExistingServer: false,
    timeout: 30_000
  }
});
