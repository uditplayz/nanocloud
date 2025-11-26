require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const sharingRoutes = require('./routes/sharing');

const app = express();

// app.use(cors());
app.use(cors({
  origin: [
    'https://nanocloud.vercel.app',
    'http://localhost:5173'  // For local development
  ],
  credentials: true
}));
app.use(express.json());

// Optional Mongo connection if MONGO_URI is provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/sharing', sharingRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
