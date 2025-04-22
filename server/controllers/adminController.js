// server/controllers/adminController.js
// Controllers for Admin-specific actions and managing various models

const User = require('../models/User'); // Assuming Admin manages Users (Members)
const Bill = require('../models/Bill');
const FeePackage = require('../models/FeePackage');
const Notification = require('../models/Notification');
const Supplement = require('../models/Supplement');
const DietDetail = require('../models/DietDetail');
const moment = require('moment'); // Import moment for date calculations

// Helper function to calculate membership end date
const calculateEndDate = (startDate, duration) => {
    // Assuming duration is a string like "1 Month", "3 Months", "1 Year"
    // You might need more sophisticated parsing based on your duration strings
    const [value, unit] = duration.split(' '); // e.g., ["1", "Month"]

    let endDate = moment(startDate);

    switch (unit.toLowerCase()) {
        case 'month':
        case 'months':
            endDate = endDate.add(parseInt(value), 'months');
            break;
        case 'year':
        case 'years':
            endDate = endDate.add(parseInt(value), 'years');
            break;
        case 'day': // Added day example
        case 'days':
            endDate = endDate.add(parseInt(value), 'days');
            break;
        // Add other units if needed (week, etc.)
        default:
            console.warn(`Unknown duration unit: ${unit}`);
            return null; // Or handle as an error
    }

    return endDate.toDate(); // Return as JavaScript Date object
};

// --- NEW CONTROLLER: Assign Membership Package to Member ---

// @desc    Assign a Fee Package to a Member
// @route   PUT /api/members/:id/assign-package
// @access  Private/Admin
const assignMembershipToMember = async (req, res) => {
    const { packageId, startDate } = req.body; // Expect packageId and start date

    try {
        // Find the member by ID
        const member = await User.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Find the fee package by ID
        const feePackage = await FeePackage.findById(packageId);

        if (!feePackage) {
            return res.status(404).json({ message: 'Fee package not found' });
        }

        // Validate start date
        const validStartDate = moment(startDate).isValid() ? moment(startDate).toDate() : new Date(); // Use provided date or current date

        // Calculate end date based on package duration and start date
        const endDate = calculateEndDate(validStartDate, feePackage.duration);

         if (!endDate) {
              return res.status(400).json({ message: `Invalid package duration format: ${feePackage.duration}` });
         }


        // Update the member's membership fields
        member.currentMembership = feePackage._id;
        member.membershipStartDate = validStartDate;
        member.membershipEndDate = endDate;
        member.role = 'Member'; // Ensure role is Member if assigning package (optional, depending on logic)

        const updatedMember = await member.save();

        // Populate the membership details for the response
        await updatedMember.populate('currentMembership', 'name duration cost');


        res.json({
            _id: updatedMember._id,
            username: updatedMember.username,
            role: updatedMember.role,
            currentMembership: updatedMember.currentMembership, // Send the updated package info
            membershipStartDate: updatedMember.membershipStartDate,
            membershipEndDate: updatedMember.membershipEndDate,
            message: `Membership assigned successfully to ${updatedMember.username}`
        });


    } catch (error) {
        console.error('Error assigning membership:', error);
         if (error.kind === 'ObjectId') {
             // Check if the invalid ID was for member or package
             const member = await User.findById(req.params.id);
             const feePackage = await FeePackage.findById(packageId);
             if (!member) return res.status(404).json({ message: 'Member not found (Invalid ID format)' });
             if (!feePackage) return res.status(404).json({ message: 'Fee package not found (Invalid ID format)' });

         }
        res.status(500).json({ message: 'Server error assigning membership' });
    }
};

// --- Admin Dashboard / General Admin Actions ---

// @desc    Get Admin Dashboard Stats (Example)
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
// ... getAdminDashboardStats controller code (copy from previous) ...
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'Member' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalUsers = await User.countDocuments({ role: 'User' });
    const pendingBills = await Bill.countDocuments({ status: 'Pending' });
    const totalRevenue = await Bill.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalMembers,
      totalAdmins,
      totalUsers,
      pendingBills,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};


// @desc    Export Report
// @route   GET /api/admin/export-report
// @access  Private/Admin
// ... exportReport controller code (copy from previous) ...
const exportReport = async (req, res) => {
  try {
    const allMembers = await User.find({}).select('-password');
    res.json({ message: 'Report export initiated (backend logic needed)', data: allMembers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during report export' });
  }
};


// --- Member Management (CRUD by Admin) ---

// @desc    Create a new Member (by Admin)
// @route   POST /api/members
// @access  Private/Admin
// ... createMember controller code (copy from previous) ...
const createMember = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({
            username,
            password,
            role: role || 'Member',
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            });
        } else {
            res.status(400).json({ message: 'Invalid member data' });
        }
    } catch (error) {
        console.error(error);
         if (error.code === 11000) {
             return res.status(400).json({ message: 'Username already exists' });
         }
        res.status(500).json({ message: 'Server error creating member' });
    }
};


// @desc    Get all Members (by Admin)
// @route   GET /api/members
// @access  Private/Admin
// ... getMembers controller code (copy from previous) ...
const getMembers = async (req, res) => {
    try {
        // Populate membership details when fetching members
        const users = await User.find({ _id: { $ne: req.user._id } })
                                .select('-password')
                                .populate('currentMembership', 'name duration cost'); // Populate package name, duration, cost

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching members' });
    }
};


// @desc    Get Member by ID (by Admin)
// @route   GET /api/members/:id
// @access  Private/Admin
// ... getMemberById controller code (copy from previous) ...
const getMemberById = async (req, res) => {
    try {
        // Populate membership details when fetching a single member
        const user = await User.findById(req.params.id)
                              .select('-password')
                              .populate('currentMembership', 'name duration cost'); // Populate package name, duration, cost

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'User not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching member' });
    }
};


// @desc    Update Member by ID (by Admin)
// @route   PUT /api/members/:id
// @access  Private/Admin
// ... updateMember controller code (copy from previous) ...
const updateMember = async (req, res) => {
    // Allow updating username and role. Membership update will be separate
    const { username, role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.username = username || user.username;
            user.role = role || user.role;

            const updatedUser = await user.save();

            // Populate membership details before sending the response
            await updatedUser.populate('currentMembership', 'name duration cost');


            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                currentMembership: updatedUser.currentMembership, // Include updated membership info
                membershipStartDate: updatedUser.membershipStartDate,
                membershipEndDate: updatedUser.membershipEndDate,
            });

        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'User not found (Invalid ID format)' });
        }
         if (error.code === 11000) {
             return res.status(400).json({ message: 'Username already exists' });
         }
        res.status(500).json({ message: 'Server error updating member' });
    }
};


// @desc    Delete Member by ID (by Admin)
// @route   DELETE /api/members/:id
// @access  Private/Admin
// ... deleteMember controller code (copy from previous) ...
const deleteMember = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
             if (user._id.toString() === req.user._id.toString()) {
                  return res.status(400).json({ message: 'Cannot delete your own account via this route' });
             }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'User not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting member' });
    }
};


// --- Bill Management (CRUD by Admin) ---
// Note: Get bills for specific member is in memberController

// @desc    Create a new Bill (by Admin)
// @route   POST /api/bills
// @access  Private/Admin
const createBill = async (req, res) => {
    const { memberId, amount, date, status } = req.body;

    try {
        // Optional: Validate if memberId exists
        const member = await User.findById(memberId);
        if (!member || (member.role !== 'Member' && member.role !== 'User')) { // Ensure linking to a non-admin user
             return res.status(400).json({ message: 'Invalid or non-member user ID provided' });
        }


        const bill = await Bill.create({
            member: memberId, // Use the member's ID
            amount,
            date,
            status: status || 'Pending',
        });

        res.status(201).json(bill); // 201 Created

    } catch (error) {
        console.error(error);
         // Handle potential validation errors (e.g., missing required fields)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error creating bill' });
    }
};


// @desc    Get all Bills (by Admin)
// @route   GET /api/bills
// @access  Private/Admin
const getBills = async (req, res) => {
    try {
        // Fetch all bills and populate the 'member' field to get user details
        const bills = await Bill.find({}).populate('member', 'username role'); // Populate username and role

        res.json(bills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching bills' });
    }
};


// @desc    Get Bill by ID (by Admin)
// @route   GET /api/bills/:id
// @access  Private/Admin
const getBillById = async (req, res) => {
    try {
        // Find bill by ID and populate member details
        const bill = await Bill.findById(req.params.id).populate('member', 'username role');

        if (bill) {
            res.json(bill);
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Bill not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching bill' });
    }
};


// @desc    Update Bill by ID (by Admin)
// @route   PUT /api/bills/:id
// @access  Private/Admin
const updateBill = async (req, res) => {
    const { amount, date, status } = req.body;

    try {
        // Find bill by ID
        const bill = await Bill.findById(req.params.id);

        if (bill) {
            // Update bill fields if they exist in the request body
            bill.amount = amount !== undefined ? amount : bill.amount;
            bill.date = date !== undefined ? date : bill.date;
            bill.status = status || bill.status;

            const updatedBill = await bill.save();

            // Populate member details before sending the response if needed by the frontend
            // await updatedBill.populate('member', 'username role');


            res.json(updatedBill);
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Bill not found (Invalid ID format)' });
        }
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating bill' });
    }
};


// @desc    Delete Bill by ID (by Admin)
// @route   DELETE /api/bills/:id
// @access  Private/Admin
const deleteBill = async (req, res) => {
    try {
        // Find bill by ID and delete
        const bill = await Bill.findById(req.params.id);

        if (bill) {
            await bill.deleteOne(); // Or remove()

            res.json({ message: 'Bill removed' });
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Bill not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting bill' });
    }
};


// --- Fee Package Management (CRUD by Admin) ---

// @desc    Create a new Fee Package (by Admin)
// @route   POST /api/fee-packages
// @access  Private/Admin
const createFeePackage = async (req, res) => {
    const { name, duration, cost, description } = req.body;

    try {
        // Check if package with the same name already exists
         const packageExists = await FeePackage.findOne({ name });
         if (packageExists) {
              return res.status(400).json({ message: 'Fee package with this name already exists' });
         }

        const feePackage = await FeePackage.create({
            name,
            duration,
            cost,
            description,
        });

        res.status(201).json(feePackage); // 201 Created

    } catch (error) {
        console.error(error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
         if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Fee package with this name already exists' });
         }
        res.status(500).json({ message: 'Server error creating fee package' });
    }
};


// @desc    Get all Fee Packages (by Admin)
// @route   GET /api/fee-packages
// @access  Private/Admin (or Public if needed)
const getFeePackages = async (req, res) => {
    try {
        const feePackages = await FeePackage.find({});
        res.json(feePackages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching fee packages' });
    }
};


// @desc    Get Fee Package by ID (by Admin)
// @route   GET /api/fee-packages/:id
// @access  Private/Admin
const getFeePackageById = async (req, res) => {
    try {
        const feePackage = await FeePackage.findById(req.params.id);

        if (feePackage) {
            res.json(feePackage);
        } else {
            res.status(404).json({ message: 'Fee package not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Fee package not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching fee package' });
    }
};


// @desc    Update Fee Package by ID (by Admin)
// @route   PUT /api/fee-packages/:id
// @access  Private/Admin
const updateFeePackage = async (req, res) => {
    const { name, duration, cost, description } = req.body;

    try {
        const feePackage = await FeePackage.findById(req.params.id);

        if (feePackage) {
            feePackage.name = name || feePackage.name;
            feePackage.duration = duration || feePackage.duration;
            feePackage.cost = cost !== undefined ? cost : feePackage.cost;
            feePackage.description = description || feePackage.description; // Handle potentially sending empty string for description

            const updatedFeePackage = await feePackage.save();
            res.json(updatedFeePackage);

        } else {
            res.status(404).json({ message: 'Fee package not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Fee package not found (Invalid ID format)' });
        }
         if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Fee package with this name already exists' });
         }
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating fee package' });
    }
};


// @desc    Delete Fee Package by ID (by Admin)
// @route   DELETE /api/fee-packages/:id
// @access  Private/Admin
const deleteFeePackage = async (req, res) => {
    try {
        const feePackage = await FeePackage.findById(req.params.id);

        if (feePackage) {
            await feePackage.deleteOne(); // Or remove()
            res.json({ message: 'Fee package removed' });
        } else {
            res.status(404).json({ message: 'Fee package not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Fee package not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting fee package' });
    }
};


// --- Notification Management (CRUD by Admin) ---
// Note: Get notifications for specific member is in memberController

// @desc    Create a new Notification (by Admin)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
    const { memberId, message, type } = req.body;

    try {
        // Optional: Validate if memberId exists
        const member = await User.findById(memberId);
        if (!member || (member.role !== 'Member' && member.role !== 'User')) { // Ensure linking to a non-admin user
             return res.status(400).json({ message: 'Invalid or non-member user ID provided' });
        }

        const notification = await Notification.create({
            member: memberId,
            message,
            type: type || 'Other',
            // read defaults to false
        });

        res.status(201).json(notification); // 201 Created

    } catch (error) {
        console.error(error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
         if (error.kind === 'ObjectId') { // If memberId is invalid format
             return res.status(400).json({ message: 'Invalid member ID format' });
         }
        res.status(500).json({ message: 'Server error creating notification' });
    }
};


// @desc    Get all Notifications (by Admin)
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
    try {
        // Fetch all notifications and populate member details
        const notifications = await Notification.find({}).populate('member', 'username role');
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};


// @desc    Get Notification by ID (by Admin)
// @route   GET /api/notifications/:id
// @access  Private/Admin
const getNotificationById = async (req, res) => {
    try {
        // Find notification by ID and populate member details
        const notification = await Notification.findById(req.params.id).populate('member', 'username role');

        if (notification) {
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Notification not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching notification' });
    }
};


// @desc    Update Notification by ID (by Admin)
// @route   PUT /api/notifications/:id
// @access  Private/Admin
const updateNotification = async (req, res) => {
    const { message, type, read } = req.body;

    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.message = message || notification.message;
            notification.type = type || notification.type;
             // Explicitly handle boolean `read` field, allow setting to false
            if (read !== undefined) {
                notification.read = read;
            }


            const updatedNotification = await notification.save();
            // Populate member details before sending response if needed
            // await updatedNotification.populate('member', 'username role');

            res.json(updatedNotification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Notification not found (Invalid ID format)' });
        }
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating notification' });
    }
};


// @desc    Delete Notification by ID (by Admin)
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            await notification.deleteOne(); // Or remove()
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Notification not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting notification' });
    }
};


// --- Supplement Management (CRUD by Admin) ---

// @desc    Create a new Supplement (by Admin)
// @route   POST /api/supplements
// @access  Private/Admin
const createSupplement = async (req, res) => {
    const { name, description, price, stock } = req.body;

    try {
         const supplementExists = await Supplement.findOne({ name });
         if (supplementExists) {
              return res.status(400).json({ message: 'Supplement with this name already exists' });
         }

        const supplement = await Supplement.create({
            name,
            description,
            price,
            stock,
        });

        res.status(201).json(supplement); // 201 Created

    } catch (error) {
        console.error(error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
          if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Supplement with this name already exists' });
         }
        res.status(500).json({ message: 'Server error creating supplement' });
    }
};


// @desc    Get all Supplements (by Admin)
// @route   GET /api/supplements
// @access  Private/Admin (or Public if needed)
const getSupplements = async (req, res) => {
    try {
        const supplements = await Supplement.find({});
        res.json(supplements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching supplements' });
    }
};


// @desc    Get Supplement by ID (by Admin)
// @route   GET /api/supplements/:id
// @access  Private/Admin
const getSupplementById = async (req, res) => {
    try {
        const supplement = await Supplement.findById(req.params.id);

        if (supplement) {
            res.json(supplement);
        } else {
            res.status(404).json({ message: 'Supplement not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Supplement not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching supplement' });
    }
};


// @desc    Update Supplement by ID (by Admin)
// @route   PUT /api/supplements/:id
// @access  Private/Admin
const updateSupplement = async (req, res) => {
    const { name, description, price, stock } = req.body;

    try {
        const supplement = await Supplement.findById(req.params.id);

        if (supplement) {
            supplement.name = name || supplement.name;
            supplement.description = description || supplement.description;
            supplement.price = price !== undefined ? price : supplement.price;
            supplement.stock = stock !== undefined ? stock : supplement.stock;

            const updatedSupplement = await supplement.save();
            res.json(updatedSupplement);
        } else {
            res.status(404).json({ message: 'Supplement not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Supplement not found (Invalid ID format)' });
        }
         if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Supplement with this name already exists' });
         }
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating supplement' });
    }
};


// @desc    Delete Supplement by ID (by Admin)
// @route   DELETE /api/supplements/:id
// @access  Private/Admin
const deleteSupplement = async (req, res) => {
    try {
        const supplement = await Supplement.findById(req.params.id);

        if (supplement) {
            await supplement.deleteOne(); // Or remove()
            res.json({ message: 'Supplement removed' });
        } else {
            res.status(404).json({ message: 'Supplement not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Supplement not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting supplement' });
    }
};


// --- Diet Detail Management (CRUD by Admin) ---

// @desc    Create a new Diet Detail (by Admin)
// @route   POST /api/diet-details
// @access  Private/Admin
const createDietDetail = async (req, res) => {
    const { title, content } = req.body; // Assuming Admin adds general diet details

    try {
         // Optional: Check for duplicate title
         const detailExists = await DietDetail.findOne({ title });
         if (detailExists) {
              return res.status(400).json({ message: 'Diet detail with this title already exists' });
         }


        const dietDetail = await DietDetail.create({
            title,
            content,
        });

        res.status(201).json(dietDetail); // 201 Created

    } catch (error) {
        console.error(error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
         if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Diet detail with this title already exists' });
         }
        res.status(500).json({ message: 'Server error creating diet detail' });
    }
};


// @desc    Get all Diet Details (by Admin)
// @route   GET /api/diet-details
// @access  Private/Admin (or Public/Member if needed)
const getDietDetails = async (req, res) => {
    try {
        const dietDetails = await DietDetail.find({});
        res.json(dietDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching diet details' });
    }
};


// @desc    Get Diet Detail by ID (by Admin)
// @route   GET /api/diet-details/:id
// @access  Private/Admin
const getDietDetailById = async (req, res) => {
    try {
        const dietDetail = await DietDetail.findById(req.params.id);

        if (dietDetail) {
            res.json(dietDetail);
        } else {
            res.status(404).json({ message: 'Diet detail not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Diet detail not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching diet detail' });
    }
};


// @desc    Update Diet Detail by ID (by Admin)
// @route   PUT /api/diet-details/:id
// @access  Private/Admin
const updateDietDetail = async (req, res) => {
    const { title, content } = req.body;

    try {
        const dietDetail = await DietDetail.findById(req.params.id);

        if (dietDetail) {
            dietDetail.title = title || dietDetail.title;
            dietDetail.content = content || dietDetail.content;

            const updatedDietDetail = await dietDetail.save();
            res.json(updatedDietDetail);

        } else {
            res.status(404).json({ message: 'Diet detail not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Diet detail not found (Invalid ID format)' });
        }
         if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: 'Diet detail with this title already exists' });
         }
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating diet detail' });
    }
};


// @desc    Delete Diet Detail by ID (by Admin)
// @route   DELETE /api/diet-details/:id
// @access  Private/Admin
const deleteDietDetail = async (req, res) => {
    try {
        const dietDetail = await DietDetail.findById(req.params.id);

        if (dietDetail) {
            await dietDetail.deleteOne(); // Or remove()
            res.json({ message: 'Diet detail removed' });
        } else {
            res.status(404).json({ message: 'Diet detail not found' });
        }
    } catch (error) {
        console.error(error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Diet detail not found (Invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error deleting diet detail' });
    }
};


// --- Report Export (Admin) - Logic Placeholder ---
// @desc    Export Report
// @route   GET /api/admin/export-report
// @access  Private/Admin
// Implementation needed in exportReport controller function


module.exports = {
  // Admin Dashboard / General
  getAdminDashboardStats,
  exportReport, // Placeholder

  // Member Management (Admin)
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,

  // Bill Management (Admin)
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,

  // Fee Package Management (Admin)
  createFeePackage,
  getFeePackages,
  getFeePackageById,
  updateFeePackage,
  deleteFeePackage,

  // Notification Management (Admin)
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,

  // Supplement Management (Admin)
  createSupplement,
  getSupplements,
  getSupplementById,
  updateSupplement,
  deleteSupplement,

  // Diet Detail Management (Admin)
  createDietDetail,
  getDietDetails,
  getDietDetailById,
  updateDietDetail,
  deleteDietDetail,

  assignMembershipToMember,
};