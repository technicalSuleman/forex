const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.admin === true) {
        next();
    } else {
        // For now, if no role is set, we might allow it or block it.
        // Usually, you'd set custom claims for admins: admin.auth().setCustomUserClaims(uid, {admin: true})
        // Let's be less restrictive for now but provide the structure.
        if (process.env.SKIP_ADMIN_CHECK === 'true') {
            return next();
        }
        return res.status(403).json({ success: false, message: 'Requires Admin role' });
    }
};

module.exports = { verifyToken, isAdmin };
