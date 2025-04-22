// server/models/DietDetail.js
const mongoose = require('mongoose');

const dietDetailSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: { // The actual diet advice or details
      type: String,
      required: true,
    },
    // You could potentially link this to specific members if the advice is personalized
    // member: {
    //    type: mongoose.Schema.Types.ObjectId,
    //    required: false, // Or true if required per member
    //    ref: 'User',
    // },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const DietDetail = mongoose.model('DietDetail', dietDetailSchema);

module.exports = DietDetail;