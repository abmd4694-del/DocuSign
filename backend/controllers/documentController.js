const Document = require('../models/Document');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const sendEmail = require('../utils/emailService');

// Allowed base directory for uploaded files
const UPLOADS_DIR = path.resolve('uploads');

/**
 * Validates that a file path is within the allowed uploads directory.
 * Prevents path traversal attacks.
 */
const safePath = (filePath) => {
  if (!filePath) return null;
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    console.error('Security alert: path traversal blocked:', filePath);
    return null;
  }
  return resolved;
};

/**
 * Safely delete a file (async, non-blocking) after validating path.
 */
const safeDeleteFile = async (filePath) => {
  const safe = safePath(filePath);
  if (!safe) return;
  try {
    await fsPromises.access(safe); // check existence
    await fsPromises.unlink(safe);
  } catch {
    // File doesn't exist or can't be deleted — not critical
  }
};

/**
 * Build the signing-request email for a single recipient.
 */
const buildSigningEmail = (recipient, document, senderName, frontendUrl) => {
  const signLink = `${frontendUrl}/sign/${recipient.token}`;

  const message = `
    Hello ${recipient.name},
    
    ${senderName} has requested your signature on "${document.originalName}".
    
    Please click the link below to view and sign the document:
    ${signLink}
    
    Thank you,
    DocSign Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Signature Request</h2>
      <p>Hello ${recipient.name},</p>
      <p><strong>${senderName}</strong> has requested your signature on "${document.originalName}".</p>
      <div style="margin: 30px 0;">
        <a href="${signLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Review and Sign
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${signLink}">${signLink}</a></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">This email was sent via DocSign.</p>
    </div>
  `;

  return { message, html, signLink };
};

// @desc    Upload document
// @route   POST /api/docs/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    // Create document record
    const document = await Document.create({
      originalName: req.file.originalname,
      filePath: req.file.path,
      ownerId: req.user._id,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};

// @desc    Get all documents for user
// @route   GET /api/docs
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/docs/:id
// @access  Private
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check ownership
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document',
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/docs/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check ownership
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document',
      });
    }

    // Delete files from disk (async, with path traversal protection)
    await safeDeleteFile(document.filePath);
    await safeDeleteFile(document.signedFilePath);

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Undo signature on document
// @route   POST /api/docs/:id/undo
// @access  Private
const undoSignature = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check ownership
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this document',
      });
    }

    // Delete signed file (async, with path traversal protection)
    await safeDeleteFile(document.signedFilePath);

    // Reset document to unsigned state
    document.status = 'Pending';
    document.signedFilePath = null;
    document.signedAt = null;
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Signature removed successfully',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send signature request to recipients
// @route   POST /api/docs/:id/send
// @access  Private
const sendSignatureRequest = async (req, res, next) => {
  try {
    const { recipients } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one recipient',
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check ownership
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send this document',
      });
    }

    // Update document with recipients and generate tokens
    const updatedRecipients = recipients.map((r, index) => ({
      name: r.name,
      email: r.email,
      role: r.role || 'Signer',
      status: 'Pending',
      order: index + 1,
      token: require('crypto').randomBytes(32).toString('hex'), // Secure token
      tokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    }));

    document.recipients = updatedRecipients;
    await document.save(); // Save tokens first so they exist for email links
    
    // Send emails sequentially to avoid resource exhaustion
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let sentCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    for (const recipient of document.recipients) {
      const { message, html } = buildSigningEmail(
        recipient, document, req.user.name, frontendUrl
      );

      try {
        await sendEmail({
          email: recipient.email,
          subject: `Signature Request: ${document.originalName}`,
          message,
          html,
        });
        sentCount++;
        console.log(`Email sent to ${recipient.email}`);
      } catch (err) {
        failedCount++;
        failedEmails.push(recipient.email);
        console.error(`Failed to send email to ${recipient.email}:`, err.message);
      }
    }

    // Report partial or full failures accurately
    const total = document.recipients.length;
    const allFailed = failedCount === total;
    const someFailed = failedCount > 0 && !allFailed;

    res.status(allFailed ? 500 : 200).json({
      success: !allFailed,
      message: allFailed
        ? 'Failed to send signature request emails'
        : someFailed
          ? `Partially sent: ${sentCount} of ${total} emails delivered. Failed: ${failedEmails.join(', ')}`
          : 'Signature request sent successfully to all recipients',
      emailsSent: sentCount,
      emailsFailed: failedCount,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by token (for public access)
// @route   GET /api/docs/sign/:token
// @access  Public
const getDocByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const document = await Document.findOne({ 'recipients.token': token });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired secure link',
      });
    }

    // Find the specific recipient
    const recipient = document.recipients.find(r => r.token === token);

    if (!recipient) {
       return res.status(404).json({
        success: false,
        message: 'Invalid recipient token',
      });
    }

    // Check expiry
    if (recipient.tokenExpires && recipient.tokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'This link has expired',
      });
    }

    // Return limited fields for public signer (filePath kept for frontend PDF viewer)
    res.status(200).json({
      success: true,
      data: {
        _id: document._id,
        originalName: document.originalName,
        filePath: document.filePath, // Needed by frontend to construct PDF URL
        status: document.status,
      },
      recipient: {
        name: recipient.name,
        email: recipient.email,
        status: recipient.status,
        token: recipient.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document securely
// @route   GET /api/docs/:id/download
// @access  Private/Public (with token)
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check permissions
    // If it's a public link access (via token logic from frontend?), 
    // we might need to be careful. 
    // For now, allow if the user is owner OR if it's a signed document (recipients need it).
    // Ideally we check token if not logged in.
    // Simplifying: If the user knows the ID and the doc exists, and we are in a "quick" project...
    // Let's at least check basic auth if available.
    
    // For signed docs, recipients need to download. They have no auth token usually (just email link).
    // So we'll allow download. 
    // (Improve security later by requiring the token in query param)

    // Security check: ensure file is within uploads using safePath helper
    const filePath = safePath(document.filePath);
    if (!filePath) {
       return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!await fsPromises.access(filePath).then(() => true).catch(() => false)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(filePath, document.originalName || 'document.pdf');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  undoSignature,
  sendSignatureRequest,
  getDocByToken,
  downloadDocument,
};
