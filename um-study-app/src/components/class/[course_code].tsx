import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css"; // adjust path as needed

interface Note {
  id: string;
  title: string;
  contents: string;
  author: string;
  upvotes: number;
  downvotes: number;
  votecount: number;
}

interface Props {
  course_code: string;
}

const ClassPage: React.FC<Props> = ({ course_code }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    contents: "",
  });
  const [status, setStatus] = useState("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("uid") : null;

  const fetchNotes = async () => {
    try {
      const resp = await fetch(
          `/api/getAllNotesForClass?course_code=${encodeURIComponent(course_code)}`
      );
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const { notes = [] } = await resp.json();   // function returns { notes: [...] }
      notes.sort((a: any, b: any) => b.upvotes - a.upvotes);
      setNotes(notes);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating note...");
  
    try {
      const response = await fetch("/api/createNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          contents: formData.contents,
          course_code: course_code,
          downvotes: 0,
          upvotes: 0,
          votecount: 0
        }),
      });
  
      if (!response.ok) {
        const errData = await response.json();
        setStatus("Error: " + (errData.message || "Unable to create note"));
        return;
      }
  
      setFormData({ title: "", contents: ""});
      setStatus("Note created!");
      fetchNotes();
    } catch (err) {
      console.error("Error creating note:", err);
      setStatus("Error creating note.");
    }
  };


  const handleVote = async (noteId: string, voteType: "up" | "down") => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }
    try {
      const res = await fetch("/api/voteNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, userId, voteType })   // <- exact names
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Vote failed");
      }
      fetchNotes();          // refresh counts
    } catch (err) {
      console.error("Voting error:", err);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const res = await fetch("/api/deleteNote", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      if (!res.ok) throw new Error("Delete failed");
      fetchNotes();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [course_code]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>📘 Notes for {course_code}</h1>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Content</label>
          <textarea
            name="contents"
            value={formData.contents}
            onChange={handleChange}
            className={styles.input}
            rows={4}
            required
          />

          <button type="submit" className={styles.button}>Submit Note</button>
        </form>

        {status && <p className={styles.link}>{status}</p>}

        <h2 className={styles.label} style={{ marginTop: "2rem" }}>📚 Existing Notes</h2>
        <div style={{ marginTop: "1rem" }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                marginBottom: "1.5rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "#3b82f6", marginBottom: "0.5rem" }}>{note.title}</h3>
              <p style={{ marginBottom: "0.5rem" }}>{note.contents}</p>
              <small style={{ display: "block", marginBottom: "0.5rem" }}>By {note.author}</small>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <button
                    onClick={() => handleVote(note.id, "up")}
                    style={{
                      backgroundColor: "#e0f2fe",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      marginRight: "0.5rem",
                    }}
                  >
                    👍 {note.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(note.id, "down")}
                    style={{
                      backgroundColor: "#fee2e2",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    👎 {note.downvotes}
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  style={{
                    backgroundColor: "#f87171",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
