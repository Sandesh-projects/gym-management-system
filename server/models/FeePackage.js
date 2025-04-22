// server/models/FeePackage.js
const mongoose = require('mongoose');

const feePackageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    duration: { // e.g., "1 Month", "3 Months", "1 Year"
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    // You can add more fields if needed
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const FeePackage = mongoose.model('FeePackage', feePackageSchema);

module.exports = FeePackage;