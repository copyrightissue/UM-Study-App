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
    await page.goto('http://localhost:5000');

    // Fill out the login form
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Click the login button
    await page.click('button[type="submit"]');


    await page.waitForURL('**/dashboard-student.html');
    await expect(page).toHaveURL(/dashboard-student\.html/);

    await page.reload();
    

    await page.click('button:has-text("View All Classes")'); // Click the "View All Classes" button
 
    await page.click('button:has-text("Go to Dashboard")'); // Click the "Go to Dashboard" button
    
    await page.click('button:has-text("Create New Class")'); // Click the "Create Class" button

    // Function to generate a random 3-letter course code
    function generateRandomCourseCode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
        const randomNumbers = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
        return randomLetters + randomNumbers;
    }

    // Function to generate a random class name
    function generateRandomClassName() {
        const classNames = ['Math', 'Science', 'History', 'Art', 'Biology', 'Physics', 'Chemistry'];
        return classNames[Math.floor(Math.random() * classNames.length)];
    }

    // Loop to generate and fill the form
    for (let i = 0; i < 1; i++) { // Adjust the loop count if you need multiple classes
        const courseCode = generateRandomCourseCode();
        const className = generateRandomClassName();

        // Fill out the class form
        console.log(`Filling out form for class: ${className}, Course Code: ${courseCode}`);
        await page.fill('input[name="course_code"]', courseCode);
        await page.fill('input[name="name"]', className);

        // Submit the form (if applicable)
        await page.click('button[type="submit"]'); // Adjust selector if needed
    }
});
