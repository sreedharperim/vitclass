const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const gradesRoutes = require('./routes/grades');
const messagesRoutes = require('./routes/messages');
const meRoutes = require('./routes/me');
const path = require('path');
const app = express();

const cors = require('cors');
app.use(cors({
  origin: ['https://sreedharperim.github.io', 'http://localhost:3000'],
  credentials: true
}));

// app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/grades', gradesRoutes);
// backend/server.js (near other app.use lines)
app.use('/api', messagesRoutes);          // existing: keeps older endpoints like /api/classes/:id/messages
app.use('/api/messages', messagesRoutes); // NEW: exposes /api/messages/my so frontend poll works
app.use('/api/me', meRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log('Backend listening on', PORT));
module.exports = app;
