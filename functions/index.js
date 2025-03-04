const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables for local testing

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Secret key for JWT authentication (from Firebase Config or .env)
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    console.error("ERROR: Secret key is missing. Set it using Firebase Config or .env.");
    process.exit(1); // Exit if no secret key is set
}

/**
 * Signup Function: Creates a user and stores their profile in Firestore
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

        // Hash the password
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
 * Login Function: Authenticates a user and returns a JWT token
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


        // Generate JWT token
        const token = jwt.sign({ uid: userRecord.uid, role: userData.role }, SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Secure Firestore Rules (Add this to `firebase.json`)
 * Ensure users can only access their own data:
 */
// {
//   "rules_version": "2",
//   "service": "cloud.firestore",
//   "match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, update, delete: if request.auth.uid == userId;
//       allow create: if request.auth != null;
//     }
//   }
// }
