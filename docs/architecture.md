# API Endpoints — Intelligent Mock Interview Platform

Base URL (local dev): `http://localhost:5000/api`

All protected routes require a header:
```
Authorization: Bearer <jwt_token>
```

---

## Health

### `GET /health`
Confirms the server is running.

**Response `200`**
```json
{ "status": "ok" }
```

---

## Auth

### `POST /auth/signup`
Creates a new user account.

**Body**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Response `201`**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

### `POST /auth/login`
Authenticates an existing user.

**Body**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response `200`** — same shape as signup.

### `GET /auth/profile` 🔒
Returns the logged-in user's own profile.

**Response `200`**
```json
{ "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "targetRole": null, "experienceLevel": "fresher" } }
```

---

## Interview

### `POST /interview/start` 🔒
Starts a new interview session and returns the first AI-generated question.

**Body**
```json
{ "role": "Java Developer", "experienceLevel": "junior", "round": "technical" }
```

**Response `201`**
```json
{
  "sessionId": "...",
  "question": { "id": "...", "text": "Explain the difference between an interface and an abstract class in Java.", "order": 1 }
}
```

### `POST /interview/:sessionId/answer` 🔒
Submits an answer to the current question; returns its evaluation and the next question.

**Body**
```json
{ "questionId": "...", "answerText": "An interface only declares methods, while an abstract class can have implemented ones too..." }
```

**Response `200`**
```json
{
  "evaluation": { "correctnessScore": 7, "clarityScore": 8, "structureScore": 6, "feedback": "Good core distinction, but missing a mention of multiple inheritance support." },
  "nextQuestion": { "id": "...", "text": "Can a Java class implement multiple interfaces? Why or why not?", "order": 2 },
  "isLastQuestion": false
}
```

### `POST /interview/:sessionId/complete` 🔒
Marks a session as completed.

**Response `200`**
```json
{ "session": { "_id": "...", "status": "completed", "completedAt": "2026-07-23T10:00:00.000Z" } }
```

### `GET /interview/:sessionId` 🔒
Returns a session plus all its questions/answers so far.

**Response `200`**
```json
{ "session": { "...": "..." }, "questions": [ { "questionText": "...", "answerText": "...", "evaluation": { "...": "..." }, "order": 1 } ] }
```

---

## Report

### `POST /report/:sessionId/generate` 🔒
Generates the final AI summary report for a completed session (idempotent — returns the existing report if one already exists).

**Response `201`**
```json
{
  "report": {
    "overallScores": { "technicalDepth": 7, "communication": 8, "problemSolving": 6, "confidence": 7 },
    "summaryText": "The candidate showed solid fundamentals in Java OOP concepts...",
    "weakAreas": ["multithreading", "system design trade-offs"]
  },
  "alreadyExisted": false
}
```

### `GET /report/:sessionId` 🔒
Fetches the report for a specific session.

### `GET /report/history` 🔒
Returns all of the logged-in user's past reports, newest first — powers the progress-over-time dashboard.

---

## Roadmap

### `POST /roadmap/:reportId/generate` 🔒
Builds a 7-day study plan targeting a report's `weakAreas`.

**Response `201`**
```json
{
  "roadmap": {
    "plan": [
      { "day": 1, "topic": "multithreading", "tasks": ["Read about Java thread lifecycle", "Practice 3 questions on synchronization"], "resources": ["Java Concurrency in Practice - Ch.1"] }
    ],
    "status": "active"
  }
}
```

### `GET /roadmap/active` 🔒
Returns the user's current active roadmap.

### `PATCH /roadmap/:roadmapId/complete` 🔒
Marks a roadmap as completed.

---

## Upload *(service + middleware built; controller and routes not yet wired)*

### `POST /upload/resume` 🔒
Multipart form upload (`resume` field, PDF or DOCX, max 5MB). Extracts text and returns skills/projects found.

### `POST /upload/job-description` 🔒
Accepts pasted JD text and returns extracted required skills.

---

## Status legend
🔒 = requires a valid JWT in the `Authorization` header.