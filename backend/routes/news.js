const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the news post
 *         title:
 *           type: string
 *           description: The title of the news
 *         content:
 *           type: string
 *           description: The detailed content of the news
 *         author:
 *           type: string
 *           description: The author of the news
 *         category:
 *           type: string
 *           description: Category of the news (e.g., Forex, Market, Analysis)
 *         imageUrl:
 *           type: string
 *           description: URL of the news image
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Returns the list of all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: The list of news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 */
router.get('/', async (req, res, next) => {
    try {
        const newsRef = db.ref('news');
        const snapshot = await newsRef.once('value');
        const news = [];
        snapshot.forEach((childSnapshot) => {
            news.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        // Sort by createdAt descending
        news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get news by id
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The news id
 *     responses:
 *       200:
 *         description: The news details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: News not found
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const newsRef = db.ref(`news/${id}`);
        const snapshot = await newsRef.once('value');

        if (snapshot.exists()) {
            res.json({ success: true, data: { id: snapshot.key, ...snapshot.val() } });
        } else {
            const error = new Error('News not found');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a new news post
 *     tags: [News]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       201:
 *         description: The news was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', async (req, res, next) => {
    try {
        const { title, content, author, category, imageUrl } = req.body;

        if (!title || !content || !author) {
            const error = new Error('Title, content, and author are required');
            error.status = 400;
            throw error;
        }

        const newsRef = db.ref('news');
        const newNewsRef = newsRef.push();
        const newsData = {
            title,
            content,
            author,
            category: category || 'General',
            imageUrl: imageUrl || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await newNewsRef.set(newsData);
        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: { id: newNewsRef.key, ...newsData }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update a news post
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       200:
 *         description: News updated successfully
 *       404:
 *         description: News not found
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const newsRef = db.ref(`news/${id}`);
        const snapshot = await newsRef.once('value');

        if (!snapshot.exists()) {
            const error = new Error('News not found');
            error.status = 404;
            throw error;
        }

        await newsRef.update({
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        res.json({ success: true, message: 'News updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete a news post (Admin)
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       404:
 *         description: News not found
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const newsRef = db.ref(`news/${id}`);
        const snapshot = await newsRef.once('value');

        if (!snapshot.exists()) {
            const error = new Error('News not found');
            error.status = 404;
            throw error;
        }

        await newsRef.remove();
        res.json({ success: true, message: 'News deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
