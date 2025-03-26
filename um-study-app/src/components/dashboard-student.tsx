import React, { useEffect, useState } from "react";

const StudentDashboard: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    setClasses(["Intro to CS", "Discrete Math", "Web Dev Basics"]);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#2563eb", fontSize: "1.75rem", marginBottom: "1rem" }}>
          Student Dashboard
        </h1>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#374151" }}>
          Your Classes
        </h2>
        <ul style={{ listStyle: "none", padding: 0, color: "#4b5563" }}>
          {classes.map((cls, i) => (
            <li key={i} style={{
              padding: "0.5rem 0",
              borderBottom: "1px solid #e5e7eb"
            }}>
              {cls}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentDashboard;