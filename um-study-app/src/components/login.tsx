import React from "react";
import { useState } from "react";

const StudyBuddyLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // const functionURL = "https://us-central1-studybuddy-1b01f.cloudfunctions.net/loginUser";

      const response = await fetch("/api/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

          email: credentials.email,
          password: credentials.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.message || errorData.error}`);
        return;
      }

      const data = await response.json();
      console.log("Login success:", data);
      alert("Login successful!");
      // possibly store data.token in localStorage or context
      // then navigate to the main app page

    } catch (err) {
      console.error("Error calling login function:", err);
      alert("An error occurred during login.");
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
      {/* Logo */}
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
        <span role="img" aria-label="book">📘</span> Study Buddy 1.0
      </h1>
  
      {/* Welcome Message */}
      <p style={{ color: "#374151", fontSize: "1.25rem" }}>
        Welcome to <span style={{ color: "#3b82f6" }}>Study Buddy</span>!
      </p>
  
      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "16px", width: "100%", maxWidth: "400px" }}>
        <label style={{ fontSize: "1.125rem", fontWeight: "600", textAlign: "left"}}>NetID:</label>
        <input
          type="text"
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "4px",
            marginBottom: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            backgroundColor: "#e5e7eb",
          }}
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter NetID"
        />
  
        <label style={{ fontSize: "1.125rem", fontWeight: "600", display: "block"}}>Password:</label>
        <input
          type="password"
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "4px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            backgroundColor: "#e5e7eb",
          }}
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter Password"
        />
  
        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "16px",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "8px",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#1e40af")}
          onMouseOut={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#2563eb")}
        >
          Login
        </button>
      </form>
  
      {/* New Account Link */}
      <p style={{ marginTop: "16px", color: "#6b7280" }}>
        If you do not have an account, click the link here:{" "}
        <a href="/signup.html" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          New Account
        </a>
      </p>
    </div>
  );
  
};

export default StudyBuddyLogin;