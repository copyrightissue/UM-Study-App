const { signupUser } = require("../index");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

// Mock Firestore and Firebase Authentication
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                set: jest.fn(),
            })),
        })),
    };

    const authMock = {
        createUser: jest.fn(),
        getUserByEmail: jest.fn(),
    };

    return {
        initializeApp: jest.fn(),
        firestore: jest.fn(() => firestoreMock),
        auth: jest.fn(() => authMock),
        credential: {
            cert: jest.fn(() => "mocked-credential"),
        },
    };
});

describe("signupUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should create a new user", async () => {
        const req = {
            body: {
                fullName: "John Doe",
                studentID: "12345",
                password: "password123",
                classes: ["CS101"],
                role: "student",
                email: "test@test.com",
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock Firebase Auth and Firestore operations
        admin.auth().getUserByEmail.mockRejectedValue(new Error("User not found"));
        admin.auth().createUser.mockResolvedValue({
            uid: "12345",
            email: "test@test.com",
            displayName: "John Doe",
        });

        // Mock bcrypt hashing inline
        jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

        await signupUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "User created successfully",
            userId: "12345",
        });
    });

    test("should return 400 when email already exists", async () => {
        const req = {
            body: {
                fullName: "John Doe",
                studentID: "12345",
                password: "password123",
                classes: ["CS101"],
                role: "student",
                email: "test@test.com",
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock getUserByEmail to simulate an existing email
        admin.auth().getUserByEmail.mockResolvedValue({
            uid: "12345",
            email: "test@test.com",
            displayName: "John Doe",
        });

        await signupUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email already in use.",
        });
    });

    test("should return 400 for missing required fields", async () => {
        const req = {
            body: {
                email: "test@test.com", // Missing fullName, studentID, password, etc.
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await signupUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields",
        });
    });

    test("should return 500 when createUser fails", async () => {
        const req = {
            body: {
                fullName: "John Doe",
                studentID: "12345",
                password: "password123",
                classes: ["CS101"],
                role: "student",
                email: "test@test.com",
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock getUserByEmail to allow creating user
        admin.auth().getUserByEmail.mockRejectedValue(new Error("User not found"));

        // Simulate failure in createUser
        admin.auth().createUser.mockRejectedValue(new Error("Firebase error"));

        await signupUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Firebase error",
        });
    });
});
