// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    member: { // Link notification to a Member User
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Refers to the User model
    },
    message: {
      type: String,
      required: true,
    },
    type: { // e.g., "Fee Reminder", "Announcement", "Other"
      type: String,
      required: true,
      default: 'Other',
    },
    read: { // Status if the member has read it
      type: Boolean,
      required: true,
      default: false,
    },
    // You can add more fields if needed
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields (useful for sorting)
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;