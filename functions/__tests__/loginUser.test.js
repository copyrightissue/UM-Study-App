const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loginUser } = require("../index");

// Mock Firebase Admin and related libraries
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn()
    };

    const authMock = {
        getUserByEmail: jest.fn()
    };

    return {
        initializeApp: jest.fn(),
        firestore: jest.fn(() => firestoreMock),
        auth: jest.fn(() => authMock)
    };
});

// Mock bcrypt and jwt
jest.mock("bcryptjs", () => ({
    compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn()
}));

describe("loginUser", () => {
    let mockFirestore;
    let mockAuth;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup default successful mocks
        mockAuth = admin.auth();
        mockFirestore = admin.firestore();

        mockAuth.getUserByEmail.mockResolvedValue({
            uid: "12345",
            email: "test@test.com",
            displayName: "John Doe"
        });

        mockFirestore.collection().doc().get.mockResolvedValue({
            exists: true,
            data: () => ({
                password: "hashedpassword",
                role: "student"
            })
        });

        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("mocked-token");
    });

    test("should login a user successfully", async () => {
        const req = {
            body: {
                email: "test@test.com",
                password: "password123",
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await loginUser(req, res);

        // Verify the correct response was sent
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Login successful",
            token: "mocked-token"
        }));
    });

    test("should return 400 when user not found", async () => {
        const req = {
            body: {
                email: "test@test.com",
                password: "password123",
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock getUserByEmail to simulate a non-existing user
        mockAuth.getUserByEmail.mockResolvedValue(null);

        await loginUser(req, res);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found." });
    });

    test("should return 400 if email or password is missing", async () => {
        const req = {
            body: {
                email: "test@test.com",  // Missing password
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email and password are required",
        });
    });

    test("should return 401 for invalid password", async () => {
        const req = {
            body: {
                email: "test@test.com",
                password: "wrongpassword",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock bcrypt.compare to return false
        bcrypt.compare.mockResolvedValue(false);

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid password.",
        });
    });

    test("should return 400 if user profile is missing in Firestore", async () => {
        const req = {
            body: {
                email: "test@test.com",
                password: "password123",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Simulate no profile in Firestore
        mockFirestore.collection().doc().get.mockResolvedValue({
            exists: false,
        });

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "User profile not found.",
        });
    });

    test("should return 500 if JWT token generation fails", async () => {
        const req = {
            body: {
                email: "test@test.com",
                password: "password123",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Simulate JWT error
        jwt.sign.mockImplementation(() => {
            throw new Error("JWT generation error");
        });

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});