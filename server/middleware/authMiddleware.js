// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - Checks for a valid JWT and attaches the user to the request
const protect = async (req, res, next) => {
  let token;

  // Check for token in the 'Authorization' header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      // jwt.verify takes token, secret, and an optional callback. Using promise-based verify is common.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the token payload (decoded.id or decoded._id depending on what you put in the token)
      // Select everything EXCEPT the password
      req.user = await User.findById(decoded.id).select('-password');

      // Check if the user exists
      if (!req.user) {
         // Use next() with an error for consistent handling
         res.status(401);
         throw new Error('Not authorized, user not found');
      }

      next(); // Move to the next middleware or route handler

    } catch (error) {
      console.error('Auth middleware error:', error.message); // Log the specific error
      // Use next() with an error for consistent handling
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is provided
  if (!token) {
    // Use next() with an error for consistent handling
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// @desc    Admin authorization middleware - Checks if the authenticated user is an Admin
const admin = (req, res, next) => {
  // 'protect' middleware must run before this to attach req.user
  if (req.user && req.user.role === 'Admin') {
    next(); // User is an Admin, proceed
  } else {
    res.status(403); // Forbidden status code
    throw new Error('Not authorized as an admin'); // Use next() with an error for consistent handling
  }
};

module.exports = { protect, admin };