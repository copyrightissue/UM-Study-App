const admin = require('firebase-admin');
const { createNote } = require('../index');

jest.mock('firebase-admin', () => {
    return {
        initializeApp: jest.fn(),
        firestore: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnThis(),
            add: jest.fn()
        })
    };
});

const db = admin.firestore();

describe('createNote function', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });
    test("should return 400 if title is missing", async () => {
        req.body = { contents: "This is the body of the note", course_code: "CSCI-391" }; // Missing title

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields: title, contents, or course_code"
        });
    });

    test("should return 400 if contents is missing", async () => {
        req.body = { title: "Sample Note", course_code: "CSCI-391" }; // Missing contents

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields: title, contents, or course_code"
        });
    });

    test("should return 400 if course_code is missing", async () => {
        req.body = { title: "Sample Note", contents: "This is the body of the note" }; // Missing course_code

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields: title, contents, or course_code"
        });
    });

    test("should return 400 if all required fields are missing", async () => {
        req.body = {}; // Missing all fields

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required fields: title, contents, or course_code"
        });
    });

    test("should create a note and return 201", async () => {
        req.body = {
            title: "Sample Note",
            contents: "This is the body of the note",
            course_code: "CSCI-391"
        };

        db.collection().add.mockResolvedValue({ id: "note123" });

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Note created successfully",
            noteId: "note123"
        });
    });

    test("should return 500 on error", async () => {
        req.body = {
            title: "Sample Note",
            contents: "This is the body of the note",
            course_code: "CSCI-391"
        };

        db.collection().add.mockRejectedValue(new Error("Database error"));

        await createNote(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Database error"
        });
    });
})