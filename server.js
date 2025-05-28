require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes will be defined here
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
// Import routes
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');

// Routes to be implemented
// app.use('/api/animals', require('./routes/animals'));
// app.use('/api/health', require('./routes/health'));
// app.use('/api/feeding', require('./routes/feeding'));
// app.use('/api/adoption', require('./routes/adoption'));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', reportsRoutes);
app.use('/api', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});