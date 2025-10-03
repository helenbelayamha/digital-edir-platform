const express = require('express');
const {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  getMyGroups,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require login)
router.use(protect);

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.get('/my-groups', getMyGroups);  // This line was missing!
router.get('/:id', getGroup);
router.post('/:id/join', joinGroup);

module.exports = router;