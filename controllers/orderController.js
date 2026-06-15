const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const dns = require('dns');

exports.createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            user: req.user ? req.user._id : undefined,
            guestEmail: req.user ? undefined : req.body.shippingDetails?.email?.toLowerCase(),
            status: req.body.paymentReference ? 'Paid' : 'Pending',
            paymentNote: "Payment for delivery will be communicated when your order is ready for shipping. Delivery takes 1-2 weeks."
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

        const formatCurrency = (val) => '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const itemsList = order.items.map(item => {
            let itemImage = item.image;
            if (itemImage && !itemImage.startsWith('http')) {
                itemImage = `https://alterra-node.onrender.com${itemImage}`;
            }
            if (!itemImage || itemImage.includes('placeholder.png')) {
                itemImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200';
            }
            const waistInfo = item.waist ? `<br><b>Waist:</b> ${item.waist}` : '';
            const customNoteInfo = item.customNote ? `<br><b>Note:</b> <i>"${item.customNote}"</i>` : '';
            return `
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 15px 0; width: 80px; vertical-align: top;">
                  <img src="${itemImage}" alt="${item.name}" style="width: 70px; height: 95px; object-fit: cover; border-radius: 6px; border: 1px solid #eaeaea;" />
                </td>
                <td style="padding: 15px 10px; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <div style="font-size: 14px; font-weight: 600; color: #111111; margin-bottom: 4px;">${item.name}</div>
                  <div style="font-size: 12px; color: #666666; line-height: 1.5;">
                    <b>Size:</b> ${item.size} &nbsp;|&nbsp; <b>Color:</b> ${item.color}${waistInfo}${customNoteInfo}
                    <br><b>Qty:</b> ${item.quantity} @ ${formatCurrency(item.price)} each
                  </div>
                </td>
                <td style="padding: 15px 0; vertical-align: top; text-align: right; font-size: 14px; font-weight: 600; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            `;
        }).join('');

        const mailOptions = {
            from: `"ALTERRA STUDIO" <${process.env.EMAIL_USER}>`,
            to: order.shippingDetails.email,
            cc: process.env.EMAIL_USER, // CC Admin for tracking
            subject: `Order Confirmed - Order #${order.orderNumber}`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Confirmation - ALTERRA STUDIO</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  background-color: #f7f7f7;
                  color: #1a1a1a;
                  margin: 0;
                  padding: 0;
                  -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                  width: 100%;
                  background-color: #f7f7f7;
                  padding: 30px 10px;
                }
                .container {
                  max-width: 580px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border: 1px solid #e5e5e5;
                  border-radius: 0px;
                  overflow: hidden;
                }
                .header {
                  background-color: #111111;
                  padding: 35px 20px;
                  text-align: center;
                }
                .header h1 {
                  color: #ffffff;
                  font-family: 'Times New Roman', Times, serif;
                  font-size: 24px;
                  font-weight: 400;
                  letter-spacing: 5px;
                  margin: 0;
                  text-transform: uppercase;
                }
                .content {
                  padding: 40px 30px;
                }
                .greeting {
                  font-size: 20px;
                  font-weight: 600;
                  margin-bottom: 15px;
                  color: #111111;
                  font-family: 'Times New Roman', Times, serif;
                  font-style: italic;
                }
                .intro-text {
                  font-size: 14px;
                  line-height: 1.6;
                  color: #444444;
                  margin-bottom: 30px;
                }
                .info-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                  background-color: #fafafa;
                  border: 1px solid #eaeaea;
                }
                .info-table td {
                  padding: 15px 20px;
                  font-size: 13px;
                  vertical-align: top;
                  width: 50%;
                }
                .info-label {
                  font-weight: 700;
                  color: #888888;
                  text-transform: uppercase;
                  font-size: 11px;
                  letter-spacing: 1px;
                  display: block;
                  margin-bottom: 5px;
                }
                .info-value {
                  color: #111111;
                  font-weight: 500;
                }
                .section-title {
                  font-size: 14px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  border-bottom: 1px solid #111111;
                  padding-bottom: 6px;
                  margin-top: 30px;
                  margin-bottom: 15px;
                  color: #111111;
                }
                .totals-table {
                  width: 100%;
                  margin-top: 15px;
                  border-collapse: collapse;
                }
                .totals-table td {
                  padding: 8px 0;
                  font-size: 13px;
                  color: #555555;
                }
                .totals-table .total-row td {
                  font-size: 15px;
                  font-weight: 700;
                  color: #111111;
                  padding-top: 15px;
                  border-top: 1px solid #111111;
                }
                .address-box {
                  background-color: #fafafa;
                  border: 1px solid #eaeaea;
                  padding: 20px;
                  margin-top: 30px;
                }
                .address-title {
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-top: 0;
                  margin-bottom: 10px;
                  color: #888888;
                }
                .address-text {
                  font-size: 13px;
                  line-height: 1.6;
                  color: #333333;
                  margin: 0;
                }
                .policy-box {
                  background-color: #fff9f9;
                  border-left: 3px solid #ff4d4d;
                  padding: 15px 20px;
                  margin-top: 35px;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #555555;
                }
                .footer {
                  background-color: #111111;
                  padding: 40px 20px;
                  text-align: center;
                  font-size: 11px;
                  color: #777777;
                }
                .footer p {
                  margin: 5px 0;
                }
                .footer .tagline {
                  font-style: italic;
                  font-family: 'Times New Roman', Times, serif;
                  font-size: 14px;
                  color: #ffffff;
                  margin-bottom: 20px;
                  letter-spacing: 1px;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="header">
                    <h1>ALTERRA STUDIO</h1>
                  </div>
                  <div class="content">
                    <div class="greeting">Thank you for your order, ${order.shippingDetails.firstName}.</div>
                    <p class="intro-text">
                      We are pleased to confirm that your payment has been received and your order is currently being processed. A summary of your order and delivery details is provided below.
                    </p>

                    <table class="info-table">
                      <tr>
                        <td style="border-right: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea;">
                          <span class="info-label">Order Number</span>
                          <span class="info-value">#${order.orderNumber}</span>
                        </td>
                        <td style="border-bottom: 1px solid #eaeaea;">
                          <span class="info-label">Order Date</span>
                          <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-right: 1px solid #eaeaea;">
                          <span class="info-label">Payment Method</span>
                          <span class="info-value">Paystack</span>
                        </td>
                        <td>
                          <span class="info-label">Order Status</span>
                          <span class="info-value" style="color: #2e7d32; font-weight: bold;">${order.status}</span>
                        </td>
                      </tr>
                    </table>

                    <div class="section-title">Items Ordered</div>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${itemsList}
                    </table>

                    <table class="totals-table">
                      <tr>
                        <td>Subtotal</td>
                        <td style="text-align: right;">${formatCurrency(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td>Service Fees</td>
                        <td style="text-align: right;">${formatCurrency(order.totalServiceFees)}</td>
                      </tr>
                      <tr>
                        <td>Shipping</td>
                        <td style="text-align: right;">${order.shipping === 0 ? 'Free / Calculated Later' : formatCurrency(order.shipping)}</td>
                      </tr>
                      <tr class="total-row">
                        <td>Total Amount Paid</td>
                        <td style="text-align: right;">${formatCurrency(order.total)}</td>
                      </tr>
                    </table>

                    <div class="address-box">
                      <h4 class="address-title">Delivery Details</h4>
                      <p class="address-text">
                        <strong>Recipient:</strong> ${order.shippingDetails.firstName} ${order.shippingDetails.lastName}<br>
                        <strong>Method:</strong> ${order.shippingDetails.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}<br>
                        <strong>Address:</strong> ${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.state || ''} ${order.shippingDetails.zipCode || ''}, ${order.shippingDetails.country}<br>
                        <strong>Phone:</strong> ${order.shippingDetails.phone}
                      </p>
                    </div>

                    <div class="policy-box">
                      <strong>Important Notice:</strong>
                      <ul style="margin: 5px 0 0 15px; padding: 0;">
                        <li>Due to the exclusive and bespoke nature of our items, we maintain a strict <strong>No Refund / No Exchange Policy</strong>. Please verify your choices before final submission.</li>
                        <li>Standard custom order preparation and delivery takes <strong>1 to 2 weeks</strong>.</li>
                        <li>Our team will contact you directly via phone or email once your items are ready for shipping to coordinate and settle delivery logistics.</li>
                      </ul>
                    </div>
                  </div>
                  <div class="footer">
                    <p class="tagline">"Crafted for the bold, designed for the timeless."</p>
                    <p style="color: #999999;">© 2026 ALTERRA STUDIO. All rights reserved.</p>
                    <p style="color: #666666; font-size: 10px; margin-top: 10px;">Lagos, Nigeria | info@alterrastudio.com</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
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
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    lookup: (hostname, options, callback) => {
                        return dns.lookup(hostname, { ...options, family: 4 }, callback);
                    }
                });

                // Removed redundant transporter verification for speed
                const info = await transporter.sendMail(mailOptions);
                console.log('✅ CUSTOM EMAIL SENT SUCCESSFUL:', info.messageId);

                // Admin Phone Notification Email
                const adminMailOptions = {
                    from: `"ALTERRA SYSTEM" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `🚨 NEW ORDER: ${order.shippingDetails.firstName} - ₦${order.total.toFixed(2)}`,
                    text: `New order #${order.orderNumber} received!\n\nCustomer: ${order.shippingDetails.firstName} ${order.shippingDetails.lastName}\nTotal: ₦${order.total.toFixed(2)}\nItems:\n${order.items.map(i => `- ${i.quantity}x ${i.name} (${i.size}/${i.color}${i.waist ? '/' + i.waist : ''})`).join('\n')}\n\nPhone: ${order.shippingDetails.phone}\nEmail: ${order.shippingDetails.email}\nAddress: ${order.shippingDetails.address}, ${order.shippingDetails.city}`
                };
                await transporter.sendMail(adminMailOptions);
                console.log('✅ ADMIN NOTIFICATION SENT');

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
        const email = req.user.email.toLowerCase();
        
        // Link any previous guest orders (including legacy ones from before the update)
        await Order.updateMany(
            { 
                $or: [
                    { guestEmail: email },
                    { 'shippingDetails.email': { $regex: new RegExp('^' + email + '$', 'i') } }
                ],
                user: { $exists: false }
            },
            { $set: { user: req.user._id, guestEmail: undefined } }
        );

        const orders = await Order.find({
            $or: [
                { user: req.user._id },
                { guestEmail: email },
                { 'shippingDetails.email': { $regex: new RegExp('^' + email + '$', 'i') } }
            ]
        }).sort({ createdAt: -1 });

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
