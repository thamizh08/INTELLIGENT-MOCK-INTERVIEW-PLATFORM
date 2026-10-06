// src/models/Roadmap.js
// Represents the personalized learning plan generated from a report's weak areas.
// Stored separately from Report so a user can regenerate/update a roadmap
// without touching the historical report it was based on.

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    platform: { type: String, default: 'Online Resource' }, // e.g. GeeksforGeeks, YouTube, Coursera, Udemy, MDN, freeCodeCamp
    url: { type: String, default: '' },
    category: {
      type: String,
      enum: ['self_learning', 'mentor_based'],
      default: 'self_learning',
    },
    type: {
      type: String,
      default: 'Article & Documentation', // 'Article & Documentation', 'Unpaid Course', 'Paid Course', 'YouTube Video Lecture', 'Mentor Masterclass', 'Interactive Practice'
    },
    subscriptionStatus: {
      type: String,
      enum: ['Free', 'Paid', 'Freemium', 'Free Audit Available'],
      default: 'Free',
    },
    duration: { type: String, default: '30 mins' },
    channelOrAuthor: { type: String, default: 'Instructor / Platform' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    learningPreference: {
      type: String,
      enum: ['all', 'self_learning', 'mentor_based'],
      default: 'all',
    },
    // Each entry is one day/unit of the plan
    plan: [
      {
        day: { type: Number, required: true }, // Day 1, Day 2, ...
        topic: { type: String, required: true }, // weak area being addressed
        tasks: [{ type: String }], // e.g. "Read X", "Practice 5 Qs on Y"
        resources: [resourceSchema], // Structured resources categorized by learning mode and subscription status
      },
    ],
    completedTasks: [{ type: String }], // array of completed task keys or IDs
    completedResources: [{ type: String }], // array of completed resource keys or titles
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);

