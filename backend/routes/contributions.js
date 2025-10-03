const express = require('express');
const {
  recordContribution,
  getGroupContributions,
  getMyContributions,
  verifyContribution,
} = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/record', recordContribution);
router.get('/my-contributions', getMyContributions);
router.get('/group/:groupId', getGroupContributions);
router.put('/:contributionId/verify', verifyContribution);

module.exports = router;