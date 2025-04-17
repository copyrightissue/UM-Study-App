const { getAllNotesForClass } = require('../index');
const admin = require('firebase-admin');

// Mock Firestore
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn()
}));

const db = admin.firestore();

describe('getAllNotesForClass function', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    test("should return 400 if course_code is missing", async () => {
        await getAllNotesForClass(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing required search parameter: course_code" });
    });

    test("should return empty notes array if no notes found", async () => {
        req.query = { course_code: "CSCI101" };
        admin.firestore().get.mockResolvedValueOnce({ empty: true });

        await getAllNotesForClass(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ notes: [] });
    });

    test("should return notes if found", async () => {
        req.query = { course_code: "CSCI101" };
        const mockDocs = [
            { id: "note1", data: () => ({ title: "Note 1", content: "Content 1" }) },
            { id: "note2", data: () => ({ title: "Note 2", content: "Content 2" }) }
        ];
        admin.firestore().get.mockResolvedValueOnce({
            empty: false,
            docs: mockDocs
        });

        await getAllNotesForClass(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            notes: [
                { id: "note1", title: "Note 1", content: "Content 1" },
                { id: "note2", title: "Note 2", content: "Content 2" }
            ]
        });
    });

    test("should handle unexpected errors", async () => {
        req.query = { course_code: "CSCI101" };
        admin.firestore().get.mockRejectedValueOnce(new Error("Firestore failed"));

        await getAllNotesForClass(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Firestore failed" });
    });
});
