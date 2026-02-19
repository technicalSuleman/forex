const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * @swagger
 * components:
 *   schemas:
 *     KYCDocuments:
 *       type: object
 *       properties:
 *         frontId:
 *           type: string
 *           description: URL of the front side of ID card
 *         backId:
 *           type: string
 *           description: URL of the back side of ID card
 *         selfie:
 *           type: string
 *           description: URL of the selfie with ID
 *     KYCSubmission:
 *       type: object
 *       required:
 *         - fullName
 *         - idNumber
 *         - address
 *         - documents
 *       properties:
 *         fullName:
 *           type: string
 *         idNumber:
 *           type: string
 *         address:
 *           type: string
 *         documents:
 *           $ref: '#/components/schemas/KYCDocuments'
 *     KYCStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [not_started, pending, approved, rejected]
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         fullName:
 *           type: string
 *         idNumber:
 *           type: string
 *         address:
 *           type: string
 *         documents:
 *           $ref: '#/components/schemas/KYCDocuments'
 */

/**
 * @swagger
 * /api/kyc/{userId}:
 *   get:
 *     summary: Get user KYC status and details
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC status successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KYCStatus'
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const kycRef = db.ref(`users/${userId}/kyc`);
        const snapshot = await kycRef.once('value');

        if (snapshot.exists()) {
            res.json({ success: true, data: snapshot.val() });
        } else {
            res.json({
                success: true,
                data: {
                    status: 'not_started',
                    submittedAt: null,
                    approvedAt: null,
                    documents: {},
                }
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/kyc/{userId}:
 *   post:
 *     summary: Submit KYC documents for verification
 *     tags: [KYC]
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
 *             $ref: '#/components/schemas/KYCSubmission'
 *     responses:
 *       200:
 *         description: KYC documents submitted successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const kycData = req.body;

        if (!kycData.fullName || !kycData.idNumber || !kycData.documents) {
            const error = new Error('Full name, ID number, and documents are required');
            error.status = 400;
            throw error;
        }

        const kycRef = db.ref(`users/${userId}/kyc`);
        const submission = {
            ...kycData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await kycRef.set(submission);

        res.json({
            success: true,
            message: 'KYC documents submitted successfully',
            data: submission
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/kyc/{userId}/status:
 *   put:
 *     summary: Update KYC status (Admin only)
 *     tags: [KYC]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 */
router.put('/:userId/status', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            const error = new Error('Invalid status. Must be approved or rejected');
            error.status = 400;
            throw error;
        }

        const kycRef = db.ref(`users/${userId}/kyc`);
        const snapshot = await kycRef.once('value');

        if (!snapshot.exists()) {
            const error = new Error('KYC submission not found');
            error.status = 404;
            throw error;
        }

        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date().toISOString();
        } else if (status === 'rejected') {
            updateData.rejectionReason = reason || 'Documents did not meet requirements';
        }

        await kycRef.update(updateData);

        res.json({ success: true, message: `KYC status updated to ${status}` });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
