// src/models/Report.js
// Represents the FINAL summarized outcome of a completed interview session.

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScores: {
      technicalDepth: { type: Number, min: 0, max: 10, default: 0 },
      communication: { type: Number, min: 0, max: 10, default: 0 },
      problemSolving: { type: Number, min: 0, max: 10, default: 0 },
      confidence: { type: Number, min: 0, max: 10, default: 0 },
    },
    summaryText: {
      type: String,
      required: true,
    },
    likelihoodOfPassing: {
      type: String,
      default: '75% (Moderate Pass Probability)',
    },
    topImprovementTopics: [
      {
        type: String,
      },
    ],
    weakAreas: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
