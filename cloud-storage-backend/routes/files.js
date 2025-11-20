const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT "gatekeeper" middleware
const File = require('../models/File'); // File metadata model

const { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize the S3 Client
// This uses the environment variables (AWS_ACCESS_KEY_ID, etc.)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * @route   GET /api/files
 * @desc    Get all files for the logged-in user
 * @access  Private
 */
router.get('/', auth, async (req, res) => { 
  try {
    // Find files where the owner matches the logged-in user's ID
    const files = await File.find({ owner: req.user.id }).sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/files/generate-upload-url
 * @desc    Get a pre-signed URL for uploading a file to S3
 * @access  Private
 */
router.post('/generate-upload-url', auth, async (req, res) => { 
  const { filename, filetype } = req.body; //
  const userId = req.user.id; //

  // Create a unique S3 key for the file
  const s3Key = `uploads/${userId}/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({ 
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: filetype,
  });

  try {
    // Generate the pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ uploadUrl, s3Key });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/files/finalize-upload
 * @desc    Save the file metadata to MongoDB after S3 upload is complete
 * @access  Private
 */
router.post('/finalize-upload', auth, async (req, res) => { 
  const { originalFilename, s3Key, mimetype, fileSize } = req.body; 

  try {
    // Create new file document in MongoDB 
    const newFile = new File({
      originalFilename,
      s3Key,
      mimetype,
      fileSize,
      owner: req.user.id, // Link to the logged-in user
    });

    await newFile.save();
    res.json(newFile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file (from S3 and MongoDB)
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => { 
  try {
    // 1. Find the file metadata in MongoDB
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // 2. Check if the logged-in user is the owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // 3. Create a command to delete the object from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key,
    });
    await s3Client.send(deleteCommand);

    // 4. If S3 delete is successful, delete metadata from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.json({ msg: 'File deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// backend endpoint for download button.
/**
 * @route   GET /api/files/download/:id
 * @desc    Get a pre-signed URL for downloading a file
 * @access  Private
 */
router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // Check if user is the owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key,
    });

    // Generate a pre-signed URL for download, valid for 15 minutes
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    res.json({ downloadUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;