// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Top-level Admin specific controllers (like dashboard stats, report export)
  getAdminDashboardStats, // Example
  exportReport, // Assuming Admin exports reports
} = require('../controllers/adminController'); // Import controllers

// Routes in this file should generally require both 'protect' and 'admin' middleware
// These are top-level admin-specific actions, not CRUD for a specific model

// Example Admin Dashboard Stats route
router.get('/dashboard-stats', protect, admin, getAdminDashboardStats);

// Example Report Export route
// This route should trigger file generation and download
router.get('/export-report', protect, admin, exportReport); // Requires protect and admin


// Note: CRUD routes for specific models (members, bills, etc.) are in their own route files,
// and also apply 'protect' and 'admin' middleware there.

module.exports = router;