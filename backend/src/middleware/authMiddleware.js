// src/middleware/authMiddleware.js
// Runs BEFORE a protected controller function.
// Checks that a valid JWT was sent, decodes it, and attaches the user's id
// to req.user so the controller knows who's making the request -
// without needing to re-check email/password on every single call.

const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // available to every controller after this point
    next(); // token is valid - proceed to the actual route handler
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
}

module.exports = { protect };
