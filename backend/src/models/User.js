// src/models/User.js
// Defines the shape of a "User" document stored in MongoDB.
// This is the source of truth for what fields a user has and their types/validation.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // NOTE: this stores the HASHED password, never plain text.
    // The hashing itself happens in authController.js before saving.
    password: {
      type: String,
      required: true,
    },
    // Optional profile fields useful for personalizing interviews later
    targetRole: {
      type: String, // e.g. "Java Developer", "Data Analyst"
      default: null,
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'fresher',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
