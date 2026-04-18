const Order = require('../models/Order');
const nodemailer = require('nodemailer');

exports.createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            user: req.user ? req.user._id : undefined,
            status: req.body.paymentReference ? 'Paid' : 'Pending'
        };
        const order = await Order.create(orderData);

        // REAL-TIME ALERT: Emit event to all connected clients (especially Admin)
        const io = req.app.get('io');
        if (io) {
            io.emit('newOrder', {
                message: 'NEW ORDER ALERT',
                orderNumber: order.orderNumber,
                amount: order.total
            });
        }

        // PREMIUM EMAILS: Automated Confirmation
        // This will be called asynchronously after the order is saved

        const itemsList = order.items.map(item =>
            `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <span>${item.quantity}x ${item.name} (${item.size}/${item.color})</span>
                <span>₦${(item.price * item.quantity).toFixed(2)}</span>
            </div>`
        ).join('');

        const mailOptions = {
            from: `"ALTERRA STUDIO" <${process.env.EMAIL_USER}>`,
            to: order.shippingDetails.email,
            cc: process.env.EMAIL_USER, // CC Admin for tracking
            subject: `Payment Received - Order #${order.orderNumber}`,
            html: `
                <div style="font-family: 'serif', 'Times New Roman'; padding: 40px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee;">
                    <h1 style="font-style: italic; border-bottom: 2px solid #000; padding-bottom: 20px; text-align: center;">ALTERRA STUDIO</h1>
                    
                    <p style="font-size: 18px; margin-top: 30px;">Hi <b>${order.shippingDetails.firstName}</b>,</p>
                    
                    <p>We have successfully received your payment of <b>₦${order.total.toFixed(2)}</b> on <b>${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</b>.</p>
                    
                    <p>Your order <b>#${order.orderNumber}</b> has been received and is now being prepared for you.</p>
                    
                    <div style="background: #fdfdfd; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #f0f0f0;">
                        <h3 style="margin-top: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; color: #888;">Order Details</h3>
                        ${itemsList}
                        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-weight: bold; font-size: 16px;">
                            <span>Total Paid</span>
                            <span>₦${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="font-size: 13px; color: #666; margin: 0;">
                            <b>Shipping Notice:</b> Delivery costs vary by location. Our studio will <b>call you directly</b> at <b>${order.shippingDetails.phone}</b> to confirm your final shipping fee and schedule.
                        </p>
                    </div>

                    <p style="font-style: italic; color: #444; text-align: center; margin-top: 40px;">"Crafted for the bold, designed for the timeless."</p>
                    
                    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 2px; margin: 0;">© 2026 ALTERRA CLOTHING BRAND</p>
                        <p style="font-size: 10px; color: #ccc; margin-top: 5px;">Lagos, Nigeria</p>
                    </div>
                </div>
            `
        };

        // PREMIUM EMAILS: Automated Confirmation
        const sendConfirmationEmail = async () => {
            console.log('--- 📧 EMAIL DEBUG START ---');
            console.log('📬 Recipient:', order.shippingDetails.email);
            console.log('👤 Sender User:', process.env.EMAIL_USER ? 'DEFINED' : 'MISSING');
            console.log('🔑 Sender Pass:', process.env.EMAIL_PASS ? 'DEFINED' : 'MISSING');
            console.log('📦 Items Count:', order.items?.length || 0);

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.error('❌ EMAIL ERROR: Missing credentials in .env file.');
                return;
            }

            try {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false, // use STARTTLS
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                // Removed redundant transporter verification for speed
                const info = await transporter.sendMail(mailOptions);
                console.log('✅ CUSTOM EMAIL SENT SUCCESSFUL:', info.messageId);
                console.log('--- 📧 EMAIL DEBUG END ---');
            } catch (err) {
                console.error('❌ EMAIL ERROR DETAIL:', err);
                if (err.message.includes('Invalid login') || err.message.includes('auth')) {
                    console.error('👉 TIP: Check your Gmail App Password. Ensure 2-Step Verification is ON and you generated an "App Password" (16 characters, no spaces).');
                }
            }
        };

        // Execute email sending
        sendConfirmationEmail();

        res.status(201).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteAllOrders = async (req, res) => {
    try {
        await Order.deleteMany({});
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
