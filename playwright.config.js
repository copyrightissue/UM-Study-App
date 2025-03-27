const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'functions/__e2e__',  // Set the directory for Playwright tests
  testIgnore: ['**/*.test.js'], // Ignore Jest test files
  Use:{
    launchOptions: {
      slowMo: 2_000, // Add a 500ms delay between actions
    },
  },
});

