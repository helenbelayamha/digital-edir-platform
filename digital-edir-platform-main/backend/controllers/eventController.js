const Event = require('../models/Event');
const Group = require('../models/Group');
const User = require('../models/User');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, groupId, date, time, location, type } = req.body;

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

    const event = await Event.create({
      title,
      description,
      group: groupId,
      date,
      time,
      location,
      type: type || 'meeting',
      createdBy: req.user.id,
      attendees: [{
        user: req.user.id,
        status: 'going'
      }]
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'fullName email phone')
      .populate('attendees.user', 'fullName email phone avatar')
      .populate('group', 'name type');

    res.status(201).json({
      success: true,
      data: populatedEvent,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating event: ' + error.message 
    });
  }
};

// Get events for a specific group
const getGroupEvents = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { upcoming } = req.query;

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

    let query = { group: groupId, isActive: true };

    // Filter for upcoming events only
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName email phone')
      .populate('attendees.user', 'fullName email phone avatar')
      .populate('group', 'name type')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get group events error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching events' 
    });
  }
};

// Get all events for user's groups
const getMyEvents = async (req, res) => {
  try {
    // Find groups where user is a member
    const userGroups = await Group.find({
      'members.user': req.user.id,
      'members.status': 'active'
    });

    const groupIds = userGroups.map(group => group._id);

    const events = await Event.find({
      group: { $in: groupIds },
      isActive: true,
      date: { $gte: new Date() } // Only upcoming events
    })
    .populate('createdBy', 'fullName email phone')
    .populate('attendees.user', 'fullName email phone avatar')
    .populate('group', 'name type')
    .sort({ date: 1, time: 1 })
    .limit(10); // Limit to 10 upcoming events

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error fetching your events' 
    });
  }
};

// RSVP to an event
const rsvpToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    if (!['going', 'not_going', 'maybe'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid RSVP status' 
      });
    }

    const event = await Event.findById(eventId)
      .populate('group');

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if user is a member of the group
    const isMember = await Group.findOne({
      _id: event.group._id,
      'members.user': req.user.id,
      'members.status': 'active'
    });

    if (!isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not a member of this group' 
      });
    }

    // Update or add attendee
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex > -1) {
      // Update existing RSVP
      event.attendees[attendeeIndex].status = status;
      event.attendees[attendeeIndex].respondedAt = new Date();
    } else {
      // Add new RSVP
      event.attendees.push({
        user: req.user.id,
        status: status,
        respondedAt: new Date()
      });
    }

    await event.save();

    const updatedEvent = await Event.findById(eventId)
      .populate('createdBy', 'fullName email phone')
      .populate('attendees.user', 'fullName email phone avatar')
      .populate('group', 'name type');

    res.json({
      success: true,
      data: updatedEvent,
      message: `RSVP updated: ${status}`
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating RSVP' 
    });
  }
};

// Delete an event (admin only)
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('group');

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if user is admin of the group or event creator
    const isAdmin = await Group.findOne({
      _id: event.group._id,
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.status': 'active'
    });

    const isCreator = event.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ 
        success: false,
        message: 'Only group admins or event creators can delete events' 
      });
    }

    event.isActive = false;
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error deleting event' 
    });
  }
};

module.exports = {
  createEvent,
  getGroupEvents,
  getMyEvents,
  rsvpToEvent,
  deleteEvent
};