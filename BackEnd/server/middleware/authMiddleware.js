// For Authentication feature
// verifies JWT before protected routes


const jwt = require('jsonwebtoken');
const { SECRET } = require('../config'); 
/**
 * Middleware to protect routes.
 * Checks Authorization header for Bearer token.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer token
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token required' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token' });
    }
    req.user = user; // Attach decoded payload to request
    next();
  });
}

module.exports = authenticateToken;
