const { test, expect } = require('@playwright/test');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut, connectAuthEmulator } = require('firebase/auth');

// Firebase Emulator Config
const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'your-project-id',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://localhost:9099'); // Correct way to use emulator

test('User can sign up and log in', async ({ page }) => {
  await page.goto('/');

  // Fill the signup form
  await page.fill('#email', 'testuser@example.com');
  await page.fill('#password', 'password123');
  await page.click('#signup-button');

  // Check if redirected after signup
  await expect(page.locator('.welcome-message')).toHaveText('Welcome');

  // Log out
  await signOut(auth);

  // Log back in
  await signInWithEmailAndPassword(auth, 'testuser@example.com', 'password123');
  await expect(page.locator('.welcome-message')).toHaveText('Welcome back');
});
