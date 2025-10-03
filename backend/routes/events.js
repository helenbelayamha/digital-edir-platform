const express = require('express');
const {
  createEvent,
  getGroupEvents,
  getMyEvents,
  rsvpToEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createEvent);
router.get('/my-events', getMyEvents);
router.get('/group/:groupId', getGroupEvents);
router.put('/:eventId/rsvp', rsvpToEvent);
router.delete('/:eventId', deleteEvent);

module.exports = router;