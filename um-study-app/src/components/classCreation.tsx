import React, { useState } from "react";
import styles from "../styles/Home.module.css";

const StudyBuddyClassCreation = () => {
    const [fields, setFields] = useState({ course_code: "", name: "" });


    const userUid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!userUid) {
                alert("No UID found. Please log in first.");
                return;
            }

            // 1) Check if user is teacher:
            const authCheckRes = await fetch(`/api/isAuthenticated?uid=${userUid}`);
            if (!authCheckRes.ok) {
                const authCheckError = await authCheckRes.json();
                alert(`Failed to check teacher status: ${authCheckError.message}`);
                return;
            }

            const authCheckData = await authCheckRes.json();
            if (!authCheckData.authenticated) {
                alert("You do not have teacher permissions.");
                return;
            }

            // 2) If authenticated, create class
            const createClassRes = await fetch("/api/createClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: userUid,
                    course_code: fields.course_code,
                    name: fields.name,
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
