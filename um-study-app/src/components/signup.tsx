import React, { useState } from "react";
import styles from "../styles/Home.module.css"; // Adjust based on your file structure

const SignUp: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    netID: "",
    password: "",
    role: "student", // Default role
    email: "",
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form Submitted", formData);
    // Send form data to our amazing incredible backend team (flattery gets you everywhere)
    try {

      // or if you set up rewrites: "/api/signupUser"
      const functionURL = process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:5001/studybuddy-1b01f/us-central1/signupUser"
      : "https://signupuser-jre67bdmmq-uc.a.run.app";

      // 2) Make a POST request with the form data
      const response = await fetch(functionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          studentID: formData.netID,   //  "studentID" if your function expects that
          password: formData.password,
          classes: [],                // or some default classes array if needed
          role: formData.role,
          email: formData.email
        })
      });

      if (!response.ok) {
        // e.g. 400 or 500
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message || errorData.error}`);
        return;
      }

      // 3) Handle success
      const data = await response.json();
      console.log("Signup success:", data);
      alert("Signup successful!");
      // Possibly redirect to login page:
      // router.push("/") or window.location.href = "/"
      window.location.href = "/";

    } catch (err) {
      console.error("Error calling signup function:", err);
      alert("An error occurred during signup.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign Up for Study Buddy</h2>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>NetID:</label>
          <input
            type="text"
            name="netID"
            value={formData.netID}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange} className={styles.input}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button type="submit" className={styles.button}>Sign Up</button>
        </form>

        <p className={styles.link}>
          Already have an account? <a href="/">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;