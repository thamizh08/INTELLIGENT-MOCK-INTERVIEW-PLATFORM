// src/models/QuestionAnswer.js
// Represents ONE question + the user's answer + its evaluation, within a session.

const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    isFollowUp: {
      type: Boolean,
      default: false,
    },
    answerText: {
      type: String,
      default: null,
    },
    // Professional Top-Company Hiring Manager Evaluation Schema
    evaluation: {
      correctnessScore: { type: Number, min: 0, max: 10, default: null },
      clarityScore: { type: Number, min: 0, max: 10, default: null },
      structureScore: { type: Number, min: 0, max: 10, default: null },
      feedback: { type: String, default: null },
      recruiterVerdict: { type: String, default: 'Hire' }, // Strong Hire, Hire, Leaning Hire, Needs Improvement
      senioritySignal: { type: String, default: 'Mid-Level' }, // Junior, Mid-Level, Senior, Staff Lead
      keyStrengths: [{ type: String }],
      missedOpportunities: [{ type: String }],
      missingKeywords: [{ type: String }], // Missing domain terms that caused mark deductions
      sampleStrongAnswer: { type: String, default: null },
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);
