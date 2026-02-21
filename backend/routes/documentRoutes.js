const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  undoSignature,
  sendSignatureRequest,
  getDocByToken,
  downloadDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Get all documents
router.get('/', protect, getDocuments);

// Upload document
router.post('/upload', protect, auditLogger('upload'), upload.single('document'), uploadDocument);

router
  .route('/:id')
  .get(protect, auditLogger('view'), getDocument)
  .delete(protect, deleteDocument);

// Undo signature
router.post('/:id/undo', protect, auditLogger('undo_signature'), undoSignature);

// Send signature request
router.post('/:id/send', protect, auditLogger('send_request'), sendSignatureRequest);

// Download document
router.get('/:id/download', downloadDocument);

// Get document by token (Public)
router.get('/sign/:token', getDocByToken);

module.exports = router;
