const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Optional for external signers
    },
    signerName: {
      type: String,
      required: true, // Always required (either User.name or Recipient.name)
    },
    signerEmail: {
      type: String,
      required: true, // Always required (either User.email or Recipient.email)
    },
    signerType: {
      type: String,
      enum: ['User', 'Recipient'],
      default: 'User',
    },
    signatureText: {
      type: String,
      default: null,
    },
    signatureImage: {
      type: String, // Base64 encoded image
      default: null,
    },
    signatureImagePath: {
      type: String,
      default: null,
    },
    coordinates: {
      x: {
        type: Number,
        required: [true, 'X coordinate is required'],
      },
      y: {
        type: Number,
        required: [true, 'Y coordinate is required'],
      },
      page: {
        type: Number,
        required: [true, 'Page number is required'],
        min: [0, 'Page number must be 0 or greater'],
      },
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Signature', signatureSchema);
