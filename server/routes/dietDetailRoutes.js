// server/routes/dietDetailRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Controller functions for Diet Detail management (by Admin)
  createDietDetail,
  getDietDetails, // Assuming Admin views all details
  getDietDetailById, // Assuming Admin views a single detail
  updateDietDetail, // Assuming Admin updates a detail
  deleteDietDetail, // Assuming Admin deletes a detail
  // Controller functions for Diet Detail viewing (Public, Member, or User)
  // getPublicDietDetails, // If public can view general advice
  // getMemberDietDetails // If personalized advice is implemented
} = require('../controllers/adminController'); // Assuming Admin controllers handle diet details management

// Admin routes for managing diet details
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
router.route('/')
  .post(protect, admin, createDietDetail) // Admin creates a new detail
  .get(protect, admin, getDietDetails); // Admin gets all details (List)

router.route('/:id')
  .get(protect, admin, getDietDetailById) // Admin gets a single detail by ID
  .put(protect, admin, updateDietDetail) // Admin updates a detail by ID
  .delete(protect, admin, deleteDietDetail); // Admin deletes a detail by ID


// Example of a public/member route to view diet details (if needed)
// router.get('/public', getPublicDietDetails); // Doesn't require 'protect' or 'admin'
// router.get('/my', protect, getMemberDietDetails); // Requires 'protect' if personalized


module.exports = router;