const AuditLog = require('../models/AuditLog');
const Document = require('../models/Document');

// @desc    Get audit logs for a document
// @route   GET /api/audit/:docId
// @access  Private
const getAuditLogs = async (req, res, next) => {
  try {
    const { docId } = req.params;

    // Check if document exists
    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user owns the document
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view audit logs for this document',
      });
    }

    // Get audit logs
    const auditLogs = await AuditLog.find({ documentId: docId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      data: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all audit logs for current user
// @route   GET /api/audit/user/me
// @access  Private
const getUserAuditLogs = async (req, res, next) => {
  try {
    const auditLogs = await AuditLog.find({ userId: req.user._id })
      .populate('documentId', 'originalName status')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      data: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getUserAuditLogs,
};
