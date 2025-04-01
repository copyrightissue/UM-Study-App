const { getAllClasses } = require('../index');
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

const db = admin.firestore();

describe('getAllClasses', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    }
    );

    test('should return 200 and empty array if no classes found', async () => {
        db.collection().get.mockResolvedValue({ empty: true, docs: [] });

        await getAllClasses(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ classes: [] });
    }
    );
    test('should return 200 and classes if found', async () => {
        const mockClasses = [
            { id: '1', data: () => ({ name: 'Math' }) },
            { id: '2', data: () => ({ name: 'Science' }) }
        ];

        db.collection().get.mockResolvedValue({ empty: false, docs: mockClasses });

        await getAllClasses(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ classes: mockClasses.map(doc => ({ id: doc.id, ...doc.data() })) });
    }
    );
    test('should return 500 on error', async () => {
        db.collection().get.mockRejectedValue(new Error('Database error'));

        await getAllClasses(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    }
    );
    test('should return 500 on unexpected error', async () => {
        db.collection().get.mockRejectedValue(new Error('Unexpected error'));

        await getAllClasses(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
    }
    );
});