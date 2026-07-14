const Order = require('../models/Order');
const { Resend } = require('resend');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Helper function to send email confirmation via Resend
const sendConfirmationEmailForOrder = async (order) => {
    console.log('--- 📧 EMAIL CONFIRMATION START ---');
    console.log('📬 Recipient:', order.shippingDetails.email);
    console.log('📦 Items Count:', order.items?.length || 0);

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ EMAIL ERROR: Missing RESEND_API_KEY in environment variables.');
        return;
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
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

        const htmlContent = `
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
                    <td style="text-align: right;">${order.shipping === 0 ? 'Free / Self Pickup' : formatCurrency(order.shipping)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Amount Paid</td>
                    <td style="text-align: right;">${formatCurrency(order.total)}</td>
                  </tr>
                </table>

                <div class="address-box">
                  <h4 class="address-title">Delivery Summary</h4>
                  <p class="address-text">
                    <strong>Method:</strong> ${order.shippingDetails.deliveryMethod === 'pickup' ? 'Self Pickup' : 'Home/Hostel Delivery'}<br>
                    ${order.shippingDetails.deliveryMethod === 'delivery' ? `
                      <strong>State/Region:</strong> ${order.shippingDetails.state || 'N/A'}<br>
                      <strong>Address/Location:</strong> ${order.shippingDetails.address || 'N/A'}, ${order.shippingDetails.city || ''}<br>
                      <strong>Delivery Status:</strong> Paid (₦${order.shipping.toLocaleString('en-NG')})<br>
                    ` : `
                      <strong>Pickup Location:</strong> Self Pickup at Alterra Studio Store<br>
                      <strong>Delivery Status:</strong> N/A (Self Pickup)<br>
                    `}
                    <strong>Recipient:</strong> ${order.shippingDetails.firstName} ${order.shippingDetails.lastName}<br>
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
        `;

        const sender = process.env.EMAIL_SENDER || 'onboarding@resend.dev';
        const receiver = process.env.EMAIL_RECEIVER || 'alterraszn@gmail.com';

        // Send confirmation to the customer
        const customerMailResult = await resend.emails.send({
            from: `"ALTERRA STUDIO" <${sender}>`,
            to: order.shippingDetails.email,
            cc: receiver,
            subject: `Order Confirmed - Order #${order.orderNumber}`,
            html: htmlContent
        });

        console.log('✅ CUSTOM EMAIL SENT SUCCESSFUL via Resend:', customerMailResult.data?.id || customerMailResult.error);

        // Admin Phone Notification Email
        const adminMailText = `New order #${order.orderNumber} received!\n\nCustomer: ${order.shippingDetails.firstName} ${order.shippingDetails.lastName}\nTotal: ₦${order.total.toFixed(2)}\nItems:\n${order.items.map(i => `- ${i.quantity}x ${i.name} (${i.size}/${i.color}${i.waist ? '/' + i.waist : ''})`).join('\n')}\n\nPhone: ${order.shippingDetails.phone}\nEmail: ${order.shippingDetails.email}\nAddress: ${order.shippingDetails.address}, ${order.shippingDetails.city}`;

        const adminMailResult = await resend.emails.send({
            from: `"ALTERRA SYSTEM" <${sender}>`,
            to: receiver,
            subject: `🚨 NEW ORDER: ${order.shippingDetails.firstName} - ₦${order.total.toFixed(2)}`,
            text: adminMailText
        });

        console.log('✅ ADMIN NOTIFICATION SENT via Resend:', adminMailResult.data?.id || adminMailResult.error);
        console.log('--- 📧 EMAIL CONFIRMATION END ---');
    } catch (err) {
        console.error('❌ RESEND EMAIL ERROR DETAIL:', err);
    }
};

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

        if (order.status === 'Paid') {
            sendConfirmationEmailForOrder(order);
        }

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
        // Self-healing: Check Paystack for recently created Pending orders (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const pendingOrders = await Order.find({ 
            status: 'Pending',
            createdAt: { $gte: oneDayAgo }
        });
        
        for (let order of pendingOrders) {
            try {
                const txData = await verifyPaystackPayment(order.orderNumber);
                if (txData && txData.status === 'success') {
                    order.status = 'Paid';
                    order.paymentReference = txData.reference || order.orderNumber;
                    await order.save();
                    console.log(`Self-healing (Admin): Order #${order.orderNumber} successfully updated to Paid`);
                    sendConfirmationEmailForOrder(order);
                }
            } catch (err) {
                console.error(`Self-healing error for order #${order.orderNumber}:`, err);
            }
        }

        const orders = await Order.find({ status: { $ne: 'Pending' } }).sort({ createdAt: -1 });
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

        // Self-healing: Check Paystack for recently created Pending orders for this user (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const pendingOrders = await Order.find({
            $or: [
                { user: req.user._id },
                { guestEmail: email },
                { 'shippingDetails.email': { $regex: new RegExp('^' + email + '$', 'i') } }
            ],
            status: 'Pending',
            createdAt: { $gte: oneDayAgo }
        });

        for (let order of pendingOrders) {
            try {
                const txData = await verifyPaystackPayment(order.orderNumber);
                if (txData && txData.status === 'success') {
                    order.status = 'Paid';
                    order.paymentReference = txData.reference || order.orderNumber;
                    await order.save();
                    console.log(`Self-healing (User): Order #${order.orderNumber} successfully updated to Paid`);
                    sendConfirmationEmailForOrder(order);
                }
            } catch (err) {
                console.error(`Self-healing error for order #${order.orderNumber}:`, err);
            }
        }

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
        const updateData = {};
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.isFulfilled !== undefined) updateData.isFulfilled = req.body.isFulfilled;

        const order = await Order.findByIdAndUpdate(req.params.id,
            updateData,
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

// Helper function to verify payment directly with Paystack API
const verifyPaystackPayment = (reference) => {
    return new Promise((resolve) => {
        const https = require('https');
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${encodeURIComponent(reference)}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status && parsed.data && parsed.data.status === 'success') {
                        resolve(parsed.data);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', () => { resolve(null); });
        req.end();
    });
};

// Custom controller to mark order as Paid on client-side success callback
exports.payOrder = async (req, res) => {
    try {
        const { paymentReference } = req.body;
        if (!paymentReference) {
            return res.status(400).json({
                status: 'fail',
                message: 'Payment reference is required'
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            });
        }

        if (order.status === 'Pending') {
            order.status = 'Paid';
            order.paymentReference = paymentReference;
            await order.save();

            // Emit real-time update alert
            const io = req.app.get('io');
            if (io) {
                io.emit('newOrder', {
                    message: 'NEW ORDER PAID ALERT',
                    orderNumber: order.orderNumber,
                    amount: order.total
                });
            }

            // Trigger Resend email sending asynchronously
            sendConfirmationEmailForOrder(order);
        }

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

// Webhook endpoint for background confirmations
exports.paystackWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('--- 🔔 Paystack Webhook Event Received ---', event?.event);

        if (event && event.event === 'charge.success') {
            const reference = event.data.reference;
            console.log('Success reference:', reference);

            // Double check validation with Paystack API directly (Prevents request spoofing)
            const txData = await verifyPaystackPayment(reference);
            if (txData) {
                // Find order by orderNumber OR paymentReference
                let order = await Order.findOne({
                    $or: [
                        { orderNumber: reference },
                        { paymentReference: reference }
                    ]
                });

                // Fallback: Check if email and amount match a pending order
                if (!order && txData.customer?.email) {
                    const amountInNgn = txData.amount / 100;
                    order = await Order.findOne({
                        status: 'Pending',
                        'shippingDetails.email': txData.customer.email.toLowerCase(),
                        total: amountInNgn
                    });
                }

                if (order && order.status === 'Pending') {
                    order.status = 'Paid';
                    order.paymentReference = reference;
                    await order.save();
                    console.log(`✅ Webhook updated order #${order.orderNumber} to Paid`);

                    // Emit real-time update alert
                    const io = req.app.get('io');
                    if (io) {
                        io.emit('newOrder', {
                            message: 'NEW ORDER PAID ALERT',
                            orderNumber: order.orderNumber,
                            amount: order.total
                        });
                    }

                    // Send emails
                    sendConfirmationEmailForOrder(order);
                }
            }
        }

        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(200).json({ status: 'success', message: err.message });
    }
};
