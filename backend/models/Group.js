const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Group description is required']
  },
  type: {
    type: String,
    required: [true, 'Group type is required'],
    enum: ['family', 'neighborhood', 'professional', 'religious', 'cultural']
  },
  monthlyContribution: {
    type: Number,
    required: [true, 'Monthly contribution amount is required'],
    min: 0
  },
  // All groups are private - no public groups
  privacy: {
    type: String,
    enum: ['private'],
    default: 'private'
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active'
    }
  }],
  totalMembers: {
    type: Number,
    default: 1
  },
  rules: [{
    title: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update totalMembers when members array changes
groupSchema.pre('save', function(next) {
  this.totalMembers = this.members.filter(member => member.status === 'active').length;
  next();
});

module.exports = mongoose.model('Group', groupSchema);