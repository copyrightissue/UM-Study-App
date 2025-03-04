const { signupUser } = require("../index");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

// Mock the `admin.sdk.json` file (service account credentials)
jest.mock("../studybuddy-1b01f-firebase-adminsdk.json", () => ({
    type: "service_account",
    project_id: "studybuddy-1b01f",
    private_key_id: "fake-private-key-id",
    private_key: "-----BEGIN PRIVATE KEY-----\nfake-key\n-----END PRIVATE KEY-----\n",
    client_email: "fake-email@studybuddy-1b01f.iam.gserviceaccount.com",
    client_id: "fake-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/fake-email%40studybuddy-1b01f.iam.gserviceaccount.com"
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
}));

// Mock Firestore and Firebase Authentication
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        set: jest.fn(),
    };

    const authMock = {
        createUser: jest.fn(),
        getUserByEmail: jest.fn(),
    };

    return {
        initializeApp: jest.fn(),
        firestore: jest.fn().mockReturnValue(firestoreMock),
        auth: jest.fn().mockReturnValue(authMock),
        credential: {
            cert: jest.fn(() => "mocked-credential")
        }
    };
});

describe("signupUser", () => {
    let mockFirestore;
    let mockAuth;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup mock dependencies
        mockAuth = admin.auth();
        mockFirestore = admin.firestore();
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
        mockAuth.getUserByEmail.mockRejectedValue(new Error('User not found'));
        mockAuth.createUser.mockResolvedValue({
            uid: "12345",
            email: "test@test.com",
            displayName: "John Doe",
        });

        // Mock bcrypt hashing
        bcrypt.hash.mockResolvedValue("hashedpassword");

        // Mock Firestore document set
        mockFirestore.collection().doc().set.mockResolvedValue();

        await signupUser(req, res);

        // Verify the response
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
        mockAuth.getUserByEmail.mockResolvedValue({
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

    test("should return 400 for missing required fields", async () => {
        const req = {
            body: {
                email: "test@test.com",  // Missing fullName, studentID, password, etc.
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
        mockAuth.getUserByEmail.mockRejectedValue(new Error('User not found'));

        // Simulate failure in createUser
        mockAuth.createUser.mockRejectedValue(new Error("Firebase error"));

        await signupUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Firebase error",
        });
    });
});