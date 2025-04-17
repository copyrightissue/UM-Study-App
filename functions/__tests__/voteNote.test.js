const { voteNote } = require('../index');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { mockRequest, mockResponse } = require('mock-req-res');

// Mock Firestore
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn()
}));

const db = admin.firestore();

describe('voteNote function', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
            send: jest.fn(),

        };
    });

    test("should return 400 if missing fields or invalid voteType", async () => {
        // Test: missing noteId
        req.body = { userId: "user123", voteType: "up" };
        await voteNote(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing or invalid fields" });

        // Reset mock counts between test cases
        jest.clearAllMocks();

        // Test: missing userId
        req.body = { noteId: "note123", voteType: "up" };
        await voteNote(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing or invalid fields" });

        // Reset mock counts again
        jest.clearAllMocks();

        // Test: invalid voteType
        req.body = { noteId: "note123", userId: "user123", voteType: "invalid" };
        await voteNote(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing or invalid fields" });
    });

    test("should return 404 if note not found", async () => {
        // Mock Firestore to simulate note not found
        admin.firestore().get.mockResolvedValueOnce({ exists: false });
        req.body = { noteId: "invalidNoteId", userId: "user123", voteType: "up" };
        await voteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Note not found" });
    });

    test("should add vote when user hasn't voted", async () => {
        // Mock Firestore to simulate note and voter not found
        admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ upvotes: 0, downvotes: 0 }) }); // Note exists
        admin.firestore().get.mockResolvedValueOnce({ exists: false }); // Voter doesn't exist

        req.body = { noteId: "note123", userId: "user123", voteType: "up" };

        await voteNote(req, res);

        expect(admin.firestore().set).toHaveBeenCalledWith({ votetype: "up" });
        expect(admin.firestore().update).toHaveBeenCalledWith({ upvotes: 1, downvotes: 0, votecount: 1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Vote recorded", upvotes: 1, downvotes: 0, votecount: 1 });
    });

    test("should return 200 if user votes the same type again (no change)", async () => {
        // Mock Firestore to simulate user has voted before
        admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ upvotes: 1, downvotes: 0 }) }); // Note exists
        admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ votetype: "up" }) }); // Voter has voted "up"

        req.body = { noteId: "note123", userId: "user123", voteType: "up" };

        await voteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Vote unchanged" });
    });

    test("should update vote when user changes vote", async () => {
        // Mock Firestore to simulate note and voter
        admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ upvotes: 1, downvotes: 0 }) }); // Note exists
        admin.firestore().get.mockResolvedValueOnce({ exists: true, data: () => ({ votetype: "up" }) }); // Voter has voted "up"

        req.body = { noteId: "note123", userId: "user123", voteType: "down" };

        await voteNote(req, res);

        expect(admin.firestore().update).toHaveBeenCalledWith({ upvotes: 0, downvotes: 1, votecount: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Vote recorded", upvotes: 0, downvotes: 1, votecount: -1 });
    });

    test("should handle unexpected errors", async () => {
        // Simulate an error during the execution of the function
        admin.firestore().get.mockRejectedValueOnce(new Error("Database error"));

        req.body = { noteId: "note123", userId: "user123", voteType: "up" };

        await voteNote(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
})