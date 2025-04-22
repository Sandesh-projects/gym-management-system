// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Member', 'User'], // Define allowed roles
      default: 'User', // Default role for new users
    },
    // Add fields for membership package
    currentMembership: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeePackage', // Reference the FeePackage model
        required: false, // Not all users will have a membership initially
        default: null,
    },
    membershipStartDate: {
        type: Date,
        required: false, // Only required if currentMembership is set
        default: null,
    },
     membershipEndDate: {
        type: Date,
        required: false, // Only required if currentMembership is set
        default: null,
    },
    // You can add more fields here like email, phone, etc.
    // email: {
    //   type: String,
    //   required: false, // Or true if email is mandatory
    //   unique: true,
    // },
    // phone: {
    //    type: String,
    //    required: false,
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  // Generate a salt
  const salt = await bcrypt.genSalt(10);
  // Hash the password using the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;