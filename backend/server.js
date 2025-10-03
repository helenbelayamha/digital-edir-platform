const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/requests', require('./routes/requests')); // Add this line
app.use('/api/contributions', require('./routes/contributions')); // Add this line
app.use('/api/events', require('./routes/events')); // Add this line
// // Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Digital Edir API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      groups: {
        create: 'POST /api/groups',
        list: 'GET /api/groups',
        myGroups: 'GET /api/groups/my-groups',
        single: 'GET /api/groups/:id',
        join: 'POST /api/groups/:id/join'
      },
      requests: {
        pending: 'GET /api/requests/pending',
        approve: 'PUT /api/requests/:id/approve',
        deny: 'PUT /api/requests/:id/deny'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('   AUTH ENDPOINTS:');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - Login user');
  console.log('   GET  /api/auth/me - Get user profile (requires auth)');
  console.log('   GROUP ENDPOINTS:');
  console.log('   POST /api/groups - Create new private group');
  console.log('   GET  /api/groups - Discover groups');
  console.log('   GET  /api/groups/my-groups - Get your groups');
  console.log('   GET  /api/groups/:id - Get group details');
  console.log('   POST /api/groups/:id/join - Request to join group');
  console.log('   REQUEST ENDPOINTS:');
  console.log('   GET  /api/requests/pending - Get pending requests');
  console.log('   PUT  /api/requests/:id/approve - Approve request');
  console.log('   PUT  /api/requests/:id/deny - Deny request');
  console.log('   GET  /api/health - Check API health');
});