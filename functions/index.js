const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

const serviceAccount = require("./studybuddy-1b01f-firebase-adminsdk.json"); // Ensure the correct path

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://studybuddy-1b01f.firebaseio.com" // Update with your Firebase database URL
});

const db = admin.firestore();

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

        // Store user profile in Firestore using user.uid as the document ID
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

        // Instead of generating a custom JWT, return Firebase's built-in authentication ID token
        const idToken = await admin.auth().createCustomToken(userRecord.uid);

        res.status(200).json({ message: "Login successful", idToken });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});
