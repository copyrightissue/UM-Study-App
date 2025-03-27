import React from "react";
import { useRouter } from "next/router";

const ClassView: React.FC = () => {
  const router = useRouter();

  // Dummy data for classes
  const classes = [
    { name: "Intro to CS", teacher: "Mr. Smith" },
    { name: "Discrete Math", teacher: "Mrs. Johnson" },
    { name: "Web Dev Basics", teacher: "Ms. Lee" }
  ];

  // Dummy role (replace this with actual logic to determine the user's role)
  const role = "teacher"; // Change to "student" to test redirection for students

  const handleRedirect = () => {
    if (role === "teacher") {
      router.push("/dashboard-teacher");
    } else {
      router.push("/dashboard-student");
    }
  };

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
          Classes
        </h1>
        <ul style={{ listStyle: "none", padding: 0, color: "#4b5563" }}>
          {classes.map((cls, i) => (
            <li key={i} style={{
              padding: "0.5rem 0",
              borderBottom: "1px solid #e5e7eb"
            }}>
              <h2 style={{ color: "#2563eb", fontSize: "1.25rem" }}>{cls.name}</h2>
              <p style={{ color: "#374151" }}>Teacher: {cls.teacher}</p>
            </li>
          ))}
        </ul>
        {/* Add the button for redirection */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={handleRedirect}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background 0.3s"
            }}
            onMouseOver={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#2563eb")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassView;