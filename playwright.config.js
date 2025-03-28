const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'functions/__e2e__',  // Set the directory for Playwright tests
  testIgnore: ['**/*.test.js'], // Ignore Jest test files
  projects: [
    { name: 'Signup', testMatch: /signup\.spec\.js/ },
    { name: 'Login', testMatch: /login\.spec\.js/, dependencies: ['Signup'] },
    { name: 'CreateClass', testMatch: /createClass\.spec\.js/, dependencies: ['Signup'] },
  ],
  use:{
    launchOptions: {
      slowMo: process.env.SLOMO ? 1_000 : 0, // Add a 500ms delay between actions
    },
  },
});

