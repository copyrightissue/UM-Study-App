import React from "react";

const StudyBuddyLogin = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] border">
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
            <span role="img" aria-label="book">📘</span> Study Buddy
          </h1>
        </div>

        {/* Welcome Message */}
        <p className="text-center text-gray-700">
          Welcome to <span className="text-blue-500">Study Buddy</span>!
        </p>

        {/* Login Form */}
        <div className="mt-4">
          <label className="block text-lg font-semibold">StudentID:</label>
          <input
            type="text"
            className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-200"
            placeholder="Enter StudentID"
          />

          <label className="block text-lg font-semibold mt-3">Password:</label>
          <input
            type="password"
            className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-200"
            placeholder="Enter Password"
          />
        </div>

        {/* New Account Link */}
        <p className="mt-4 text-center text-gray-600">
          If you do not have an account, click the link here:{" "}
          <a href="/signup" className="text-blue-500 underline">
            New Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default StudyBuddyLogin;