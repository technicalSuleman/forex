const admin = require('firebase-admin');
require('dotenv').config();

let db;
try {
    const serviceAccount = require('../serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fyp-ai-assistant-b373d-default-rtdb.firebaseio.com"
        });
    }
    db = admin.database();
    console.log('✅ Firebase Admin initialized successfully in firebase.js');
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    process.exit(1);
}

module.exports = { admin, db };
