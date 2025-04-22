// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const {
  // Controller functions for Notification management (by Admin)
  createNotification, // Assuming Admin assigns notifications
  getNotifications, // Assuming Admin views all notifications
  getNotificationById, // Assuming Admin views a single notification
  updateNotification, // Assuming Admin updates a notification
  deleteNotification, // Assuming Admin deletes a notification
  // Controller functions for Notification viewing (by Member) - Often in memberController or separate
  // getMemberNotifications, // Moved to memberRoutes based on frontend structure
  // updateMemberNotificationStatus // Moved to memberRoutes
} = require('../controllers/adminController'); // Assuming Admin controllers handle notification management

// Admin routes for managing notifications
// These routes require both 'protect' (logged in) and 'admin' (admin role) middleware
router.route('/')
  .post(protect, admin, createNotification) // Admin creates/assigns a new notification
  .get(protect, admin, getNotifications); // Admin gets all notifications (List)

router.route('/:id')
  .get(protect, admin, getNotificationById) // Admin gets a single notification by ID
  .put(protect, admin, updateNotification) // Admin updates a notification by ID
  .delete(protect, admin, deleteNotification); // Admin deletes a notification by ID


// Member viewing/updating routes for notifications are in memberRoutes (/api/members/my/notifications)


module.exports = router;