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

  const userID = "exampleUser123";

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/getAllNotesForClass?course_code=${course_code}`);
      const data = await response.json();
      setNotes(data.notes || []);
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

  const handleVote = async (noteId: string, votetype: "up" | "down") => {
    try {
      const res = await fetch("/api/voteNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, userID, votetype }),
      });

      if (!res.ok) throw new Error("Vote failed");
      fetchNotes();
    } catch (err) {
      console.error("Voting error:", err);
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
        {notes.map((note) => (
          <div key={note.id} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
            <h3>{note.title}</h3>
            <p>{note.contents}</p>
            <small>By {note.author}</small>
            <div style={{ marginTop: "0.5rem" }}>
              <button onClick={() => handleVote(note.id, "up")}>👍 {note.upvotes}</button>
              <button onClick={() => handleVote(note.id, "down")} style={{ marginLeft: "1rem" }}>
                👎 {note.downvotes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassPage;
