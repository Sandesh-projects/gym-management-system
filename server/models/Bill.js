// server/models/Bill.js
const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    member: { // Link bill to a Member User
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Refers to the User model
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    date: { // Date the bill is issued or due
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Due'], // Define allowed statuses
      default: 'Pending',
    },
    // You can add more fields like description, paymentMethod, etc.
    // description: {
    //     type: String,
    //     required: false
    // },
    // paymentMethod: {
    //     type: String,
    //     required: false
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;