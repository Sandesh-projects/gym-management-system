// server/routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware

// Import Admin controller functions for managing members from adminController
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  assignMembershipToMember,
} = require('../controllers/adminController'); // <= CORRECTED IMPORT SOURCE FOR ADMIN FUNCTIONS

// Import Member controller functions for member-specific actions from memberController
const {
  // getMemberProfile, // Note: Often placed in userRoutes (/api/users/profile)
  getMemberBills,
  getMemberNotifications,
  updateMemberNotificationStatus,
} = require('../controllers/memberController'); // <= CORRECT IMPORT SOURCE FOR MEMBER FUNCTIONS

// NEW ROUTE: Assign Membership Package to Member
// Route: PUT /api/members/:id/assign-package
// Requires: protect, admin middleware
router.put('/:id/assign-package', protect, admin, assignMembershipToMember); // <= ADD THIS NEW ROUTE


// Admin routes for managing members
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
// Mounted at /api/members
router.route('/')
  .post(protect, admin, createMember) // POST to /api/members - Admin creates a new member
  .get(protect, admin, getMembers); // GET to /api/members - Admin gets all members (List)

router.route('/:id')
  .get(protect, admin, getMemberById) // GET to /api/members/:id - Admin gets a single member by ID
  .put(protect, admin, updateMember) // PUT to /api/members/:id - Admin updates a member by ID
  .delete(protect, admin, deleteMember); // DELETE to /api/members/:id - Admin deletes a member by ID


// Member specific routes (accessible by the member themselves)
// These routes require 'protect' (logged in) but not 'admin'
// The controller should use req.user._id to filter data for the logged-in user
// These are still mounted under /api/members in server.js

// GET bills for the logged-in member
router.get('/my/bills', protect, getMemberBills); // GET to /api/members/my/bills

// GET notifications for the logged-in member
router.get('/my/notifications', protect, getMemberNotifications); // GET to /api/members/my/notifications

// PUT to update notification status for the logged-in member
router.put('/my/notifications/:id', protect, updateMemberNotificationStatus); // PUT to /api/members/my/notifications/:id


module.exports = router;