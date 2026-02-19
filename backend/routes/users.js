const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/:userId/profile', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');

        if (snapshot.exists()) {
            res.json({ success: true, data: snapshot.val() });
        } else {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/:userId/profile', async (req, res, next) => {
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
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get('/:userId/stats', async (req, res, next) => {
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
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/trades:
 *   get:
 *     summary: Get user trading history
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of trades
 */
router.get('/:userId/trades', async (req, res, next) => {
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
        next(error);
    }
});

module.exports = router;
