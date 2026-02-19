const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { upload } = require('../config/cloudinary');

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         push:
 *           type: boolean
 *         email:
 *           type: boolean
 *         sms:
 *           type: boolean
 *         tradeAlerts:
 *           type: boolean
 *         priceAlerts:
 *           type: boolean
 *         newsAlerts:
 *           type: boolean
 *         marketAnalysis:
 *           type: boolean
 *         systemUpdates:
 *           type: boolean
 */

/**
 * @swagger
 * /api/notifications/{userId}:
 *   get:
 *     summary: Get user notification preferences
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreferences'
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const notifRef = db.ref(`users/${userId}/notificationPreferences`);
        const snapshot = await notifRef.once('value');

        if (snapshot.exists()) {
            res.json({ success: true, data: snapshot.val() });
        } else {
            res.json({
                success: true,
                data: {
                    push: true,
                    email: true,
                    sms: false,
                    tradeAlerts: true,
                    priceAlerts: true,
                    newsAlerts: true,
                    marketAnalysis: true,
                    systemUpdates: true,
                }
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/{userId}:
 *   put:
 *     summary: Update user notification preferences
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;

        const notifRef = db.ref(`users/${userId}/notificationPreferences`);
        await notifRef.update({
            ...preferences,
            updatedAt: new Date().toISOString(),
        });

        res.json({ success: true, message: 'Notification preferences updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Notifications, Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({ success: true, url: req.file.path });
});

module.exports = router;
