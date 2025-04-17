const { deleteNote } = require('../index');
const admin = require('firebase-admin');

jest.mock("firebase-admin", () => {
    return {
        initializeApp: jest.fn(),
        firestore: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            get: jest.fn(),
            batch: jest.fn().mockReturnValue({
                delete: jest.fn(),
                commit: jest.fn()
            })
        })
    };
});

const db = admin.firestore();

describe('deleteNote function', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test("should return 400 if noteId is missing", async () => {
        req.body = {}; // No noteId provided

        await deleteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required field: noteId"
        });
    });

    test("should return 404 if note does not exist", async () => {
        req.body = { noteId: "abc123" };

        db.collection().doc().get.mockResolvedValue({ exists: false });

        await deleteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Note not found"
        });
    }
    );

    test("should delete note and associated votes and return 200", async () => {
        req.body = { noteId: "abc123" };

        // Mock Firestore document reference
        const mockNoteRef = {
            get: jest.fn().mockResolvedValue({ exists: true }),
            collection: jest.fn()
        };

        // Mock the collection method
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue(mockNoteRef)
        });

        // Mock voter collection 
        const mockVoterDocs = [
            { ref: { id: "voter1" } },
            { ref: { id: "voter2" } }
        ];

        const mockVotersSnapshot = {
            forEach: jest.fn(callback => {
                mockVoterDocs.forEach(doc => callback(doc));
            })
        };

        // Set up the collection query mock
        mockNoteRef.collection.mockReturnValue({
            get: jest.fn().mockResolvedValue(mockVotersSnapshot)
        });

        // Mock the batch and its methods
        const mockBatch = {
            delete: jest.fn(),
            commit: jest.fn().mockResolvedValue(undefined)
        };
        db.batch.mockReturnValue(mockBatch);

        // Call deleteNote function
        await deleteNote(req, res);

        // Check if the response status and json are correct
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Note and associated votes deleted",
            noteId: "abc123"
        });

        // Verify that batch.delete was called 3 times (2 voters + 1 note)
        expect(mockBatch.delete).toHaveBeenCalledTimes(3);

        // Ensure that commit was called
        expect(mockBatch.commit).toHaveBeenCalled();
    });

    test("should handle Firestore errors", async () => {
        req.body = { noteId: "abc123" };

        // Simulate a Firestore error
        db.collection().doc().get.mockRejectedValue(new Error("Firestore error"));

        await deleteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Firestore error" });
    });
});
