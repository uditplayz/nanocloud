const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalFilename: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Sharing fields
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
