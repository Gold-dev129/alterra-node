const express = require('express');
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Publicly accessible settings
router.get('/', settingController.getSettings);

router.get('/debug-env', (req, res) => {
    res.status(200).json({
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS,
        userLength: process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0,
        passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
        nodeEnv: process.env.NODE_ENV,
        emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : null
    });
});

router.get('/test-email-status', async (req, res) => {
    const debugInfo = {
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        sender: process.env.EMAIL_SENDER || 'onboarding@resend.dev',
        receiver: process.env.EMAIL_RECEIVER || 'alterraszn@gmail.com',
        nodeEnv: process.env.NODE_ENV
    };
    try {
        const { Resend } = require('resend');

        if (!process.env.RESEND_API_KEY) {
            return res.status(400).json({
                status: 'fail',
                message: 'RESEND_API_KEY is missing in environment variables on server',
                debugInfo
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const recipient = req.query.to || debugInfo.receiver;

        const info = await resend.emails.send({
            from: `"ALTERRA TEST" <${debugInfo.sender}>`,
            to: recipient,
            subject: "Render Diagnostics Test (Resend)",
            text: "This is a diagnostic email from the live Render server using Resend API."
        });

        res.status(200).json({
            status: 'success',
            message: 'Email sent successfully via Resend from server',
            info,
            debugInfo
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            stack: err.stack,
            debugInfo
        });
    }
});

// Admin only updates
router.patch('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), settingController.updateSetting);

module.exports = router;
