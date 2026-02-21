const express = require('express');
const {
  getAuditLogs,
  getUserAuditLogs,
} = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/user/me', protect, getUserAuditLogs);
router.get('/:docId', protect, getAuditLogs);

module.exports = router;
