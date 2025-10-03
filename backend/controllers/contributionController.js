const Contribution = require('../models/Contribution');
const Group = require('../models/Group');
const User = require('../models/User');

// Record a contribution payment
const recordContribution = async (req, res) => {
  try {
    const { groupId, amount, month, paymentMethod, transactionId, notes } = req.body;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.id,
      'members.status': 'active'
    });

    if (!group) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not a member of this group or group not found' 
      });
    }

    // Check if contribution already exists for this month
    const existingContribution = await Contribution.findOne({
      group: groupId,
      member: req.user.id,
      month: month
    });

    if (existingContribution) {
      return res.status(400).json({ 
        success: false,
        message: 'Contribution for this month already recorded' 
      });
    }

    const contribution = await Contribution.create({
      group: groupId,
      member: req.user.id,
      amount: amount || group.monthlyContribution, // Use group default if not specified
      month: month,
      paymentMethod: paymentMethod || 'cash',
      transactionId: transactionId,
      notes: notes,
      status: 'paid'
    });

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate('member', 'fullName email phone')
      .populate('group', 'name monthlyContribution');

    res.status(201).json({
      success: true,
      data: populatedContribution,
      message: 'Contribution recorded successfully'
    });
  } catch (error) {
    console.error('Record contribution error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error recording contribution: ' + error.message 
    });
  }
};

// Get contributions for a specific group
const getGroupContributions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { month } = req.query;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.id,
      'members.status': 'active'
    });

    if (!group) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not a member of this group' 
      });
    }

    let query = { group: groupId };
    
    // Filter by month if provided
    if (month) {
      query.month = month;
    }

    const contributions = await Contribution.find(query)
      .populate('member', 'fullName email phone avatar')
      .populate('verifiedBy', 'fullName')
      .sort({ month: -1, createdAt: -1 });

    // Get all active members to show who hasn't paid
    const activeMembers = group.members
      .filter(member => member.status === 'active')
      .map(member => member.user);

    const members = await User.find({ _id: { $in: activeMembers } })
      .select('fullName email phone avatar');

    res.json({
      success: true,
      data: {
        contributions,
        members,
        group: {
          name: group.name,
          monthlyContribution: group.monthlyContribution,
          totalMembers: group.totalMembers
        }
      }
    });
  } catch (error) {
    console.error('Get group contributions error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching contributions' 
    });
  }
};

// Get user's contributions across all groups
const getMyContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.user.id })
      .populate('group', 'name type monthlyContribution')
      .sort({ month: -1, createdAt: -1 });

    res.json({
      success: true,
      data: contributions
    });
  } catch (error) {
    console.error('Get my contributions error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching your contributions' 
    });
  }
};

// Admin: Verify a contribution
const verifyContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;

    const contribution = await Contribution.findById(contributionId)
      .populate('group');

    if (!contribution) {
      return res.status(404).json({ 
        success: false,
        message: 'Contribution not found' 
      });
    }

    // Check if user is admin of the group
    const isAdmin = await Group.findOne({
      _id: contribution.group._id,
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.status': 'active'
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Only group admins can verify contributions' 
      });
    }

    contribution.status = 'paid';
    contribution.verifiedBy = req.user.id;
    contribution.verifiedAt = new Date();
    await contribution.save();

    const updatedContribution = await Contribution.findById(contributionId)
      .populate('member', 'fullName email phone')
      .populate('verifiedBy', 'fullName');

    res.json({
      success: true,
      data: updatedContribution,
      message: 'Contribution verified successfully'
    });
  } catch (error) {
    console.error('Verify contribution error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error verifying contribution' 
    });
  }
};

module.exports = {
  recordContribution,
  getGroupContributions,
  getMyContributions,
  verifyContribution
};