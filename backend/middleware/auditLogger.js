const AuditLog = require('../models/AuditLog');

const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function
    res.send = function (data) {
      // Only log if request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Get IP address
        const ipAddress =
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip;

        // Create audit log entry
        AuditLog.create({
          documentId: req.body.documentId || req.params.docId || null,
          userId: req.user ? req.user._id : null,
          action: action,
          ipAddress: ipAddress,
          userAgent: req.headers['user-agent'],
          details: {
            method: req.method,
            path: req.path,
            body: { ...req.body, signatureImage: req.body.signatureImage ? '[IMAGE_DATA]' : null },
          },
        }).catch((err) => {
          console.error('Audit logging failed:', err);
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
