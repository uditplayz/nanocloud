require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const sharingRoutes = require('./routes/sharing');

// Ensure .env is loaded from the backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// app.use(cors());
app.use(cors({
  origin: [
    'https://nanocloud-frontend.vercel.app',
    'http://localhost:5173',  // For local development (Vite default)
    'http://localhost:3000'   // For local development (configured port)
  ],
  credentials: true
}));
app.use(express.json());

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  console.error('Please create a .env file in the cloud-storage-backend directory with MONGO_URI and JWT_SECRET');
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
}

// Optional Mongo connection if MONGO_URI is provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
  });
} else {
    console.warn('Running without MongoDB connection. Authentication features will fail.');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/sharing', sharingRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
