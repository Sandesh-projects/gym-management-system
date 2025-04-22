// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Import bcryptjs
const jwt = require('jsonwebtoken'); // Import jsonwebtoken


// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days (adjust as needed)
  });
};


// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      // Use res.status(400) for bad request (user exists is a client error)
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    // userSchema.pre('save' middleware handles hashing before saving

    // Create the new user
    const user = await User.create({
      username,
      password, // The pre-save middleware will hash this
      role: role || 'User', // Use provided role or default to 'User'
    });

    if (user) {
      // Generate and send JWT token on successful registration
      res.status(201).json({ // 201 Created status
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id), // Send the token
      });
    } else {
      // If user creation failed (e.g., invalid data despite basic checks)
      res.status(400).json({ message: 'Invalid user data' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/signin
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log('Attempting login...'); // Log start of function
  console.log('Received username:', username); // Log received username
  console.log('Received password length:', password ? password.length : 0); // Log password length (safer than logging plain password)


  try {
    // Find the user by username
    const user = await User.findOne({ username });

    console.log('User found:', user ? user.username : 'None'); // Log if user was found

    // Check if user exists AND password matches the hashed password
    if (user && (await user.matchPassword(password))) { // Use the matchPassword method from User model

      console.log('Password matches (bcrypt check). Login successful.'); // Log successful check

      // Generate and send JWT token on successful login
      res.json({ // 200 OK status (default for res.json)
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id), // Send the token
      });
    } else {
      console.log('Login check failed: User not found or password mismatch.'); // Log failed check
      // Send 401 Unauthorized for invalid credentials
      res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Server error during login:', error); // More specific error log
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};