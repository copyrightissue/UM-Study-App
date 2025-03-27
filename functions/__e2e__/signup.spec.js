const { test, expect } = require('@playwright/test');

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://studybuddy-1b01f.web.app/signup.html'); // Adjust this route if necessary
  });

  test('should fill and submit the signup form', async ({ page }) => {
    // Fill in the form fields
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="netID"]', 'jdoe123');
    await page.fill('input[name="email"]', 'jdoe@example.com');
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.selectOption('select[name="role"]', 'student');

    // Click the signup button
    await page.click('button[type="submit"]');

    // Expect a redirect or success alert
    await page.waitForURL('**/'); // Adjust based on expected behavior
  });

  test('should show an error if required fields are empty', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Expect some form validation messages to appear
    const fullNameError = page.locator('input[name="fullName"]:invalid');
    await expect(fullNameError).toBeVisible();
    
    const emailError = page.locator('input[name="email"]:invalid');
    await expect(emailError).toBeVisible();
  });
});
