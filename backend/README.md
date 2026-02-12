# Forex AI Assistant - Backend Server

This is the backend server for the Forex AI Assistant application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Service Account Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Rename it to `serviceAccountKey.json`
5. Place it in the `backend/` folder

**⚠️ IMPORTANT**: Never commit `serviceAccountKey.json` to git!

### 3. Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
FIREBASE_DATABASE_URL=https://fyp-ai-assistant-b373d-default-rtdb.firebaseio.com
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### User Profile
- `GET /api/users/:userId/profile` - Get user profile
- `PUT /api/users/:userId/profile` - Update user profile

### User Stats
- `GET /api/users/:userId/stats` - Get user trading statistics

### Trading History
- `GET /api/users/:userId/trades?limit=50` - Get trading history

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore file
├── serviceAccountKey.json # Firebase service account (download from Firebase)
└── README.md             # This file
```

## Connecting Frontend to Backend

Update your frontend services to use the backend API:

```javascript
// Instead of direct Firebase calls
const API_BASE_URL = 'http://localhost:3000/api';

// Example: Get user profile
const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
const data = await response.json();
```

## Notes

- This backend uses Firebase Admin SDK (server-side)
- Frontend still uses Firebase Client SDK for authentication
- Backend handles all database operations
- You can add more endpoints as needed
