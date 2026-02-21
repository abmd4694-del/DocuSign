const express = require('express');
const {
  finalizeSignature,
  getSignatures,
} = require('../controllers/signatureController');
const { protect } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/finalize-public', auditLogger('public-sign'), finalizeSignature);
router.post('/finalize', protect, auditLogger('sign'), finalizeSignature);
router.get('/:docId', protect, getSignatures);

module.exports = router;
