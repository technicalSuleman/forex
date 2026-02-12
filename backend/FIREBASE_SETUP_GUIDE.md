# 🔥 Firebase Service Account Key Setup Guide

## Step-by-Step Instructions

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **"fyp-ai-assistant-b373d"**

### Step 2: Navigate to Service Accounts
1. Click on **⚙️ Settings** icon (top left, next to "Project Overview")
2. Click **"Project settings"**
3. Click on **"Service accounts"** tab

### Step 3: Generate Private Key
1. You'll see "Firebase Admin SDK" section
2. Click the **"Generate new private key"** button
3. A popup will appear with a warning
4. Click **"Generate key"** to confirm
5. A JSON file will be downloaded automatically

### Step 4: Setup the Key File
1. The downloaded file will have a name like:
   ```
   fyp-ai-assistant-b373d-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
   ```

2. **Rename** this file to:
   ```
   serviceAccountKey.json
   ```

3. **Move** this file to your backend folder:
   ```
   C:\Users\US TECH\Desktop\Forex ai assistant\forexai\backend\serviceAccountKey.json
   ```

### Step 5: Create .env File
Create a `.env` file in the backend folder with:

```env
PORT=3000
FIREBASE_DATABASE_URL=https://fyp-ai-assistant-b373d-default-rtdb.firebaseio.com
```

### Step 6: Verify Setup
Your backend folder should look like:

```
backend/
├── server.js
├── package.json
├── .env                      ✅ (create this)
├── serviceAccountKey.json    ✅ (download from Firebase)
├── .gitignore
└── README.md
```

### Step 7: Start the Server
```bash
cd backend
npm start
```

You should see:
```
Firebase Admin initialized
🚀 Backend server running on http://localhost:3000
📡 API endpoints available at http://localhost:3000/api
```

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER** commit `serviceAccountKey.json` to git
2. **NEVER** share this file publicly
3. The `.gitignore` file already excludes it
4. This file gives full admin access to your Firebase project

## Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- Make sure the file is named exactly `serviceAccountKey.json`
- Make sure it's in the `backend/` folder
- Check file path: `C:\Users\US TECH\Desktop\Forex ai assistant\forexai\backend\serviceAccountKey.json`

### Error: "Firebase Admin initialization error"
- Check if the JSON file is valid (open it in a text editor)
- Make sure you downloaded the correct project's key
- Verify the FIREBASE_DATABASE_URL in `.env` matches your project

### Server starts but can't connect
- Check if port 3000 is already in use
- Try changing PORT in `.env` to 3001 or 3002
- Make sure firewall isn't blocking the port

## Quick Commands

```bash
# Install dependencies
cd backend
npm install

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Test if server is running
# Open browser: http://localhost:3000
```

## What This Key Does

The service account key allows your backend server to:
- ✅ Read/Write to Firebase Realtime Database
- ✅ Manage user data
- ✅ Access Firebase Admin features
- ✅ Bypass security rules (server-side only)

## Next Steps

After setup is complete:
1. ✅ Backend server running
2. ✅ Test API endpoints
3. ✅ Connect frontend to backend
4. ✅ Update frontend services to use HTTP calls instead of direct Firebase
