const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const File = require('../models/File');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * @route   POST /api/sharing/:fileId/public
 * @desc    Enable/disable public sharing for a file
 * @access  Private
 */
router.post('/:fileId/public', auth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    file.isPublic = isPublic;
    
    // Generate a public share token if enabling public access
    if (isPublic && !file.shareToken) {
      file.shareToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    }
    
    await file.save();
    
    res.json({
      isPublic: file.isPublic,
      publicLink: file.isPublic ? `${process.env.FRONTEND_URL}/share/${file.shareToken}` : null,
    });
  } catch (err) {
    console.error('Error toggling public link:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

/**
 * @route   POST /api/sharing/:fileId/collaborators
 * @desc    Add a collaborator to a file
 * @access  Private
 */
router.post('/:fileId/collaborators', auth, async (req, res) => {
  try {
    const { email, permission } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Find user by email
    const User = require('../models/User');
    const collaboratorUser = await User.findOne({ email });
    
    if (!collaboratorUser) {
      return res.status(404).json({ msg: 'User not found with this email address' });
    }
    
    // Check if trying to add yourself
    if (collaboratorUser._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot add yourself as a collaborator' });
    }
    
    // Check if already a collaborator
    const existingCollaborator = file.collaborators?.find(
      c => c.userId.toString() === collaboratorUser._id.toString()
    );
    
    if (existingCollaborator) {
      return res.status(400).json({ msg: 'User is already a collaborator' });
    }
    
    if (!file.collaborators) {
      file.collaborators = [];
    }
    
    file.collaborators.push({
      userId: collaboratorUser._id,
      email: collaboratorUser.email,
      permission: permission || 'view',
    });
    
    await file.save();
    
    res.json(file.collaborators);
  } catch (err) {
    console.error('Error adding collaborator:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

/**
 * @route   DELETE /api/sharing/:fileId/collaborators/:userId
 * @desc    Remove a collaborator from a file
 * @access  Private
 */
router.delete('/:fileId/collaborators/:userId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    file.collaborators = file.collaborators?.filter(
      c => c.userId.toString() !== req.params.userId
    ) || [];
    
    await file.save();
    
    res.json(file.collaborators);
  } catch (err) {
    console.error('Error removing collaborator:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/sharing/public/:shareToken
 * @desc    Get file info and download URL via public share token
 * @access  Public
 */
router.get('/public/:shareToken', async (req, res) => {
  try {
    const file = await File.findOne({ 
      shareToken: req.params.shareToken,
      isPublic: true 
    });
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found or not publicly shared' });
    }
    
    // Add ResponseContentDisposition to force download
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.originalFilename}"`,
    });
    
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    res.json({
      filename: file.originalFilename,
      size: file.fileSize,
      mimetype: file.mimetype,
      downloadUrl,
    });
  } catch (err) {
    console.error('Error fetching public file:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;