import React from "react";
import { useState } from "react";
import styles from "../styles/Home.module.css";

const ClassCreation = () => {
    const [fields, setFields] = useState({ course_code: "", name: ""});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/createClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classCode: fields.course_code,
                    classTitle: fields.name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Class creation failed: ${errorData.message || errorData.error}`);
                return;
            }

            const data = await response.json();
            console.log("Class creation success:", data);
            alert("Class creation successful!");
            window.location.href = "/";
        } catch (err) {
            console.error("Error calling class creation function:", err);
            alert("An error occurred during class creation.");
        }
    };

    return (
        <div>
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

            <div className={styles.container}>
                <div className={styles.card}>
                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>Course Code:</label>
                    <input
                        type="text"
                        name="course_code"
                        value={fields.course_code}
                        onChange={handleChange}
                        placeholder="CSCI 491"
                        required
                        style={{ width: "100%" }}
                    />

                    <label className={styles.label}>Class Title:</label>
                    <input
                        type="text"
                        name="name"
                        value={fields.name}
                        onChange={handleChange}
                        placeholder="Advanced Software Engineering"
                        required
                        style={{ width: "100%", display: "block", marginBottom: "1rem" }}
                    />

                    <button type="submit" className={styles.button}>Create Class</button>
                </form>
                </div>
            </div>
        </div>
    );
};

export default ClassCreation;
