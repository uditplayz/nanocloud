# ☁️ NanoCloud

A feature-rich cloud storage application built with React, Node.js, MongoDB Atlas, and AWS S3. Upload, share, and manage your files with ease!

**Part of internship @ Elevate Labs**

## ✨ Features

- **🔐 Secure Authentication** - JWT-based login and registration
- **☁️ File Storage** - Upload and store files securely on AWS S3
- **📥 Download Files** - One-click download with pre-signed URLs
- **🔗 Share Files** - Generate public share links or invite collaborators
- **👥 Collaboration** - Share files with specific users (view/edit permissions)
- **🤖 AI Summarization** - Get AI-powered summaries of documents (powered by Google Gemini)
- **📁 Folder Organization** - Organize files in folders
- **🎨 Modern UI** - Clean, responsive interface with dark mode

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Lucide React for icons

### Backend
- Node.js + Express.js
- MongoDB Atlas for database
- AWS S3 for file storage
- JWT for authentication
- bcryptjs for password hashing

### Cloud Services
- **MongoDB Atlas** - User accounts and file metadata
- **AWS S3** - Scalable file storage
- **Google Gemini AI** - Document summarization

## 🚀 Quick Start

See **[SETUP.md](./SETUP.md)** for complete setup instructions including:

- MongoDB Atlas configuration
- AWS S3 bucket setup
- IAM user creation
- Environment variables
- Common troubleshooting

### Quick Setup (TL;DR)

```bash
# Backend
cd cloud-storage-backend
npm install
# Create .env with MONGO_URI, AWS credentials, JWT_SECRET
npm start

# Frontend
cd cloud-storage-frontend
npm install
# Create .env with VITE_API_URL
npm run dev
```

## 📝 Recent Updates

✅ **Fixed Download Button** - Now properly downloads files from S3 with loading states and error handling

✅ **Fixed Share Functionality** - Share modal now uses real backend API instead of mocks

✅ **Improved Error Handling** - Better user feedback for authentication and API errors

✅ **Token Management** - Consistent token handling across all API calls

## 📚 Documentation

- [Complete Setup Guide](./SETUP.md)
- [Backend API Reference](./cloud-storage-backend/README.md) _(coming soon)_
- [Frontend Components](./cloud-storage-frontend/README.md)

## 🔒 Security

- All passwords are hashed using bcryptjs
- JWT tokens expire after 3 hours
- AWS S3 files are private by default
- Pre-signed URLs expire after 15 minutes (download) or 1 hour (upload)
- MongoDB Atlas with IP whitelisting
- CORS protection on S3 bucket

## 🎯 Architecture

```
Frontend (React)
    ↓ JWT Auth
Backend (Express)
    ├─→ MongoDB Atlas (metadata)
    └─→ AWS S3 (file storage)
```

## 📸 Screenshots

_(Coming soon)_

## 🤝 Contributing

This project is part of an internship at Elevate Labs. Contributions and suggestions are welcome!

## 📝 License

MIT License - feel free to use this project for learning purposes.

## 👨‍💻 Author

**Udit Jain**
- GitHub: [@uditplayz](https://github.com/uditplayz)
- Location: Pune, India

---

Built with ❤️ during internship @ Elevate Labs
