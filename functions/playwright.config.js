const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'functions/__e2e__',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5000', // Use Firebase Emulator for testing
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'firebase emulators:start',
    port: 5000, // Adjust based on your setup
    reuseExistingServer: true,
  },
});
