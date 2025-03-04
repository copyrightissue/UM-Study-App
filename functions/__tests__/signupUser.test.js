const { signupUser } = require("../index");  // Import your signupUser function
const admin = require("firebase-admin");  // Make sure to access the admin module for mocking

// Mock Firestore and Firebase Authentication
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({
            exists: true,
            data: jest.fn().mockReturnValue({ password: "hashedpassword", role: "student" }),
        }),
    };

    const authMock = {
        createUser: jest.fn().mockResolvedValue({
            uid: "12345",  // Ensure this returns a uid
            email: "test@test.com",
            displayName: "John Doe",
        }),
        getUserByEmail: jest.fn().mockRejectedValue({ code: 'auth/user-not-found' }),  // Simulate non-existing email
    };

    return {
        initializeApp: jest.fn(),
        firestore: jest.fn().mockReturnValue(firestoreMock),
        auth: jest.fn().mockReturnValue(authMock),
    };
});

describe("signupUser", () => {
    it("should create a new user", async () => {
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

        // Mock Firebase Auth and Firestore
        admin.auth().createUser.mockResolvedValue({
            uid: "12345",  // Ensure this returns a uid
            email: "test@test.com",
            displayName: "John Doe",
        });

        await signupUser(req, res);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "User created successfully",
            userId: "12345",
        });
    });

    it("should return 400 when email already exists", async () => {
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

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email already in use.",
        });
    });
    it("should return 400 for missing required fields", async () => {
        const req = {
            body: {
                email: "test@test.com",
                // Missing fullName, studentID, password, etc.
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

});