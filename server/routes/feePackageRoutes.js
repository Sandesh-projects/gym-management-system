// server/routes/feePackageRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Controller functions for Fee Package management (by Admin)
  createFeePackage,
  getFeePackages, // Assuming Admin views all packages
  getFeePackageById, // Assuming Admin views a single package
  updateFeePackage, // Assuming Admin updates a package
  deleteFeePackage, // Assuming Admin deletes a package
  // Controller functions for Fee Package viewing (Public or Member)
  // getPublicFeePackages // If members or public can view packages
} = require('../controllers/adminController'); // Assuming Admin controllers handle package management

// Admin routes for managing fee packages
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
router.route('/')
  .post(protect, admin, createFeePackage) // Admin creates a new package
  .get(protect, admin, getFeePackages); // Admin gets all packages (List)

router.route('/:id')
  .get(protect, admin, getFeePackageById) // Admin gets a single package by ID
  .put(protect, admin, updateFeePackage) // Admin updates a package by ID
  .delete(protect, admin, deleteFeePackage); // Admin deletes a package by ID


// Example of a public route to view fee packages (if needed)
// router.get('/public', getPublicFeePackages); // Doesn't require 'protect' or 'admin'


module.exports = router;