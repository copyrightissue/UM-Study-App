import React from "react";
import { useState } from "react";

const StudyBuddyClassCreation = () => {
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
        <div 
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                textAlign: "center",
                backgroundColor: "#f3f4f6",
            }}
        >
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
                <label>Class Code:</label>
                <input
                    type="text"
                    name="classCode"
                    value={fields.course_code}
                    onChange={handleChange}
                    placeholder="Example: CSCI 491"
                    required
                />

                <label>Class Title:</label>
                <input
                    type="text"
                    name="classInstructor"
                    value={fields.name}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Create Class</button>
            </form>
        </div>
    );
};

export default StudyBuddyClassCreation;
