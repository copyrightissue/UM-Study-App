import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const credentialsFile = path.resolve(__dirname, 'credentials.json'); // Store credentials

// Function to generate a valid NetID (two letters + seven digits)
function generateNetID() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randomLetters = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
    const randomNumbers = Math.floor(1000000 + Math.random() * 9000000); // 7-digit number
    return randomLetters + randomNumbers;
}

test('User can sign up', async ({ page }) => {
    const netID = generateNetID();
    const fullName = 'Test User';
    const email = `${netID}@example.com`; // Email based on NetID
    const password = 'TestPassword123!';

    // Go to the signup page
    await page.goto('http://localhost:5000');

     // Navigate to the sign in spage
    await page.click('text="New Account"');

    // Fill out the signup form
    await page.fill('input[name="fullName"]', fullName);
    await page.fill('input[name="netID"]', netID);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Select "Teacher" from the dropdown
    await page.selectOption('select[name="role"]', 'teacher');
    // Verify the selection
    const selectedValue = await page.$eval('select[name="role"]', el => el.value);
    expect(selectedValue).toBe('teacher');

    // Click the signup button
    await page.click('button[type="submit"]');



    // Save credentials to a file for later login
    fs.writeFileSync(credentialsFile, JSON.stringify({ email, password }));

    console.log(`✅ Signed up with: ${fullName}, Password: ${password}, Email: ${email}`);
});

