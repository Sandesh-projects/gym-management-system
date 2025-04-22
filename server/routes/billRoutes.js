// server/routes/billRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Controller functions for Bill management (by Admin)
  createBill,
  getBills, // Assuming Admin views all bills
  getBillById, // Assuming Admin views a single bill
  updateBill, // Assuming Admin updates a bill
  deleteBill, // Assuming Admin deletes a bill
  // Controller functions for Bill viewing (by Member) - Often in memberController or separate
  // getMemberBills // Moved to memberRoutes based on frontend structure
} = require('../controllers/adminController'); // Assuming Admin controllers handle bill management

// Admin routes for managing bills
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
router.route('/')
  .post(protect, admin, createBill) // Admin creates a new bill
  .get(protect, admin, getBills); // Admin gets all bills (List)

router.route('/:id')
  .get(protect, admin, getBillById) // Admin gets a single bill by ID
  .put(protect, admin, updateBill) // Admin updates a bill by ID
  .delete(protect, admin, deleteBill); // Admin deletes a bill by ID


// Member viewing route for bills is in memberRoutes (/api/members/my/bills)


module.exports = router;