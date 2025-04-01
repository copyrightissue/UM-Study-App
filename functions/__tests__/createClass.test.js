const { createClass } = require('../index');
const admin = require('firebase-admin');

// Mock Firebase Admin and Firestore
jest.mock('firebase-admin', () => {
    const mockFirestore = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn(),
        add: jest.fn(),
    };

    return {
        initializeApp: jest.fn(),
        firestore: () => mockFirestore
    };
});

const db = admin.firestore();

describe('createClass', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });
    test('should return 400 if missing required fields', async () => {
        req.body = { uid: '12345' }; // Missing name and course_code

        await createClass(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing required fields: uid, name, or course_code" });
    });
    test('should return 404 if user not found', async () => {
        req.body = { uid: '12345', name: 'Math', course_code: 'MATH101' };

        db.collection().doc().get.mockResolvedValue({ exists: false });

        await createClass(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
    test('should return 403 if user is not a teacher', async () => {
        req.body = { uid: '12345', name: 'Math', course_code: 'MATH101' };

        db.collection().doc().get.mockResolvedValue({
            exists: true,
            data: () => ({ role: 'student' })
        });

        await createClass(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Only teachers can create classes." });
    });
    test('should create class and return 201', async () => {
        req.body = { uid: '12345', name: 'Math', course_code: 'MATH101' };

        db.collection().doc().get.mockResolvedValue({
            exists: true,
            data: () => ({ role: 'teacher' })
        });

        db.collection().add.mockResolvedValue({ id: 'class123' });

        await createClass(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Class created successfully", classId: 'class123' });
    });
    test('should return 500 on error', async () => {
        req.body = { uid: '12345', name: 'Math', course_code: 'MATH101' };

        db.collection().doc().get.mockRejectedValue(new Error('Database error'));

        await createClass(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    }
    );
})