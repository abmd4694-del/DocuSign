const express = require('express');
const {
  createSignatureRequest,
  getDocumentByToken,
  rejectSignatureRequest,
  getSignatureRequests,
} = require('../controllers/shareController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.post('/request', protect, createSignatureRequest);
router.get('/requests/:docId', protect, getSignatureRequests);

// Public routes (token-based access)
router.get('/document/:token', getDocumentByToken);
router.post('/reject/:token', rejectSignatureRequest);

module.exports = router;
