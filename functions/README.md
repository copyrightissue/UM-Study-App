# 📘 StudyBuddy Notes API (Firebase Functions)

This module includes Firebase Cloud Functions for managing notes in the StudyBuddy app.

---

## 🚀 Available Functions

### 1. `createNote`

Creates a new note associated with a course code.

- **Method:** POST
- **Local Endpoint:**  
  `http://localhost:5001/studybuddy-1b01f/us-central1/createNote`

#### 📥 Request Body

```json
{
  "title": "Sample Note",
  "contents": "This is the body of the note",
  "course_code": "CSCI-391"
}
```

#### 📤 Response

```json
{
  "message": "Note created successfully",
  "noteId": "<generated_note_id>"
}
```

---

### 2. `deleteNote`

Deletes a note and its associated `voters` subcollection.

- **Method:** POST
- **Local Endpoint:**  
  `http://localhost:5001/studybuddy-1b01f/us-central1/deleteNote`

#### 📥 Request Body

```json
{
  "noteId": "abc123"
}
```

#### 📤 Response

```json
{
  "message": "Note and associated votes deleted",
  "noteId": "abc123"
}
```

---

### 3. `voteNote`

Allows a user to upvote or downvote a note. Automatically creates or updates the user's vote and updates the note's vote counts.

- **Method:** POST
- **Local Endpoint:**  
  `http://localhost:5001/studybuddy-1b01f/us-central1/voteNote`

#### 📥 Request Body

```json
{
  "noteId": "abc123",
  "userId": "cass123",
  "voteType": "up"  // or "down"
}
```

#### 📤 Response (on vote change)

```json
{
  "message": "Vote recorded",
  "upvotes": 2,
  "downvotes": 1,
  "votecount": 1
}
```

#### 📤 Response (no change)

```json
{
  "message": "Vote unchanged"
}
```

---

## 🧪 Testing with `curl`

### Create Note

```bash
curl -X POST http://localhost:5001/studybuddy-1b01f/us-central1/createNote \
-H "Content-Type: application/json" \
-d '{
  "title": "Test Note",
  "contents": "This is a test note.",
  "course_code": "CSCI-391"
}'
```

### Vote Note

```bash
curl -X POST http://localhost:5001/studybuddy-1b01f/us-central1/voteNote \
-H "Content-Type: application/json" \
-d '{
  "noteId": "abc123",
  "userId": "cass123",
  "voteType": "up"
}'
```

### Delete Note

```bash
curl -X POST http://localhost:5001/studybuddy-1b01f/us-central1/deleteNote \
-H "Content-Type: application/json" \
-d '{
  "noteId": "abc123"
}'
```

---

## 📂 Firestore Structure

```
notes/
  abc123/
    title: "Sample Note"
    contents: "..."
    course_code: "CSCI-391"
    upvotes: 1
    downvotes: 0
    votecount: 1
    voters/
      cass123/
        votetype: "up"
```

---
