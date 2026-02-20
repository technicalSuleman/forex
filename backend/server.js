// Backend Server for Forex AI Assistant
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Firebase Admin
// Note: You need to download service account key from Firebase Console
// and save it as 'serviceAccountKey.json' in backend folder
let db;
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fyp-ai-assistant-b373d-default-rtdb.firebaseio.com"
  });
  db = admin.database();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.log('\n📝 Setup Instructions:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the downloaded file as "serviceAccountKey.json"');
  console.log('4. Place it in the backend folder');
  console.log('5. Restart the server\n');
  console.log('📖 For detailed guide, see: backend/FIREBASE_SETUP_GUIDE.md\n');
  process.exit(1);
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Forex AI Assistant Backend API', status: 'running' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User Profile Routes
app.get('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      res.json({ success: true, data: snapshot.val() });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    
    const userRef = db.ref(`users/${userId}`);
    await userRef.update({
      ...profileData,
      updatedAt: new Date().toISOString(),
    });
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User Stats Routes
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const statsRef = db.ref(`users/${userId}/stats`);
    const snapshot = await statsRef.once('value');
    
    if (snapshot.exists()) {
      res.json({ success: true, data: snapshot.val() });
    } else {
      res.json({ 
        success: true, 
        data: {
          balance: 0,
          profit: 0,
          winRate: 0,
          totalTrades: 0,
          winningTrades: 0,
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// News/Feed Routes (same data as frontend newsService)
app.get('/api/news', async (req, res) => {
  try {
    const category = req.query.category || '';
    const limit = parseInt(req.query.limit) || 50;
    const newsRef = db.ref('news');
    const snapshot = await newsRef.once('value');
    if (!snapshot.exists()) {
      return res.json({ success: true, data: [] });
    }
    const data = snapshot.val();
    let items = Object.keys(data)
      .map((key) => ({ id: key, ...data[key] }))
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    if (category && category !== 'All') {
      const norm = (s) => (s || '').replace(/\s/g, '');
      items = items.filter((item) => norm(item.pair) === norm(category));
    }
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Trading History Routes
app.get('/api/users/:userId/trades', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const tradesRef = db.ref(`users/${userId}/tradingHistory`);
    const snapshot = await tradesRef.once('value');
    
    if (snapshot.exists()) {
      const trades = snapshot.val();
      const tradesArray = Object.keys(trades)
        .map(key => ({ id: key, ...trades[key] }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
      
      res.json({ success: true, data: tradesArray });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
