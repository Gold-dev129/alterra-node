const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        customNote: String,
        image: String
    }],
    shippingDetails: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        deliveryMethod: {
            type: String,
            enum: ['delivery', 'pickup'],
            default: 'delivery'
        },
        address: String,
        city: String,
        zipCode: String,
        country: String
    },
    subtotal: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderNumber: {
        type: String,
        unique: true
    },
    paymentReference: {
        type: String
    }
}, { timestamps: true });

// Generate a random order number before saving
orderSchema.pre('save', function () {
    if (!this.orderNumber) {
        this.orderNumber = 'ALT-' + Math.floor(100000 + Math.random() * 900000);
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
