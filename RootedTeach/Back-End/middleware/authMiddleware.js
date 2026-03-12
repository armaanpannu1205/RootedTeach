/* authMiddleware.js - Security guards for our backend APIs. */
/* Handles both Authentication (Who are you?) and Authorization (What can you do?). */

const jwt = require('jsonwebtoken');

// Guard 1: Basic Authentication
// Checks if the user has a valid JWT ticket to enter the API.
function authMiddleware(req, res, next) {
  // Grab the header. Format is usually "Bearer eyJhbGciOi..."
  const authHeader = req.headers['authorization'];
  
  // Split by space to just get the token part, ignoring the word "Bearer"
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify it with our secret key. If it passes, attach the decoded user info to the request.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Everything is good, pass to the next function/route!
    next();
  } catch {
    // Token is fake, tampered with, or expired
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Guard 2: Role-based Authorization
// Example usage: router.post('/create-class', authMiddleware, requireRole('Teacher'), ...)
function requireRole(...roles) {
  return (req, res, next) => {
    // Ensure authMiddleware ran first and attached req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    // Check if the user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required: ${roles.join(' or ')}` });
    }

    // They have the right role, let them through!
    next();
  };
}

module.exports = { authMiddleware, requireRole };