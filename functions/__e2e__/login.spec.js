import { test, expect } from '@playwright/test';

test('StudyBuddyLogin page should have required elements', async ({ page }) => {
  await page.goto('https://studybuddy-1b01f.web.app/'); 
  
  // Check page title
  //await expect(page.locator('h1')).toHaveText('📘 Study Buddy');

  // Check input fields
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();

  // Check Login button
  await expect(page.locator('button[type="submit"]')).toHaveText('Login');

  // Check "New Account" link
  await expect(page.locator('a[href="/signup.html"]')).toBeVisible();
});
