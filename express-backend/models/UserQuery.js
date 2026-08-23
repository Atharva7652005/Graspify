const mongoose = require('mongoose');

const userQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('UserQuery', userQuerySchema);
