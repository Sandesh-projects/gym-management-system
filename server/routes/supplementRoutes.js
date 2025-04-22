// server/routes/supplementRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Controller functions for Supplement management (by Admin)
  createSupplement,
  getSupplements, // Assuming Admin views all supplements
  getSupplementById, // Assuming Admin views a single supplement
  updateSupplement, // Assuming Admin updates a supplement
  deleteSupplement, // Assuming Admin deletes a supplement
  // Controller functions for Supplement viewing (Public or Member)
  // getPublicSupplements // If members or public can view supplements
} = require('../controllers/adminController'); // Assuming Admin controllers handle supplement management

// Admin routes for managing supplements
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
router.route('/')
  .post(protect, admin, createSupplement) // Admin creates a new supplement
  .get(protect, admin, getSupplements); // Admin gets all supplements (List)

router.route('/:id')
  .get(protect, admin, getSupplementById) // Admin gets a single supplement by ID
  .put(protect, admin, updateSupplement) // Admin updates a supplement by ID
  .delete(protect, admin, deleteSupplement); // Admin deletes a supplement by ID

// Example of a public route to view supplements (e.g., in a public store page)
// router.get('/public', getPublicSupplements); // Doesn't require 'protect' or 'admin'

module.exports = router;