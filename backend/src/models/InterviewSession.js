// src/models/InterviewSession.js
// Represents ONE mock interview attempt by a user: which role, what round(s),
// current status, and a link back to the user who took it.
// Individual questions/answers are stored separately (QuestionAnswer.js)
// and linked back to this session by sessionId, to keep this document lightweight.

const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String, // e.g. "Java Developer"
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'fresher',
    },
    round: {
      type: String,
      enum: ['screening', 'technical', 'coding', 'system_design', 'hr_behavioral'],
      default: 'technical',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
