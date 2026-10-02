const { defineConfig } = require('@playwright/test')
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:3001',
    headless: true,
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
        : {})
    },
    trace: 'retain-on-failure'
  }
})
