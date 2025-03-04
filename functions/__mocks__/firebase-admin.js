// __mocks__/firebase-admin.js
const admin = {
    initializeApp: jest.fn(),  // Mock initializeApp to prevent it from executing
    auth: jest.fn(() => ({
        getUserByEmail: jest.fn(),
        createUser: jest.fn(),
    })),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                set: jest.fn().mockResolvedValue(),
                get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ password: "hashed" }) }),
            })),
        })),
    })),
};

module.exports = admin;
