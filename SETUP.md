# NanoCloud Setup Guide

This guide will help you set up NanoCloud with MongoDB Atlas for user accounts and AWS S3 for file storage.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- AWS account with S3 access
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd cloud-storage-backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `cloud-storage-backend` directory:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your-nanocloud-bucket-name

# Google Gemini API (for AI summarization feature)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (for share links)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine for development)
3. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Set username and password
   - Grant "Read and write to any database" permission
4. Whitelist your IP:
   - Click "Network Access" → "Add IP Address"
   - For development, you can use `0.0.0.0/0` (allow from anywhere)
   - **⚠️ For production, restrict to your server's IP**
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `nanocloud`)

### 4. AWS S3 Setup

#### Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `nanocloud-storage-<your-name>`)
4. Select your region (e.g., `us-east-1`)
5. **Block Public Access**: Keep all checkboxes checked (files will be private)
6. Enable versioning (optional but recommended)
7. Create the bucket

#### Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Add users"
3. Set username (e.g., `nanocloud-api-user`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach policies directly"
7. Search and attach: `AmazonS3FullAccess` (or create custom policy with limited permissions)
8. Click through to create user
9. **Save Access Key ID and Secret Access Key** (you won't see them again!)

#### Custom IAM Policy (Recommended for Production)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

#### Configure CORS (Required for direct uploads)

In your S3 bucket settings:

1. Go to "Permissions" tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 5. Start Backend Server

```bash
npm start
```

You should see:
```
Connected to MongoDB
Backend listening on port 5000
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd cloud-storage-frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `cloud-storage-frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing the Setup

### 1. Test User Registration

1. Open `http://localhost:5173`
2. Click "Register"
3. Create an account with:
   - Username
   - Email
   - Password
4. You should be automatically logged in

### 2. Test File Upload

1. Click "Upload" button
2. Select a file
3. Wait for upload to complete
4. File should appear in your dashboard

### 3. Test Download Button

1. Click the three-dot menu on any file
2. Click "Download"
3. File should download to your computer

### 4. Test Share Button

1. Click the three-dot menu on any file
2. Click "Share"
3. Toggle "Share a public link" ON
4. Copy the generated link
5. You can share this link with anyone

### 5. Test Collaborator Sharing

1. Open Share modal
2. Enter another user's email (they must be registered)
3. Click "Invite"
4. They can now access the file

## Verification Checklist

- [ ] Backend starts without errors
- [ ] "Connected to MongoDB" appears in console
- [ ] Frontend loads at localhost:5173
- [ ] Can register a new user
- [ ] Can log in with credentials
- [ ] Can upload a file
- [ ] Can download a file
- [ ] Can generate a share link
- [ ] Can see files in S3 bucket (check AWS console)
- [ ] Can see user data in MongoDB Atlas (check database)

## Common Issues & Solutions

### Backend won't start

**Error: `MONGO_URI is not defined`**
- Check that `.env` file exists in `cloud-storage-backend`
- Verify `MONGO_URI` is set correctly
- Restart the server after adding environment variables

**Error: `MongoServerError: bad auth`**
- Check username and password in connection string
- Verify database user has correct permissions
- Make sure to replace `<password>` with actual password (no angle brackets)

**Error: `MongoNetworkError: connection refused`**
- Check that your IP is whitelisted in MongoDB Atlas
- Try using `0.0.0.0/0` for development

### File Upload Issues

**Upload fails immediately**
- Check AWS credentials in `.env`
- Verify S3 bucket name is correct
- Check IAM user has S3 permissions

**Upload gets stuck at 100%**
- Check CORS configuration in S3 bucket
- Verify `AllowedOrigins` includes your frontend URL

### Download Button Not Working

**Error: "Failed to get download URL"**
- Check that file exists in S3 bucket
- Verify AWS credentials have `s3:GetObject` permission
- Check backend console for detailed errors

**File downloads with wrong name**
- This is fixed in the latest version of FileCard.tsx
- Make sure to pull the latest changes

### Share Button Issues

**Error: "Failed to update public sharing"**
- Check backend is running
- Verify JWT token is valid (try logging out and back in)
- Check backend console for errors

**Public link doesn't work**
- Public share links require the `/api/sharing/public/:shareToken` endpoint
- Verify `FRONTEND_URL` is set in backend `.env`
- Link format should be: `http://localhost:5173/share/TOKEN`

## Production Deployment

### Backend (Heroku/Railway/Render)

1. Set all environment variables in your hosting platform
2. Update `FRONTEND_URL` to your production domain
3. Update MongoDB Atlas to whitelist your server's IP
4. Update S3 CORS to include production domain

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to your production backend URL
2. Deploy frontend
3. Update `FRONTEND_URL` in backend to match deployed URL
4. Update S3 CORS configuration

## Security Notes

⚠️ **Never commit `.env` files to Git**

- `.env` is already in `.gitignore`
- Use environment variables in production
- Rotate AWS keys regularly
- Use strong JWT secrets
- Enable MFA on AWS and MongoDB accounts

## Architecture Overview

```
Frontend (React + Vite)
    ↓
    JWT Authentication
    ↓
Backend (Express.js)
    ↓
    ├─→ MongoDB Atlas (User accounts, file metadata)
    └─→ AWS S3 (File storage with pre-signed URLs)
```

### How File Upload Works

1. Frontend requests pre-signed upload URL from backend
2. Backend generates S3 pre-signed URL (valid for 1 hour)
3. Frontend uploads file directly to S3 using pre-signed URL
4. Frontend notifies backend that upload is complete
5. Backend saves file metadata to MongoDB

### How File Download Works

1. User clicks Download button
2. Frontend requests download URL from backend (with JWT)
3. Backend verifies user owns the file
4. Backend generates S3 pre-signed download URL (valid for 15 minutes)
5. Frontend triggers browser download using the URL

### How Sharing Works

1. User toggles "Share a public link"
2. Backend generates unique share token
3. Backend saves `isPublic: true` and `shareToken` to file metadata
4. Anyone with the link can access via `/api/sharing/public/:shareToken`

## Support

If you encounter issues:

1. Check backend console for errors
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set
4. Ensure MongoDB Atlas and AWS are properly configured
5. Try the verification checklist above

For more help, open an issue on GitHub with:
- Error messages from console
- Steps to reproduce
- Your environment (OS, Node version, etc.)
