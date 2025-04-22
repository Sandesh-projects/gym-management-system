// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); // Import controllers

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', registerUser); // Public route

// @desc    Authenticate user and get token
// @route   POST /api/auth/signin
// @access  Public
router.post('/signin', loginUser); // Public route

// Note: Other authentication-related routes (like getting user profile by token) might be in userRoutes

module.exports = router;