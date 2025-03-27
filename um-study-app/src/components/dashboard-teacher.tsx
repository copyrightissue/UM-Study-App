import React, { useEffect, useState } from "react";
import Link from "next/link";

const TeacherDashboard: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    setClasses(["Algorithms", "Advanced JavaScript", "Data Science 101"]);
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
          Teacher Dashboard
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

        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/classView">
            <button style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background 0.3s",
              marginRight: "1rem"
            }}
              onMouseOver={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#1e40af")}
              onMouseOut={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#2563eb")}
            >
              View All Classes
            </button>
          </Link>
          <Link href="/classcreation">
            <button style={{
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
              Create New Class
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;