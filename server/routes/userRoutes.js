// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const {
  // General User specific controllers (accessible by any logged-in user)
  getUserProfile, // Get the logged-in user's own profile
  updateUserProfile, // Update the logged-in user's own profile
  // searchRecords // Placeholder for search functionality
} = require('../controllers/memberController'); // Assuming these are in memberController or a separate userController


// Route to get the logged-in user's own profile
// Requires 'protect' middleware but not 'admin'
router.get('/profile', protect, getUserProfile); // The controller uses req.user._id

// Example route to update the logged-in user's own profile
// router.put('/profile', protect, updateUserProfile); // The controller uses req.user._id

// Placeholder for Search Records (if implemented)
// router.get('/search', protect, searchRecords); // Requires protect, logic TBD


// Note: Public auth routes (signup, signin) are in authRoutes.js


module.exports = router;