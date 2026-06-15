require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const nodemailer = require('nodemailer');

console.log("Testing email with user:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
                    lookup: (hostname, options, callback) => {
                        dns.lookup(hostname, { family: 4 }, callback);
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
