import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const StudyBuddyClassCreation = () => {
    const [fields, setFields] = useState({ course_code: "", name: "" });
    const [currentUID, setCurrentUID] = useState<string | null>(null);

    useEffect(() => {
        // Listen for auth changes; store the UID if a user is logged in
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUID(user.uid);
            } else {
                setCurrentUID(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1) Ensure we have a user logged in (otherwise we can't check teacher status)
            if (!currentUID) {
                alert("No user is currently logged in.");
                return;
            }

            // 2) Check if the user is a teacher by calling /api/isAuthenticated?uid=<uid>
            const authCheckRes = await fetch(`/api/isAuthenticated?uid=${currentUID}`);
            if (!authCheckRes.ok) {
                const authCheckError = await authCheckRes.json();
                alert(`Failed to check teacher status: ${authCheckError.message}`);
                return;
            }

            const { authenticated } = await authCheckRes.json();
            if (!authenticated) {
                alert("You do not have teacher permissions to create a class.");
                return;
            }

            // 3) If the user is a teacher, proceed with creating the class
            const createClassRes = await fetch("/api/createClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: currentUID,                  // pass the teacher’s UID
                    course_code: fields.course_code,  // match the Cloud Function’s expected field name
                    name: fields.name,                // match the Cloud Function’s expected field name
                }),
            });

            if (!createClassRes.ok) {
                const errorData = await createClassRes.json();
                alert(`Class creation failed: ${errorData.message || errorData.error}`);
                return;
            }

            const data = await createClassRes.json();
            console.log("Class creation success:", data);
            alert("Class creation successful!");
            window.location.href = "/";
        } catch (err) {
            console.error("Error calling class creation function:", err);
            alert("An error occurred during class creation.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1
                    style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <span role="img" aria-label="book">📘</span> Study Buddy
                </h1>

                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>Course Code:</label>
                    <input
                        type="text"
                        name="course_code"
                        value={fields.course_code}
                        onChange={handleChange}
                        placeholder="Example: CSCI 491"
                        required
                        style={{width: "100%"}}
                    />

                    <label className={styles.label}>Class Title:</label>   
                    <input
                        type="text"
                        name="name"
                        value={fields.name}
                        onChange={handleChange}
                        placeholder="Example: Advanced Software Engineering"
                        required
                        style={{width: "100%"}}
                    />

                    <div style={{ marginTop: "16px" }}>
                        <button type="submit" className={styles.button}>Create Class</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudyBuddyClassCreation;
