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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] border">
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
            <span role="img" aria-label="book">📘</span> Study Buddy 1.0
          </h1>
        </div>

        {/* Welcome Message */}
        <p className="text-center text-gray-700">
          Welcome to <span className="text-blue-500">Study Buddy</span>!
        </p>

        {/* Login Form */}
        <div className="mt-4">
          <form onSubmit={handleSubmit}>
          <label className="block text-lg font-semibold">Email:</label>
          <input
            type="text"
            className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-200"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <label className="block text-lg font-semibold mt-3">Password:</label>
          <input
            type="password"
            className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-200"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter Password"
          />
          <button type="submit">Login</button>
          </form>
        </div>


        {/* Forgot Password Link */}

        {/* New Account Link */}
        <p className="mt-4 text-center text-gray-600">
          If you do not have an account, click the link here:{" "}
          <a href="/signup.html" className="text-blue-500 underline">
            New Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default StudyBuddyLogin;