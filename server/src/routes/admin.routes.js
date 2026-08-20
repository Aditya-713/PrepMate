const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);

module.exports = router;
