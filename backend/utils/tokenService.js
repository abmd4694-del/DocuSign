const jwt = require('jsonwebtoken');

// Generate signature token for public access
const generateSignatureToken = (documentId, recipientEmail) => {
  return jwt.sign(
    { 
      documentId, 
      recipientEmail,
      type: 'signature_access'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify signature token
const verifySignatureToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'signature_access') {
      throw new Error('Invalid token type');
    }
    
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  generateSignatureToken,
  verifySignatureToken,
};
