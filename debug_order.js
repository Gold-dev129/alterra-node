const mongoose = require('mongoose');
const Order = require('./models/Order');
const dotenv = require('dotenv');

dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alterra');
        console.log('Connected to DB');

        const sampleData = {
            items: [{
                product: new mongoose.Types.ObjectId(),
                name: "Test Product",
                price: 1000,
                quantity: 1,
                size: "M",
                color: "Black"
            }],
            shippingDetails: {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                phone: "1234567890",
                deliveryMethod: "delivery",
                address: "123 Street",
                city: "Lagos",
                country: "Nigeria"
            },
            subtotal: 1000,
            shipping: 0,
            total: 1000
        };

        const order = await Order.create(sampleData);
        console.log('Order created successfully:', order.orderNumber);
    } catch (err) {
        console.error('Error creating order:', err.message);
        console.error(err.stack);
    } finally {
        await mongoose.disconnect();
    }
}

test();
