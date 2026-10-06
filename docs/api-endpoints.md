# Architecture — Intelligent Mock Interview Platform

## 1. Overview

The platform has four main parts that work together in a loop:

1. **Frontend** — collects user input (role selection, answers, file uploads) and displays questions/reports/roadmaps.
2. **Backend (Express API)** — routes requests, applies auth, and coordinates between the AI and the database.
3. **AI layer (Claude via Anthropic API)** — generates questions, follow-ups, evaluations, report summaries, and roadmaps. Called only from `src/services/*`, never directly from controllers.
4. **Database (MongoDB via Mongoose)** — persists users, sessions, individual Q&A pairs, reports, and roadmaps.

```
Frontend  →  Express Routes  →  Controllers  →  Services (AI calls) / Models (DB calls)
                                     ↑                        ↓
                                     └──────── response ──────┘
```

## 2. Request flow example: submitting an interview answer

1. Frontend sends `POST /api/interview/:sessionId/answer` with `{ questionId, answerText }` and a JWT in the `Authorization` header.
2. `authMiddleware.protect` verifies the JWT and attaches `req.user.id`.
3. `interviewController.submitAnswer`:
   - Loads the `InterviewSession` and `QuestionAnswer` documents from MongoDB.
   - Saves `answerText`.
   - Calls `services/answerEvaluator.js`, which builds a prompt (`utils/promptTemplates.js`) and sends it to Claude via `config/aiClient.js`.
   - Parses the AI's JSON response (`utils/responseParser.js`) into `{ correctnessScore, clarityScore, structureScore, feedback }` and saves it on the `QuestionAnswer` document.
   - Calls `services/followUpGenerator.js` to decide and generate the next question.
   - Creates a new `QuestionAnswer` document for that next question.
4. Response returns the evaluation plus the next question to the frontend.

## 3. Why services are separated from controllers

Controllers only handle **HTTP concerns**: reading `req`, validating input, calling the right service/model, and shaping the `res`. All AI prompt-building and parsing logic lives in `services/` and `utils/`. This means:

- Prompt wording can be tuned in `promptTemplates.js` without touching any route or controller.
- The AI provider itself is isolated in `config/aiClient.js` — switching models or providers means changing one file.
- Controllers stay short and readable, which matters most as more rounds/features get added.

## 4. Data model relationships

```
User ──1:N──> InterviewSession ──1:N──> QuestionAnswer
User ──1:N──> Report  (Report belongs to exactly one InterviewSession)
User ──1:N──> Roadmap (Roadmap references the Report it was generated from)
```

- `QuestionAnswer` is its own collection (not an embedded array in `InterviewSession`) so each answer can be evaluated and saved independently as the interview progresses, without rewriting the whole session document each time.
- `Report` is generated once per completed session and stores the AI's aggregated summary — this is what powers the skill-radar chart and progress-over-time dashboard.
- `Roadmap` always points back to the `Report` it was built from, so a user's study plan is traceable to the specific weak areas that produced it.

## 5. Authentication flow

- Passwords are hashed with `bcrypt` before being stored — the raw password is never saved.
- On login, a JWT signed with `JWT_SECRET` is issued, containing only the user's id, expiring after 7 days.
- Every protected route runs `authMiddleware.protect` first, which verifies the token and attaches `req.user.id` — controllers never re-check credentials themselves.

## 6. Where each future feature plugs in

| Feature | Where it lives |
|---|---|
| Resume-aware questions | `services/resumeParser.js` extracts skills → passed into `questionGenerator.js`'s prompt |
| JD-based customization | Same path as resume parsing, using pasted JD text instead of a file |
| Voice mode | Speech-to-text happens in the frontend/browser; only the resulting text ever reaches the backend — no backend changes needed |
| Progress tracking over time | `reportController.getUserReports` already returns full report history sorted by date |
| Re-test loop after roadmap completion | `roadmapController.completeRoadmap` marks a roadmap done; frontend can then call `interviewController.startInterview` again, filtered to the same weak-area topics |