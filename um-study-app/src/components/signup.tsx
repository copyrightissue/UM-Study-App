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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    // Send form data to our amazing incredible backend team
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