const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Signed', 'Rejected'],
      default: 'Pending',
    },
    signedFilePath: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    recipients: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, enum: ['Signer', 'Viewer'], default: 'Signer' },
        status: { type: String, enum: ['Pending', 'Signed', 'Rejected'], default: 'Pending' },
        order: { type: Number, default: 0 },
        token: { type: String, default: null },
        tokenExpires: { type: Date, default: null },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
