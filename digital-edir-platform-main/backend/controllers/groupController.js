const Group = require('../models/Group');
const Request = require('../models/Request');
const User = require('../models/User');

// Create new private group
const createGroup = async (req, res) => {
  try {
    const { name, description, type, monthlyContribution, location, rules } = req.body;

    const group = await Group.create({
      name,
      description,
      type,
      monthlyContribution,
      location,
      rules,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        status: 'active'
      }]
    });

    res.status(201).json({
      success: true,
      data: group,
      message: 'Private group created successfully'
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating group: ' + error.message 
    });
  }
};

// Get all groups (for discovery - but all are private)
const getGroups = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('createdBy', 'fullName email phone')
      .populate('members.user', 'fullName email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Group.countDocuments(query);

    res.json({
      success: true,
      data: {
        groups,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching groups' 
    });
  }
};

// Request to join a private group
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id && member.status === 'active'
    );

    if (isMember) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already a member of this group' 
      });
    }

    // Check if there's already a pending request
    const existingRequest = await Request.findOne({
      group: group._id,
      user: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending request to join this group' 
      });
    }

    // Create join request
    const joinRequest = await Request.create({
      group: group._id,
      user: req.user.id,
      type: 'join',
      status: 'pending',
      message: req.body.message || 'I would like to join this group'
    });

    res.json({
      success: true,
      data: joinRequest,
      message: 'Join request sent to group admin'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error joining group' 
    });
  }
};

// Get user's groups (where user is a member)
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id,
      'members.status': 'active',
      isActive: true
    })
    .populate('createdBy', 'fullName email phone')
    .populate('members.user', 'fullName email phone')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching your groups' 
    });
  }
};

// Get single group details
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'fullName email phone')
      .populate('members.user', 'fullName email phone avatar');

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching group' 
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  getMyGroups
};