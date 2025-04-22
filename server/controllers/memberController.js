// server/controllers/memberController.js
// Controllers for Member-specific actions (viewing their own data)

const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Needed if getting user profile here


// --- Member Specific Actions (by Member) ---
// These controllers assume req.user is available from 'protect' middleware
// They filter data based on req.user._id

// @desc    Get the logged-in User's own profile
// @route   GET /api/users/profile (often in userRoutes)
// @access  Private
// This controller assumes it's applied to a protected route like '/api/users/profile'
const getUserProfile = async (req, res) => {
  // req.user is available here because the 'protect' middleware ran
  const user = await User.findById(req.user._id).select('-password'); // Exclude password

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      // Add other fields if available in model and fetched
      // email: user.email,
      // phone: user.phone,
    });
  } else {
    // This case should ideally not happen if protect middleware works correctly
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update the logged-in User's own profile (Example)
// @route   PUT /api/users/profile (often in userRoutes)
// @access  Private
// const updateUserProfile = async (req, res) => {
//     // req.user contains the current user's info
//     const user = await User.findById(req.user._id);

//     if (user) {
//         // Only allow updating specific fields like username, email, phone etc.
//         // Prevent changing role via this route
//         user.username = req.body.username || user.username;
//         // user.email = req.body.email || user.email;
//         // user.phone = req.body.phone || user.phone;

//         // If allowing password change, handle it securely with current password check
//         // if (req.body.currentPassword && req.body.newPassword && await user.matchPassword(req.body.currentPassword)) {
//         //      user.password = req.body.newPassword; // Hashing handled by middleware
//         // } else if (req.body.newPassword) {
//         //      return res.status(400).json({ message: 'Invalid current password' });
//         // }


//         const updatedUser = await user.save();

//         res.json({
//             _id: updatedUser._id,
//             username: updatedUser.username,
//             role: updatedUser.role,
//             // Include updated fields
//         });

//     } else {
//         res.status(404).json({ message: 'User not found' }); // Should not happen
//     }
// };


// @desc    Get Bills for the logged-in Member
// @route   GET /api/members/my/bills (assuming this path)
// @access  Private/Member
// This controller requires 'protect' middleware and assumes req.user.role is 'Member' or is checked
const getMemberBills = async (req, res) => {
  try {
    // Find bills where the 'member' field matches the logged-in user's ID
    const bills = await Bill.find({ member: req.user._id }).populate('member', 'username'); // Populate member username

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching member bills' });
  }
};

// @desc    Get Notifications for the logged-in Member
// @route   GET /api/members/my/notifications (assuming this path)
// @access  Private/Member
// This controller requires 'protect' middleware and assumes req.user.role is 'Member' or is checked
const getMemberNotifications = async (req, res) => {
  try {
    // Find notifications where the 'member' field matches the logged-in user's ID
    const notifications = await Notification.find({ member: req.user._id }).populate('member', 'username'); // Populate member username

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching member notifications' });
  }
};


// @desc    Update Notification Status for the logged-in Member
// @route   PUT /api/members/my/notifications/:id (assuming this path)
// @access  Private/Member
// This controller requires 'protect' middleware and assumes req.user.role is 'Member' or is checked
// It also checks if the notification belongs to the logged-in member
const updateMemberNotificationStatus = async (req, res) => {
    const { read } = req.body;

    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            // Check if the notification belongs to the logged-in user
            if (notification.member.toString() !== req.user._id.toString()) {
                res.status(403); // Forbidden
                throw new Error('Not authorized to update this notification');
            }

            // Only allow updating the 'read' status via this route
            if (read !== undefined) {
                 notification.read = read;
            } else {
                 // If 'read' was not provided in the body, you might decide how to handle it
                 // For this specific route, it's likely intended just for marking as read
                 return res.status(400).json({ message: 'Invalid update data provided' });
            }

            const updatedNotification = await notification.save();
            res.json(updatedNotification);

        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
         console.error(error);
          if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Notification not found (Invalid ID format)' });
          }
         if (res.statusCode === 403) { // If status was set to 403 above
              return res.json({ message: error.message }); // Send the specific 403 message
         }
        res.status(500).json({ message: 'Server error updating notification' });
    }
};


module.exports = {
  // General User (Protected)
  getUserProfile,
  // updateUserProfile, // Example

  // Member Specific (Protected)
  getMemberBills,
  getMemberNotifications,
  updateMemberNotificationStatus,
};