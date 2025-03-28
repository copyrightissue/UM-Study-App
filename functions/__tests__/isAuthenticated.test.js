const admin = require('firebase-admin');
const { isAuthenticated } = require('../index');

// Comprehensive Firebase Admin SDK Mock
jest.mock('firebase-admin', () => {
    const mockGetUser = jest.fn();
    const mockGetDoc = jest.fn();

    return {
        initializeApp: jest.fn(),
        auth: jest.fn(() => ({
            getUser: mockGetUser
        })),
        firestore: jest.fn(() => ({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: mockGetDoc
                }))
            }))
        })),
        // Add these to match the original initialization
        _mockGetUser: mockGetUser,
        _mockGetDoc: mockGetDoc
    };
});

describe('isAuthenticated', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Create mock request and response objects
        mockReq = {
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('should return 400 if uid is missing', async () => {
        mockReq.query = {}; // Ensure no uid

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Missing user ID (uid) in query params"
        });
    });

    test('should return 401 if user ID is invalid', async () => {
        const mockUid = 'invalid-user';
        mockReq.query = { uid: mockUid };

        // Mock getUser to throw an error (user not found)
        admin._mockGetUser.mockRejectedValue(new Error('User not found'));

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            authenticated: false,
            message: "Invalid user ID"
        });
    });

    test('should return 404 if user profile is not found', async () => {
        const mockUid = 'existing-user';
        mockReq.query = { uid: mockUid };

        // Mock successful user retrieval
        admin._mockGetUser.mockResolvedValue({ uid: mockUid });

        // Mock non-existent user profile
        const mockUserDoc = {
            exists: false
        };
        admin._mockGetDoc.mockResolvedValue(mockUserDoc);

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            authenticated: false,
            message: "User profile not found"
        });
    });

    test('should return false for non-teacher user', async () => {
        const mockUid = 'student-user';
        mockReq.query = { uid: mockUid };

        // Mock successful user retrieval
        admin._mockGetUser.mockResolvedValue({ uid: mockUid });

        // Mock Firestore document retrieval for a non-teacher user
        const mockUserDoc = {
            exists: true,
            data: () => ({ role: 'student' })
        };
        admin._mockGetDoc.mockResolvedValue(mockUserDoc);

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            authenticated: false
        });
    });

    test('should return true for teacher user', async () => {
        const mockUid = 'teacher-user';
        mockReq.query = { uid: mockUid };

        // Mock successful user retrieval
        admin._mockGetUser.mockResolvedValue({ uid: mockUid });

        // Mock Firestore document retrieval for a teacher user
        const mockUserDoc = {
            exists: true,
            data: () => ({ role: 'teacher' })
        };
        admin._mockGetDoc.mockResolvedValue(mockUserDoc);

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            authenticated: true
        });
    });

    test('should handle unexpected errors with 500 status', async () => {
        const mockUid = 'error-user';
        mockReq.query = { uid: mockUid };

        // Simulate an unexpected error that throws an error in the try block
        admin._mockGetUser.mockImplementation(() => {
            throw new Error('Unexpected error');
        });

        await isAuthenticated(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Unexpected error'
        });
    });
});