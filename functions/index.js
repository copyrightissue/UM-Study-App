const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

// const serviceAccount = require("./studybuddy-1b01f-firebase-adminsdk.json"); // Ensure the correct path

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp();

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;


exports.helloWorld = functions.https.onRequest((req, res) => { // LOAD BEARING FUNC, DON'T REMOVE THIS:
    res.send("Hello, World!");});                              // Removing this (while deprecated)
                                                               // requires further work on the firebase side
                                                               // such work isn't worth the effort right now.

/**
 * Signup Function: Creates a user in Firebase Auth and stores their profile in Firestore
 */
exports.signupUser = functions.https.onRequest(async (req, res) => {
    try {
        const { fullName, studentID, password, classes, role, email } = req.body;

        if (!email || !password || !fullName || !studentID || !role || !Array.isArray(classes)) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
        if (userRecord) {
            return res.status(400).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await admin.auth().createUser({
            email,
            password,
            displayName: fullName
        });

        await db.collection("users").doc(user.uid).set({
            fullName,
            studentID,
            password: hashedPassword,
            classes,
            role
        });

        res.status(201).json({ message: "User created successfully", userId: user.uid });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.loginUser = functions.https.onRequest(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const userRecord = await admin.auth().getUserByEmail(email);
        if (!userRecord) {
            return res.status(400).json({ message: "User not found." });
        }

        const userDoc = await db.collection("users").doc(userRecord.uid).get();
        if (!userDoc.exists) {
            return res.status(400).json({ message: "User profile not found." });
        }

        const userData = userDoc.data();

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const idToken = await admin.auth().createCustomToken(userRecord.uid);
        res.status(200).json({ message: "Login successful", token: idToken, uid: userRecord.uid });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.getUser = functions.https.onRequest(async (req, res) => {
    try {
        const { uid } = req.query;

        if (!uid) {
            return res.status(400).json({ message: "Missing user ID (uid) in query params" });
        }

        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: userDoc.data() });

    } catch (error) {
        console.error("getUser error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.isAuthenticated = functions.https.onRequest(async (req, res) => {
    try {
        const { uid } = req.query;

        if (!uid) {
            return res.status(400).json({ message: "Missing user ID (uid) in query params" });
        }

        const userRecord = await admin.auth().getUser(uid).catch(() => null);
        if (!userRecord) {
            return res.status(401).json({ authenticated: false, message: "Invalid user ID" });
        }

        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ authenticated: false, message: "User profile not found" });
        }

        const { role } = userDoc.data();
        const isTeacher = role && role.toLowerCase() === 'teacher';

        return res.status(200).json({ authenticated: isTeacher });

    } catch (error) {
        console.error("isAuthenticated error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.getAllClasses = functions.https.onRequest(async (req, res) => {
    try {
        const classesSnapshot = await db.collection("classes").get();

        if (classesSnapshot.empty) {
            return res.status(200).json({ classes: [] });
        }

        const classes = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json({ classes });

    } catch (error) {
        console.error("getAllClasses error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.createClass = functions.https.onRequest(async (req, res) => {
    try {
        const { uid, name, course_code } = req.body;

        if (!uid || !name || !course_code) {
            return res.status(400).json({ message: "Missing required fields: uid, name, or course_code" });
        }

        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const { role } = userDoc.data();

        if (!role || role.toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create classes." });
        }

        const classRef = await db.collection("classes").add({ name, course_code });

        res.status(201).json({ message: "Class created successfully", classId: classRef.id });

    } catch (error) {
        console.error("createClass error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.createNote = functions.https.onRequest(async (req, res) => {
    try {
        const { title, contents, course_code } = req.body;

        if (!title || !contents || !course_code) {
            return res.status(400).json({ message: "Missing required fields: title, contents, or course_code" });
        }

        const noteRef = await db.collection("notes").add({
            title,
            contents,
            course_code,
            upvotes: 0,
            downvotes: 0,
            votecount: 0
        });

        res.status(201).json({
            message: "Note created successfully",
            noteId: noteRef.id
        });

    } catch (error) {
        console.error("createNote error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.deleteNote = functions.https.onRequest(async (req, res) => {
    try {
        const { noteId } = req.body;

        if (!noteId) {
            return res.status(400).json({ message: "Missing required field: noteId" });
        }

        const noteRef = db.collection("notes").doc(noteId);
        const noteDoc = await noteRef.get();

        if (!noteDoc.exists) {
            return res.status(404).json({ message: "Note not found" });
        }

        const votersSnapshot = await noteRef.collection("voters").get();
        const batch = db.batch();

        votersSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        batch.delete(noteRef);
        await batch.commit();

        res.status(200).json({ message: "Note and associated votes deleted", noteId });

    } catch (error) {
        console.error("deleteNote error:", error);
        res.status(500).json({ error: error.message });
    }
});


exports.voteNote = functions.https.onRequest(async (req, res) => {
    try {
        const { noteId, userId, voteType } = req.body;

        if (!noteId || !userId || !["up", "down"].includes(voteType)) {
            return res.status(400).json({ message: "Missing or invalid fields" });
        }

        const noteRef = db.collection("notes").doc(noteId);
        const voterRef = noteRef.collection("voters").doc(userId);

        const [noteSnap, voterSnap] = await Promise.all([
            noteRef.get(),
            voterRef.get()
        ]);

        if (!noteSnap.exists) {
            return res.status(404).json({ message: "Note not found" });
        }

        let upvotes = noteSnap.data().upvotes || 0;
        let downvotes = noteSnap.data().downvotes || 0;

        if (!voterSnap.exists) {
            await voterRef.set({ votetype: voteType });
            if (voteType === "up") upvotes++;
            if (voteType === "down") downvotes++;
        } else {
            const prevVote = voterSnap.data().votetype;
            if (prevVote === voteType) {
                return res.status(200).json({ message: "Vote unchanged" });
            }

            await voterRef.update({ votetype: voteType });

            if (prevVote === "up") upvotes--;
            if (prevVote === "down") downvotes--;
            if (voteType === "up") upvotes++;
            if (voteType === "down") downvotes++;
        }

        const votecount = upvotes - downvotes;

        await noteRef.update({ upvotes, downvotes, votecount });

        res.status(200).json({ message: "Vote recorded", upvotes, downvotes, votecount });

    } catch (error) {
        console.error("voteNote error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.getAllNotesForClass = functions.https.onRequest(async (req, res) => {
    try {
        const { course_code } = req.query;

        if (!course_code) {
            return res.status(400).json({ message: "Missing required search parameter: course_code" });
        }

        const notesSnapshot = await db.collection("notes").where("course_code", "==", course_code).get();

        if (notesSnapshot.empty) {
            return res.status(200).json({ notes: [] });
        }

        const notes = notesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        res.status(200).json({ notes });

    } catch (error) {
        console.error("getAllNotesForClass error:", error);
        res.status(500).json({ error: error.message });
    }
});
