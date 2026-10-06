// src/controllers/authController.js
// Contains the actual logic behind each auth route:
// - signup: create a new user with a hashed password
// - login: verify credentials, issue a JWT
// - getProfile: return the logged-in user's own data

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

/**
 * Creates a signed JWT containing the user's id.
 * This token is what the frontend stores and sends back on future requests
 * instead of re-sending email/password every time.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Password strength enforcement: min 8 characters, at least 1 uppercase, 1 number, 1 special character
    const passwordChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };

    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.number || !passwordChecks.special) {
      const missing = [];
      if (!passwordChecks.length) missing.push('at least 8 characters');
      if (!passwordChecks.uppercase) missing.push('at least 1 capital letter (A-Z)');
      if (!passwordChecks.number) missing.push('at least 1 number (0-9)');
      if (!passwordChecks.special) missing.push('at least 1 special character (!@#$%^&*...)');

      return res.status(400).json({
        message: `Password requirement not met: must contain ${missing.join(', ')}.`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Never store the raw password - only the hash.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err); // passes the error to the global error handler in app.js
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Deliberately vague message - don't reveal whether the email exists
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/profile  (protected - req.user is set by authMiddleware)
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, getProfile };
