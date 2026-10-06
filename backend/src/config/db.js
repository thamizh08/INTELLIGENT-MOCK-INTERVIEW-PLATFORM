// src/config/db.js
// Handles the single responsibility of connecting to MongoDB via Mongoose.
// Exported as a function so server.js can await it before starting the app.

const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected successfully');
}

module.exports = connectDB;
