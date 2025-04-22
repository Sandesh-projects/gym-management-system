// server/models/Supplement.js
const mongoose = require('mongoose');

const supplementSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    // You can add more fields like image URL, category, etc.
    // imageUrl: {
    //    type: String,
    //    required: false
    // },
    // category: {
    //    type: String,
    //    required: false
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Supplement = mongoose.model('Supplement', supplementSchema);

module.exports = Supplement;