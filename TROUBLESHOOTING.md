# 🔧 NanoCloud Troubleshooting Guide

## Quick Diagnostics

Run through this checklist first:

### Backend Health Check

```bash
cd cloud-storage-backend

# Check if .env exists
ls -la .env

# Check if node_modules installed
ls node_modules | wc -l  # Should show many packages

# Try starting server
npm start
```

**Expected output:**
```
Connected to MongoDB
Backend listening on port 5000
```

### Frontend Health Check

```bash
cd cloud-storage-frontend

# Check if .env exists
ls -la .env

# Check if node_modules installed
ls node_modules | wc -l  # Should show many packages

# Try starting dev server
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Common Issues

### 🚫 Backend Won't Start

#### Issue: "Cannot find module 'dotenv'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd cloud-storage-backend
npm install
```

#### Issue: "MONGO_URI is not defined"

**Cause:** Missing or incorrect `.env` file

**Solution:**
```bash
# Check if .env exists
ls -la .env

# If missing, copy from example
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

Make sure your `MONGO_URI` looks like:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nanocloud
```

**Common mistakes:**
- Forgot to replace `<password>` with actual password
- Left angle brackets `<>` in the connection string
- Password contains special characters that need URL encoding
- Missing database name at the end

#### Issue: "MongoServerError: bad auth"

**Cause:** Wrong username or password

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Verify username matches
3. Click "Edit" on user → "Edit Password" → Set new password
4. Update `MONGO_URI` in `.env` with new password
5. Restart backend

#### Issue: "MongoNetworkError: connection refused"

**Cause:** IP not whitelisted in MongoDB Atlas

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
4. Wait 1-2 minutes for changes to apply
5. Restart backend

---

### 📁 File Upload Issues

#### Issue: Upload button doesn't work / No file dialog opens

**Cause:** Frontend issue, check browser console

**Solution:**
```bash
# Open browser console (F12)
# Look for errors

# Common fixes:
# 1. Restart frontend dev server
cd cloud-storage-frontend
npm run dev

# 2. Clear browser cache
# Ctrl+Shift+Delete (Chrome/Edge)
# Cmd+Shift+Delete (Mac)
```

#### Issue: Upload fails immediately with "Server error"

**Cause:** AWS credentials issue

**Solution:**

Check backend `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # Your actual key
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # Your actual secret
S3_BUCKET_NAME=your-actual-bucket-name
```

**Verify AWS credentials work:**
```bash
# Install AWS CLI (if not already installed)
# Mac: brew install awscli
# Ubuntu: sudo apt install awscli
# Windows: download from aws.amazon.com/cli

# Configure AWS CLI
aws configure
# Enter your AWS_ACCESS_KEY_ID
# Enter your AWS_SECRET_ACCESS_KEY
# Enter your AWS_REGION

# Test S3 access
aws s3 ls s3://your-bucket-name

# Should list files (or be empty if no files yet)
# If you get "Access Denied", your IAM user needs S3 permissions
```

#### Issue: Upload gets stuck at 100%

**Cause:** CORS not configured on S3 bucket

**Solution:**

1. Go to AWS S3 Console
2. Select your bucket
3. Click "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

7. Click "Save changes"
8. Try upload again

---

### 📥 Download Button Issues

#### Issue: "Failed to get download URL"

**Check backend console for detailed error:**

**Error: "File not found"**
- File was deleted from database but still shows in UI
- Solution: Refresh the page

**Error: "Not authorized"**
- Token expired or invalid
- Solution: Log out and log back in

**Error: "The specified key does not exist"**
- File exists in database but not in S3
- Check S3 bucket in AWS console
- File might have been manually deleted

#### Issue: Download button does nothing

**Cause:** JavaScript error

**Solution:**
```bash
# 1. Open browser console (F12)
# 2. Click download button
# 3. Check for errors

# Common fix: Update FileCard.tsx
cd cloud-storage-frontend
git pull origin main  # Get latest fixes
npm install
```

#### Issue: File downloads with wrong name

**Cause:** Old version of FileCard.tsx

**Solution:**
```bash
cd cloud-storage-frontend
git pull origin main
# Latest version includes proper filename handling
```

---

### 🔗 Share Button Issues

#### Issue: "Failed to update public sharing"

**Check:**
1. Backend is running
2. Token is valid (log out/in)
3. Backend console for errors

**Common backend errors:**

**"Cannot read property 'shareToken' of undefined"**
- File model doesn't have sharing fields
- Solution: Check `cloud-storage-backend/models/File.js` includes:
  ```javascript
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true },
  ```

#### Issue: Share link copied but doesn't work

**Cause:** Share link route not implemented or wrong format

**Check:**
1. Link format should be: `http://localhost:5173/share/TOKEN`
2. Backend has `/api/sharing/public/:shareToken` route
3. `FRONTEND_URL` is set in backend `.env`

---

### 🔐 Authentication Issues

#### Issue: "Invalid credentials" when logging in

**Cause:** Wrong email or password

**Solution:**
1. Try resetting password (if feature exists)
2. Register a new account
3. Check MongoDB Atlas → Browse Collections → users
   - Verify user exists
   - Email is stored correctly

#### Issue: "User already exists" when registering

**Cause:** Email already used

**Solution:**
- Try logging in instead
- Use a different email
- If testing, clear database:
  ```bash
  # In MongoDB Atlas
  # Collections → users → Delete all documents
  ```

#### Issue: Login works but immediately logs out

**Cause:** Token not being saved/retrieved correctly

**Solution:**

Check `tokenService.ts` exists in frontend:
```typescript
// cloud-storage-frontend/services/tokenService.ts
export const tokenService = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
};
```

Check browser storage:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Local Storage" → `http://localhost:5173`
4. Should see `token` key with JWT value

---

### 🎨 UI/Display Issues

#### Issue: Styles look broken / No colors

**Cause:** TailwindCSS not loaded

**Solution:**
```bash
cd cloud-storage-frontend
npm install
npm run dev
```

#### Issue: Icons not showing

**Cause:** Lucide React not installed

**Solution:**
```bash
cd cloud-storage-frontend
npm install lucide-react
```

---

## Advanced Debugging

### Enable Verbose Logging

**Backend:**
```javascript
// Add to cloud-storage-backend/index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

**Frontend:**
```typescript
// Check browser console
// All fetch requests should show in Network tab (F12)
```

### Check Database Contents

**MongoDB Atlas:**
1. Go to your cluster
2. Click "Browse Collections"
3. Check `users` collection - should have your user
4. Check `files` collection - should have uploaded files

**File metadata example:**
```json
{
  "_id": "...",
  "originalFilename": "document.pdf",
  "s3Key": "uploads/userId/timestamp-document.pdf",
  "mimetype": "application/pdf",
  "fileSize": 12345,
  "owner": "userId",
  "isPublic": false,
  "uploadDate": "2024-01-01T00:00:00.000Z"
}
```

### Check S3 Bucket

**AWS Console:**
1. Go to S3 console
2. Open your bucket
3. Should see `uploads/` folder
4. Inside should be folders named by userId
5. Inside those should be your files

**File path example:**
```
s3://your-bucket/
  └─ uploads/
      └─ 507f1f77bcf86cd799439011/  (userId)
          ├─ 1703001234567-document.pdf
          └─ 1703001345678-image.png
```

---

## Still Having Issues?

### Collect Debug Information

1. **Backend console output** (copy entire output)
2. **Frontend browser console** (F12 → Console tab, copy errors)
3. **Network requests** (F12 → Network tab, check failed requests)
4. **Environment variables** (without secrets!):
   ```bash
   # Backend
   echo "MONGO_URI exists: $([ -n "$MONGO_URI" ] && echo yes || echo no)"
   echo "AWS_REGION: $AWS_REGION"
   echo "S3_BUCKET_NAME: $S3_BUCKET_NAME"
   
   # Frontend
   echo "VITE_API_URL: $VITE_API_URL"
   ```

### Open GitHub Issue

Go to: https://github.com/uditplayz/nanocloud/issues/new

Include:
- What you were trying to do
- What happened instead
- Debug information from above
- Steps to reproduce

---

## Prevention Checklist

Before starting development:

- [ ] MongoDB Atlas cluster is running
- [ ] IP is whitelisted in MongoDB
- [ ] AWS S3 bucket exists and is accessible
- [ ] IAM user has S3 permissions
- [ ] CORS configured on S3 bucket
- [ ] Both `.env` files exist and are filled out
- [ ] `npm install` ran successfully in both directories
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register and login
- [ ] Can upload a test file
- [ ] Can download the test file
- [ ] Can share the test file

---

**Last Updated:** November 2024

For more help, see [SETUP.md](./SETUP.md) or open an issue on GitHub.
