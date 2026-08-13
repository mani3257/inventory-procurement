const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getUsers, getMyProfile, updateMyProfile } = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);

module.exports = router;