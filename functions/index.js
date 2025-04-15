const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

// const serviceAccount = require("./studybuddy-1b01f-firebase-adminsdk.json"); // Ensure the correct path

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp();

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

/**
 * Signup Function: Creates a user in Firebase Auth and stores their profile in Firestore
 */
exports.signupUser = functions.https.onRequest(async (req, res) => {
    try {
        const { fullName, studentID, password, classes, role, email } = req.body;

        if (!email || !password || !fullName || !studentID || !role || !Array.isArray(classes)) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if email already exists
        const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
        if (userRecord) {
            return res.status(400).json({ message: "Email already in use." });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in Firebase Authentication
        const user = await admin.auth().createUser({
            email,
            password,
            displayName: fullName
        });

        // Store user profile in Firestore using user.uid as the document ID (key)
        await db.collection("users").doc(user.uid).set({
            fullName,
            studentID,
            password: hashedPassword, // Store only hashed passwords
            classes,
            role
        });

        res.status(201).json({ message: "User created successfully", userId: user.uid });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Login Function: Verifies Firebase Authentication Token
 */
exports.loginUser = functions.https.onRequest(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Get user from Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);
        if (!userRecord) {
            return res.status(400).json({ message: "User not found." });
        }

        // Get user profile from Firestore
        const userDoc = await db.collection("users").doc(userRecord.uid).get();
        if (!userDoc.exists) {
            return res.status(400).json({ message: "User profile not found." });
        }

        const userData = userDoc.data();

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // Instead of generating a custom JWT, return Firebase's built-in authentication ID token adding somee
        const idToken = await admin.auth().createCustomToken(userRecord.uid);
        const userUid = userRecord.uid; // Add user UID to response to use in client-side requests

        res.status(200).json({ message: "Login successful", token: idToken, uid:userUid });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * getUser Function: Requests a userID, returns a user object
 */
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

        const userData = userDoc.data();
        res.status(200).json({ user: userData });

    } catch (error) {
        console.error("getUser error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * isAuthenticated Function: Verifies user has a teacher role
 */
exports.isAuthenticated = functions.https.onRequest(async (req, res) => {
    try {
        const { uid } = req.query;

        if (!uid) {
            return res.status(400).json({ message: "Missing user ID (uid) in query params" });
        }

        // Optionally: Verify the UID exists in Firebase Auth
        const userRecord = await admin.auth().getUser(uid).catch(() => null);
        if (!userRecord) {
            return res.status(401).json({ authenticated: false, message: "Invalid user ID" });
        }

        // Get user role from Firestore
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

/**
 * getAllClasses Function: Gets all classes in "classes" container
 */
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

/**
 * createClass Function: Requests a class object, creates a class in the "classes" container
 */
exports.createClass = functions.https.onRequest(async (req, res) => {
    try {
        const { uid, name, course_code } = req.body;

        if (!uid || !name || !course_code) {
            return res.status(400).json({ message: "Missing required fields: uid, name, or course_code" });
        }

        // Get the user profile from Firestore
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const { role } = userDoc.data();

        // Only allow teachers to create classes
        if (!role || role.toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create classes." });
        }

        // Add class to 'classes' collection
        const classRef = await db.collection("classes").add({
            name,
            course_code
        });

        res.status(201).json({
            message: "Class created successfully",
            classId: classRef.id
        });

    } catch (error) {
        console.error("createClass error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * createNote Function: Creates a new note associated with a course_code
 */
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
            createdAt: Timestamp.now()
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

/**
 * deleteNote Function: Deletes a note by noteId
 */
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

        await noteRef.delete();

        res.status(200).json({ message: "Note deleted successfully", noteId });

    } catch (error) {
        console.error("deleteNote error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * getAllNotesForClass Function: Retrieves all notes associated with a specific course_code
 */
exports.getAllNotesForClass = functions.https.onRequest(async (req, res) => {
    try {
        const { course_code } = req.query;

        if (!course_code) {
            return res.status(400).json({ message: "Missing required search parameter: course_code" });
        }

        // Search notes collection for the specified course_code
        const notesSnapshot = await db.collection("notes").where("course_code", "==", course_code).get();

        if (notesSnapshot.empty) {
            return res.status(200).json({ notes: [] });
        }

        // Map the notes to an array of objects
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


