require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("Testing email with user:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "System Test - Email Configuration",
    text: "If you are reading this, your Nodemailer configuration is working properly on the local machine."
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("❌ EMAIL TEST FAILED:", error.message);
    } else {
        console.log("✅ EMAIL TEST SUCCESSFUL:", info.response);
    }
});
