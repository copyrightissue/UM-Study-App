import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const credentialsFile = path.resolve(__dirname, 'credentials.json'); // Same file as in signup

test('User can create a new class', async ({ page }) => {
    // Ensure the credentials file exists
    if (!fs.existsSync(credentialsFile)) {
        throw new Error('❌ Signup must run first! No credentials found.');
    }

    // Read stored credentials
    const { email, password } = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));


    // Go to the login page
    await page.goto('https://studybuddy-1b01f.web.app');

    // Fill out the login form
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for successful login redirection
    await page.waitForURL('**/dashboard-teacher.html', { timeout: 5000 });

    // Verify login success
    await expect(page).toHaveURL(/dashboard-teacher\.html/);

    await page.click('text="Create New Class"');
    await page.fill('input[name="course_code"]', "CSCI" + String(email).slice(2,5));
    await page.fill('input[name="name"]', "TestClass");
});
