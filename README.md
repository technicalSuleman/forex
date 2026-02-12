# Forex AI Assistant

React Native (Expo) mobile app with Node.js backend for Forex trading assistance.

## Project Structure

```
├── frontend/          # Expo React Native app
│   ├── app/           # Expo Router screens
│   ├── src/           # Screens, components, services (Firebase)
│   ├── components/
│   ├── assets/
│   └── ...
├── backend/           # Node.js Express + Firebase Admin API
│   ├── server.js
│   └── ...
├── database.rules.json
├── firebase.json
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
npm run install:all
```

Or manually:

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Firebase

- Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
- Enable **Authentication** (Email/Password)
- Enable **Realtime Database**
- Add Firebase config to `frontend/src/firebaseConfig.js`
- For backend: Download service account key → save as `backend/serviceAccountKey.json`
- See `backend/FIREBASE_SETUP_GUIDE.md` for details

### 3. Environment Variables

**Frontend** (`frontend/.env`):

```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Backend** (`backend/.env`):

```
PORT=3000
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4. Run

**Frontend (Expo app):**

```bash
npm run start:frontend
# or: cd frontend && npm start
```

**Backend API (optional – app uses Firebase client directly):**

```bash
npm run start:backend
# or: cd backend && npm start
```

## Features

- Auth (register, login, forgot password)
- Profile with avatar upload (Cloudinary)
- Dashboard, AI Analysis, Live Signals, News
- Settings: biometrics, 2FA, notifications, currency
- KYC submission, security audit log
