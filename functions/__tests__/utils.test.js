// functions/__tests__/utils.test.js
const { isEmailValid } = require('../utils');

describe('Email validation', () => {
    test('Valid email returns true', () => {
        const email = 'test@example.com';
        expect(isEmailValid(email)).toBe(true);
    });

    test('Invalid email returns false', () => {
        const email = 'invalidEmail';
        expect(isEmailValid(email)).toBe(false);
    });
});
