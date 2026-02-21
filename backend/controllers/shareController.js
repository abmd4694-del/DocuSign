const Document = require('../models/Document');
const SignatureRequest = require('../models/SignatureRequest');
const { generateSignatureToken, verifySignatureToken } = require('../utils/tokenService');
const { sendSignatureRequest } = require('../utils/emailService');

// @desc    Create signature request and send email
// @route   POST /api/share/request
// @access  Private
const createSignatureRequest = async (req, res, next) => {
  try {
    const { documentId, recipientEmail, recipientName, message } = req.body;

    // Validation
    if (!documentId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide documentId and recipientEmail',
      });
    }

    // Check if document exists and user owns it
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this document',
      });
    }

    // Check if document is already signed
    if (document.status === 'Signed') {
      return res.status(400).json({
        success: false,
        message: 'Document is already signed',
      });
    }

    // Generate token
    const token = generateSignatureToken(documentId, recipientEmail);

    // Create signature request
    const signatureRequest = await SignatureRequest.create({
      documentId,
      requesterId: req.user._id,
      recipientEmail,
      recipientName: recipientName || recipientEmail,
      token,
      message: message || '',
    });

    // Generate signature link
    const signatureLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign/${token}`;

    // Send email
    await sendSignatureRequest(recipientEmail, document.originalName, signatureLink);

    res.status(201).json({
      success: true,
      message: 'Signature request sent successfully',
      data: {
        signatureRequest,
        signatureLink,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by signature token (public access)
// @route   GET /api/share/document/:token
// @access  Public
const getDocumentByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify token
    const verification = verifySignatureToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Find signature request
    const signatureRequest = await SignatureRequest.findOne({ token });

    if (!signatureRequest) {
      return res.status(404).json({
        success: false,
        message: 'Signature request not found',
      });
    }

    // Check if expired
    if (new Date() > signatureRequest.expiresAt) {
      signatureRequest.status = 'Expired';
      await signatureRequest.save();

      return res.status(410).json({
        success: false,
        message: 'Signature request has expired',
      });
    }

    // Check if already signed or rejected
    if (signatureRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This document has already been ${signatureRequest.status.toLowerCase()}`,
      });
    }

    // Get document
    const document = await Document.findById(signatureRequest.documentId)
      .populate('ownerId', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        document,
        signatureRequest: {
          recipientName: signatureRequest.recipientName,
          message: signatureRequest.message,
          expiresAt: signatureRequest.expiresAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject signature request
// @route   POST /api/share/reject/:token
// @access  Public
const rejectSignatureRequest = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    // Verify token
    const verification = verifySignatureToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Find signature request
    const signatureRequest = await SignatureRequest.findOne({ token });

    if (!signatureRequest) {
      return res.status(404).json({
        success: false,
        message: 'Signature request not found',
      });
    }

    // Update status
    signatureRequest.status = 'Rejected';
    signatureRequest.rejectionReason = reason || 'No reason provided';
    await signatureRequest.save();

    // Update document status
    const document = await Document.findById(signatureRequest.documentId);
    if (document) {
      document.status = 'Rejected';
      await document.save();
    }

    res.status(200).json({
      success: true,
      message: 'Signature request rejected',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all signature requests for a document
// @route   GET /api/share/requests/:docId
// @access  Private
const getSignatureRequests = async (req, res, next) => {
  try {
    const { docId } = req.params;

    // Check document ownership
    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Get requests
    const requests = await SignatureRequest.find({ documentId: docId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSignatureRequest,
  getDocumentByToken,
  rejectSignatureRequest,
  getSignatureRequests,
};
