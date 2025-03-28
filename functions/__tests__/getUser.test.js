const { getUser } = require('../index');
const admin = require('firebase-admin');

// Mock Firebase Admin and Firestore
jest.mock('firebase-admin', () => {
    const mockFirestore = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn()
    };

    return {
        initializeApp: jest.fn(),
        firestore: () => mockFirestore
    };
});

describe('getUser', () => {
    let mockReq, mockRes;
    let mockFirestore;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup mock request and response
        mockReq = {
            query: { uid: 'testUser123' }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Get the mocked Firestore methods
        mockFirestore = admin.firestore();
    });

    test('should return 400 if uid is missing', async () => {
        mockReq.query.uid = undefined;

        await getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Missing user ID (uid) in query params" });
    });

    test('should return 404 if user not found', async () => {
        // Mock Firestore to return a non-existent document
        mockFirestore.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({ exists: false })
            })
        });

        await getUser(mockReq, mockRes);

        expect(mockFirestore.collection).toHaveBeenCalledWith("users");
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test('should return user data for valid uid', async () => {
        const mockUserData = {
            fullName: 'Test User',
            studentID: '12345'
        };

        // Mock Firestore to return an existing document
        mockFirestore.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                    exists: true,
                    data: () => mockUserData
                })
            })
        });

        await getUser(mockReq, mockRes);

        expect(mockFirestore.collection).toHaveBeenCalledWith("users");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ user: mockUserData });
    });

    test('should return 500 for unexpected errors', async () => {
        // Mock Firestore to throw an error
        mockFirestore.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockRejectedValue(new Error("Firestore error"))
            })
        });

        await getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Firestore error" });
    });
});