const Request = require('../models/Request');
const Group = require('../models/Group');
const User = require('../models/User');

// Get pending requests for groups where user is admin
const getPendingRequests = async (req, res) => {
  try {
    // Find groups where user is admin
    const adminGroups = await Group.find({
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.status': 'active'
    });

    const groupIds = adminGroups.map(group => group._id);

    // Find pending requests for these groups
    const requests = await Request.find({
      group: { $in: groupIds },
      status: 'pending'
    })
    .populate('user', 'fullName email phone avatar')
    .populate('group', 'name type')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching pending requests' 
    });
  }
};

// Approve a join request
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('group')
      .populate('user');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }

    // Check if user is admin of the group
    const isAdmin = await Group.findOne({
      _id: request.group._id,
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.status': 'active'
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Only group admins can approve requests' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Request has already been processed' 
      });
    }

    // Add user to group as member
    await Group.findByIdAndUpdate(
      request.group._id,
      {
        $push: {
          members: {
            user: request.user._id,
            role: 'member',
            status: 'active'
          }
        }
      }
    );

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.responseMessage = req.body.message || 'Welcome to the group!';
    await request.save();

    res.json({
      success: true,
      data: request,
      message: 'Join request approved successfully'
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error approving request' 
    });
  }
};

// Deny a join request
const denyRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('group');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }

    // Check if user is admin of the group
    const isAdmin = await Group.findOne({
      _id: request.group._id,
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.status': 'active'
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Only group admins can deny requests' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Request has already been processed' 
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.responseMessage = req.body.message || 'Your request has been denied.';
    await request.save();

    res.json({
      success: true,
      data: request,
      message: 'Join request denied successfully'
    });
  } catch (error) {
    console.error('Deny request error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error denying request' 
    });
  }
};

module.exports = {
  getPendingRequests,
  approveRequest,
  denyRequest
};