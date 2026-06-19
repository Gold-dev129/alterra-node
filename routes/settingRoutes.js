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
    try {
        const nodemailer = require('nodemailer');
        const dns = require('dns');

        const debugInfo = {
            hasUser: !!process.env.EMAIL_USER,
            hasPass: !!process.env.EMAIL_PASS,
            userLength: process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0,
            passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
            nodeEnv: process.env.NODE_ENV
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(400).json({
                status: 'fail',
                message: 'Credentials missing in environment variables on server',
                debugInfo
            });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            }
        });

        const mailOptions = {
            from: `"ALTERRA TEST" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Render Diagnostics Test",
            text: "This is a diagnostic email from the live Render server."
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: 'Email sent successfully from server',
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
