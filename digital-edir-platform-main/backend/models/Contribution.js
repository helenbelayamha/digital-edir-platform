const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: 0
  },
  month: {
    type: String,
    required: [true, 'Month is required'], // Format: "YYYY-MM" e.g., "2025-10"
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'mobile_money', 'other'],
    default: 'cash'
  },
  transactionId: String,
  notes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Compound index to ensure one contribution per member per month per group
contributionSchema.index({ group: 1, member: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Contribution', contributionSchema);