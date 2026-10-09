const { defineConfig } = require('@playwright/test')
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:3001',
    // Optional private cookie state for protected preview QA; never commit this file.
    storageState: process.env.QA_STORAGE_STATE || undefined,
    headless: true,
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
        : {})
    },
    // Authenticated preview traces can contain access cookies.
    trace: process.env.QA_STORAGE_STATE ? 'off' : 'retain-on-failure'
  }
})
