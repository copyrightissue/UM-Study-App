// __mocks__/firebase-admin.js
const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn()
};

const authMock = {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createCustomToken: jest.fn().mockResolvedValue("mocked-token") // Mock createCustomToken
};

module.exports = {
    initializeApp: jest.fn(), // Mock initializeApp to prevent it from executing
    firestore: jest.fn(() => firestoreMock),
    auth: jest.fn(() => authMock), // Ensure authMock is used
    credential: {
        cert: jest.fn(() => "mocked-credential")
    }
};
