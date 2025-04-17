 import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

const ClassView: React.FC = () => {
  const router = useRouter();

  const handleClick = (course_code: string) => {
    router.push(`${course_code}`);
  };
  
  type SchoolClass = { name: string; course_code: string };
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/getAllClasses");
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
  
    fetchClasses();
  }, []);
  


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
             <li  
             key={cls.course_code}
             style={{
               padding: "1rem 0",
               borderBottom: "1px solid #e5e7eb",
               margin: "1rem 0"
             }}
           >
             <div>
               <h2
                 onClick={() => handleClick(cls.course_code)}
                 style={{
                   color: "#2563eb",
                   fontSize: "1.25rem",
                   cursor: "pointer",
                   display: "inline-block",
                   marginBottom: "0.5rem" // space below the heading
                 }}
               >
                 {cls.course_code}
               </h2>
             </div>
             <div>
               <p
                 onClick={() => handleClick(cls.course_code)}
                 style={{
                   color: "#374151",
                   cursor: "pointer",
                   display: "inline-block",
                   margin: 0
                 }}
               >
                 {cls.name}
               </p>
             </div>
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