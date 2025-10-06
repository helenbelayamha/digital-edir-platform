const express = require('express');
console.log('✅ requests.js route file loaded successfully'); // Add this line

const {
  getPendingRequests,
  approveRequest,
  denyRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/pending', getPendingRequests);
router.put('/:id/approve', approveRequest);
router.put('/:id/deny', denyRequest);

module.exports = router;